import { describe, it, expect } from 'vitest'
import { buildPrompt } from '../_lib/promptBuilder.js'
import type { RecommendRequest, HistorySession } from '../_lib/promptBuilder.js'

const baseRequest: RecommendRequest = {
  userId:        'user-123',
  mood:          'melancholic but hopeful',
  genres:        ['drama', 'sci-fi'],
  recentWatches: ['Interstellar', 'Arrival'],
  freeText:      'something like Interstellar but more emotional',
}

describe('buildPrompt', () => {
  it('includes mood in prompt', () => {
    const prompt = buildPrompt(baseRequest, [])
    expect(prompt).toContain('melancholic but hopeful')
  })

  it('includes genres in prompt', () => {
    const prompt = buildPrompt(baseRequest, [])
    expect(prompt).toContain('drama, sci-fi')
  })

  it('includes recentWatches in prompt', () => {
    const prompt = buildPrompt(baseRequest, [])
    expect(prompt).toContain('Interstellar')
    expect(prompt).toContain('Arrival')
  })

  it('includes freeText in prompt', () => {
    const prompt = buildPrompt(baseRequest, [])
    expect(prompt).toContain('something like Interstellar but more emotional')
  })

  it('omits history section when no history', () => {
    const prompt = buildPrompt(baseRequest, [])
    expect(prompt).not.toContain('recent sessions')
  })

  it('includes history context when history provided', () => {
    const history: HistorySession[] = [
      {
        createdAt:       new Date('2025-05-01'),
        input:           { freeText: 'a quiet contemplative film' },
        recommendations: [{ title: 'Lost in Translation' }, { title: 'Her' }],
      },
    ]
    const prompt = buildPrompt(baseRequest, history)
    expect(prompt).toContain('recent sessions')
    expect(prompt).toContain('Lost in Translation')
    expect(prompt).toContain('Her')
  })

  it('uses only last 3 sessions when history > 3', () => {
    const history: HistorySession[] = Array.from({ length: 6 }, (_, i) => ({
      createdAt:       new Date(`2025-0${i + 1}-01`),
      input:           { freeText: `request ${i + 1}` },
      recommendations: [{ title: `Movie ${i + 1}` }],
    }))

    const prompt = buildPrompt(baseRequest, history)
    // Last 3 sessions — indices 3, 4, 5 → "request 4", "request 5", "request 6"
    expect(prompt).toContain('request 4')
    expect(prompt).toContain('request 5')
    expect(prompt).toContain('request 6')
    // Oldest sessions should NOT be present
    expect(prompt).not.toContain('request 1')
    expect(prompt).not.toContain('request 2')
    expect(prompt).not.toContain('request 3')
  })

  it('handles empty genres gracefully', () => {
    const req = { ...baseRequest, genres: [] }
    const prompt = buildPrompt(req, [])
    expect(prompt).toContain('no preference')
  })

  it('handles empty recentWatches gracefully', () => {
    const req = { ...baseRequest, recentWatches: [] }
    const prompt = buildPrompt(req, [])
    expect(prompt).toContain('none provided')
  })
})
