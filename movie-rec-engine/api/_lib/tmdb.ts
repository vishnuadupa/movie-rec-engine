const TMDB_BASE   = 'https://api.themoviedb.org/3'
const POSTER_BASE = 'https://image.tmdb.org/t/p/w300'

interface TMDBSearchResult {
  id:             number
  title:          string
  release_date:   string
  poster_path:    string | null
  vote_average:   number
  overview:       string
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[]
}

export interface EnrichedRecommendation {
  title:          string
  year:           number
  genres:         string[]
  synopsis:       string
  reasoning:      string
  moodMatchScore: number
  tmdbId:         number | null
  posterPath:     string | null
  posterUrl:      string | null
  rating:         number | null
}

async function searchMovie(
  title: string,
  year: number,
  apiKey: string
): Promise<TMDBSearchResult | null> {
  const params = new URLSearchParams({
    api_key: apiKey,
    query:   title,
    year:    String(year),
  })

  const res = await fetch(`${TMDB_BASE}/search/movie?${params}`)
  if (!res.ok) return null

  const data = await res.json() as TMDBSearchResponse
  return data.results?.[0] ?? null
}

export async function enrichWithTMDB<T extends { title: string; year: number }>(
  recommendations: T[]
): Promise<Array<T & {
  tmdbId:     number | null
  posterPath: string | null
  posterUrl:  string | null
  rating:     number | null
}>> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    // Degrade gracefully — return recs without poster data
    return recommendations.map(r => ({
      ...r,
      tmdbId:     null,
      posterPath: null,
      posterUrl:  null,
      rating:     null,
    }))
  }

  const enriched = await Promise.allSettled(
    recommendations.map(async rec => {
      const result = await searchMovie(rec.title, rec.year, apiKey)
      return {
        ...rec,
        tmdbId:     result?.id ?? null,
        posterPath: result?.poster_path ?? null,
        posterUrl:  result?.poster_path ? `${POSTER_BASE}${result.poster_path}` : null,
        rating:     result?.vote_average ?? null,
      }
    })
  )

  return enriched.map((settled, i) => {
    if (settled.status === 'fulfilled') return settled.value
    // If TMDB lookup fails for one movie, degrade gracefully
    return {
      ...recommendations[i],
      tmdbId:     null,
      posterPath: null,
      posterUrl:  null,
      rating:     null,
    }
  })
}
