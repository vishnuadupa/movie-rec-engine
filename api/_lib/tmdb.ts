const TMDB_BASE = 'https://api.themoviedb.org/3'
const POSTER_BASE = 'https://image.tmdb.org/t/p/w300'

export async function enrichWithTMDB<T extends { title: string; year: number }>(
  recommendations: T[]
): Promise<Array<T & { tmdbId: number|null; posterPath: string|null; posterUrl: string|null; rating: number|null }>> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return recommendations.map(r => ({ ...r, tmdbId: null, posterPath: null, posterUrl: null, rating: null }))

  const enriched = await Promise.allSettled(
    recommendations.map(async rec => {
      const params = new URLSearchParams({ api_key: apiKey, query: rec.title })
      const res = await fetch(`${TMDB_BASE}/search/movie?${params}`)
      const data = res.ok
        ? await res.json() as { results: Array<{ id: number; poster_path: string|null; vote_average: number }> }
        : { results: [] }
      const result = data.results?.[0] ?? null
      return {
        ...rec,
        tmdbId:     result?.id ?? null,
        posterPath: result?.poster_path ?? null,
        posterUrl:  result?.poster_path ? `${POSTER_BASE}${result.poster_path}` : null,
        rating:     result?.vote_average ?? null,
      }
    })
  )

  return enriched.map((s, i) =>
    s.status === 'fulfilled'
      ? s.value
      : { ...recommendations[i], tmdbId: null, posterPath: null, posterUrl: null, rating: null }
  )
}
