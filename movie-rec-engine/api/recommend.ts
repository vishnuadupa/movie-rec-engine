import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectDB, Session }  from './_lib/mongodb'
import { getRecommendations }  from './_lib/gemini'
import { enrichWithTMDB }      from './_lib/tmdb'
import { buildPrompt }         from './_lib/promptBuilder'
import type { RecommendRequest } from './_lib/promptBuilder'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function setCORS(res: VercelResponse): void {
  const origin = process.env.FRONTEND_URL ?? 'http://localhost:5173'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function isValidRequest(body: unknown): body is RecommendRequest {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.userId   === 'string' && b.userId.trim().length > 0 &&
    typeof b.freeText === 'string' && b.freeText.trim().length > 0 &&
    Array.isArray(b.genres) &&
    Array.isArray(b.recentWatches)
  )
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  setCORS(res)

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  if (!isValidRequest(req.body)) {
    res.status(400).json({
      error:   'invalid_request',
      message: 'userId (string) and freeText (string) are required',
    })
    return
  }

  const request = req.body as RecommendRequest

  try {
    await connectDB()

    // Fetch last 5 sessions for prompt context
    const history = await Session
      .find({ userId: request.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    // Build prompt with history context
    const userPrompt = buildPrompt(request, history)

    // Call Gemini (with retry on 429)
    const geminiResponse = await getRecommendations(userPrompt)

    // Enrich with TMDB poster + rating data
    const enriched = await enrichWithTMDB(geminiResponse.recommendations)

    // Persist session to MongoDB
    const session = await Session.create({
      userId:    request.userId,
      expiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
      input: {
        mood:          request.mood,
        genres:        request.genres,
        recentWatches: request.recentWatches,
        freeText:      request.freeText,
      },
      recommendations: enriched.map(r => ({
        title:          r.title,
        year:           r.year,
        genres:         r.genres,
        synopsis:       r.synopsis,
        reasoning:      r.reasoning,
        moodMatchScore: r.moodMatchScore,
        tmdbId:         r.tmdbId,
        posterPath:     r.posterPath,
        rating:         r.rating,
      })),
    })

    res.status(200).json({
      sessionId:       String(session._id),
      recommendations: enriched,
    })
  } catch (err: unknown) {
    const error = err as Error & { status?: number }

    if (error.status === 429) {
      res.status(429).json({
        error:   'rate_limit',
        message: 'Too many requests, please try again in a moment',
      })
      return
    }

    res.status(500).json({ error: 'internal_error' })
  }
}
