import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectDB, Session } from './_lib/mongodb'
import { getRecommendations } from './_lib/gemini'
import { enrichWithTMDB } from './_lib/tmdb'
import { buildPrompt } from './_lib/promptBuilder'
import type { RecommendRequest } from './_lib/promptBuilder'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function setCORS(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function isValidRequest(body: unknown): body is RecommendRequest {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return typeof b.userId === 'string' && b.userId.trim().length > 0 &&
    typeof b.freeText === 'string' && b.freeText.trim().length > 0 &&
    Array.isArray(b.genres) && Array.isArray(b.recentWatches)
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  setCORS(res)
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  if (!isValidRequest(req.body)) {
    res.status(400).json({ error: 'invalid_request', body: JSON.stringify(req.body) })
    return
  }
  const request = req.body as RecommendRequest
  try {
    await connectDB()
    const history = await Session.find({ userId: request.userId }).sort({ createdAt: -1 }).limit(5).lean()
    const userPrompt = buildPrompt(request, history as any)
    const geminiResponse = await getRecommendations(userPrompt)
    const enriched = await enrichWithTMDB(geminiResponse.recommendations)
    const session = await Session.create({
      userId: request.userId,
      expiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
      input: { mood: request.mood, genres: request.genres, recentWatches: request.recentWatches, freeText: request.freeText },
      recommendations: enriched.map(r => ({ title: r.title, year: r.year, genres: r.genres, synopsis: r.synopsis, reasoning: r.reasoning, moodMatchScore: r.moodMatchScore, tmdbId: r.tmdbId, posterPath: r.posterPath, rating: r.rating })),
    })
    res.status(200).json({ sessionId: String(session._id), recommendations: enriched })
  } catch (err: unknown) {
    const error = err as Error & { status?: number }
    console.error('RECOMMEND ERROR:', error.message, error.stack)
    if (error.status === 429) { res.status(429).json({ error: 'rate_limit' }); return }
    res.status(500).json({ error: 'internal_error', message: error.message })
  }
  }
