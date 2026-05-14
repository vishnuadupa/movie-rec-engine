import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 35_000, // 35s — slightly above Vercel maxDuration: 30
})

// Types
export interface RecommendPayload {
  userId:        string
  mood:          string
  genres:        string[]
  recentWatches: string[]
  freeText:      string
}

export interface Recommendation {
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

export interface RecommendResponse {
  sessionId:       string
  recommendations: Recommendation[]
}

export interface Session {
  sessionId:       string
  createdAt:       string
  input:           { mood: string; genres: string[]; recentWatches: string[]; freeText: string }
  recommendations: Recommendation[]
}

export interface HistoryResponse {
  sessions: Session[]
}

// API calls
export async function postRecommend(payload: RecommendPayload): Promise<RecommendResponse> {
  const res = await apiClient.post<RecommendResponse>('/recommend', payload)
  return res.data
}

export async function getHistory(userId: string, limit = 5): Promise<HistoryResponse> {
  const res = await apiClient.get<HistoryResponse>('/history', {
    params: { userId, limit },
  })
  return res.data
}

export async function deleteHistory(userId: string): Promise<void> {
  await apiClient.delete('/history', { params: { userId } })
}
