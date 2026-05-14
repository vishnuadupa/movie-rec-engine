import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getRecommendations } from '../_lib/gemini.js'

const mockRecs = {
  recommendations: [
    {
      title:          'Contact',
      year:           1997,
      genres:         ['Drama', 'Science Fiction'],
      synopsis:       'A scientist discovers a signal from deep space.',
      reasoning:      'Shares cosmic wonder with an emotional core.',
      moodMatchScore: 94,
    },
  ],
}

function makeGeminiResponse(body: unknown, status = 200): Response {
  return new Response(
    JSON.stringify({
      candidates: [
        {
          content: {
            parts: [{ text: JSON.stringify(body) }],
          },
        },
      ],
    }),
    { status }
  )
}

describe('getRecommendations', () => {
  const originalEnv = process.env.GEMINI_API_KEY

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key-123'
  })

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv
    vi.restoreAllMocks()
  })

  it('returns parsed recommendations on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeGeminiResponse(mockRecs)))
    const result = await getRecommendations('some prompt')
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0].title).toBe('Contact')
  })

  it('throws when GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY
    await expect(getRecommendations('prompt')).rejects.toThrow('GEMINI_API_KEY')
  })

  it('retries on 429 and eventually throws', async () => {
    const rateLimitRes = new Response('rate limited', { status: 429 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(rateLimitRes))
    vi.useFakeTimers()

    const promise = getRecommendations('prompt', 1)
    // Advance through retry backoff
    await vi.runAllTimersAsync()

    await expect(promise).rejects.toThrow('rate limit')
    vi.useRealTimers()
  })

  it('throws on non-429 API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('server error', { status: 500 })
    ))
    await expect(getRecommendations('prompt', 0)).rejects.toThrow('Gemini API error 500')
  })

  it('strips markdown fences from response', async () => {
    const withFences = {
      candidates: [{
        content: {
          parts: [{ text: '```json\n' + JSON.stringify(mockRecs) + '\n```' }],
        },
      }],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify(withFences), { status: 200 })
    ))
    const result = await getRecommendations('prompt', 0)
    expect(result.recommendations[0].title).toBe('Contact')
  })

  it('throws when response has empty recommendations array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      makeGeminiResponse({ recommendations: [] })
    ))
    await expect(getRecommendations('prompt', 0)).rejects.toThrow('missing recommendations')
  })
})
