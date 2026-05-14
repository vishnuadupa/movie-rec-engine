export interface RecommendRequest {
  userId:        string
  mood:          string
  genres:        string[]
  recentWatches: string[]
  freeText:      string
}

export interface HistorySession {
  createdAt:       Date | string
  input:           { freeText: string }
  recommendations: Array<{ title: string }>
}

export function buildPrompt(
  request: RecommendRequest,
  history: HistorySession[]
): string {
  const { mood, genres, recentWatches, freeText } = request

  // Use last 3 sessions for context — enough signal without bloating tokens
  const recentHistory = history.slice(-3)

  let historyContext = ''
  if (recentHistory.length > 0) {
    const lines = recentHistory.map(session => {
      const date = new Date(session.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day:   'numeric',
      })
      const titles = session.recommendations
        .slice(0, 3)
        .map(r => r.title)
        .join(', ')
      return `- ${date}: asked for "${session.input.freeText}" → got: ${titles}`
    })

    historyContext = `\n\nThis user's recent sessions (avoid repeating recommendations, use to understand evolving taste):
${lines.join('\n')}`
  }

  const genreList        = genres.length > 0  ? genres.join(', ')        : 'no preference'
  const recentWatchList  = recentWatches.length > 0
    ? recentWatches.join(', ')
    : 'none provided'

  return `Current request:
- Mood: ${mood || 'not specified'}
- Preferred genres: ${genreList}
- Recently watched: ${recentWatchList}
- Specific ask: "${freeText}"${historyContext}

Generate exactly 5 movie recommendations. For each one:
1. Write reasoning that references SPECIFIC elements of this user's mood and request — themes, tone, pacing, emotional beats
2. Never recommend anything from their recently watched list
3. Be precise, not generic — "this film shares Interstellar's sense of cosmic loneliness" not "you might like this"
4. moodMatchScore should reflect how closely the film matches their EXACT request`
}
