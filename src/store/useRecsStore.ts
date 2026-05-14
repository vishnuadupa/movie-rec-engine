import { create } from 'zustand'
import type { Recommendation, Session } from '../api/client'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface RecsState {
  // Input fields
  mood:          string
  genres:        string[]
  recentWatches: string[]
  freeText:      string

  // Results
  status:          Status
  recommendations: Recommendation[]
  errorMessage:    string | null
  currentSessionId: string | null

  // History
  history:        Session[]
  historyLoaded:  boolean

  // Actions
  setMood:          (mood: string) => void
  toggleGenre:      (genre: string) => void
  setRecentWatches: (watches: string[]) => void
  setFreeText:      (text: string) => void
  setLoading:       () => void
  setSuccess:       (recs: Recommendation[], sessionId: string) => void
  setError:         (message: string) => void
  setHistory:       (sessions: Session[]) => void
  clearHistory:     () => void
  reset:            () => void
}

const initialState = {
  mood:             '',
  genres:           [] as string[],
  recentWatches:    [] as string[],
  freeText:         '',
  status:           'idle' as Status,
  recommendations:  [] as Recommendation[],
  errorMessage:     null as string | null,
  currentSessionId: null as string | null,
  history:          [] as Session[],
  historyLoaded:    false,
}

export const useRecsStore = create<RecsState>(set => ({
  ...initialState,

  setMood: mood => set({ mood }),

  toggleGenre: genre =>
    set(state => ({
      genres: state.genres.includes(genre)
        ? state.genres.filter(g => g !== genre)
        : [...state.genres, genre],
    })),

  setRecentWatches: recentWatches => set({ recentWatches }),

  setFreeText: freeText => set({ freeText }),

  setLoading: () =>
    set({ status: 'loading', errorMessage: null, recommendations: [] }),

  setSuccess: (recommendations, sessionId) =>
    set({ status: 'success', recommendations, currentSessionId: sessionId }),

  setError: message =>
    set({ status: 'error', errorMessage: message }),

  setHistory: sessions =>
    set({ history: sessions, historyLoaded: true }),

  clearHistory: () =>
    set({ history: [], historyLoaded: true }),

  reset: () => set(initialState),
}))
