import { useEffect, useState } from 'react'
import { useRecsStore }        from './store/useRecsStore'
import { MoodSelector }        from './components/MoodSelector'
import { GenrePicker }         from './components/GenrePicker'
import { RecentWatchesInput }  from './components/RecentWatchesInput'
import { RecommendationCard }  from './components/RecommendationCard'
import { LoadingState }        from './components/LoadingState'
import { HistoryPanel }        from './components/HistoryPanel'
import { getUserId }           from './utils/userId'
import {
  postRecommend,
  getHistory,
  deleteHistory,
  type Session,
} from './api/client'
import { cn } from './utils/cn'

export default function App() {
  const store = useRecsStore()
  const [isClearing, setIsClearing] = useState(false)
  const [toast, setToast]           = useState<string | null>(null)

  // Load history on mount
  useEffect(() => {
    const userId = getUserId()
    getHistory(userId, 5)
      .then(res => store.setHistory(res.sessions))
      .catch(() => { /* silent — history is non-critical */ })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(message: string): void {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSubmit(): Promise<void> {
    if (!store.freeText.trim()) {
      showToast('Tell us what you\'re looking for')
      return
    }

    store.setLoading()

    try {
      const userId = getUserId()
      const res = await postRecommend({
        userId,
        mood:          store.mood,
        genres:        store.genres,
        recentWatches: store.recentWatches,
        freeText:      store.freeText,
      })

      store.setSuccess(res.recommendations, res.sessionId)

      // Refresh history
      const history = await getHistory(userId, 5)
      store.setHistory(history.sessions)
    } catch (err: unknown) {
      const e = err as { response?: { status: number } }
      const message =
        e.response?.status === 429
          ? 'Too many requests — please wait a moment and try again'
          : 'Something went wrong. Please try again.'
      store.setError(message)
      showToast(message)
    }
  }

  async function handleClearHistory(): Promise<void> {
    setIsClearing(true)
    try {
      await deleteHistory(getUserId())
      store.clearHistory()
      showToast('History cleared')
    } catch {
      showToast('Failed to clear history')
    } finally {
      setIsClearing(false)
    }
  }

  function handleSelectSession(session: Session): void {
    store.setSuccess(session.recommendations, session.sessionId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const canSubmit = store.status !== 'loading' && store.freeText.trim().length > 0

  return (
    <div className="min-h-screen bg-cinema-bg text-cinema-text font-sans">
      {/* Header */}
      <header className="border-b border-cinema-border px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-2xl text-cinema-text tracking-tight">
            Cine<span className="text-cinema-accent">AI</span>
          </h1>
          <p className="text-cinema-muted text-sm mt-0.5">
            Tell us your mood. Get films you'll actually love.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8
        grid grid-cols-1 md:grid-cols-[340px_1fr] gap-8">

        {/* ── Left: Input panel ── */}
        <aside className="space-y-6">
          <MoodSelector
            selected={store.mood}
            onChange={store.setMood}
          />

          <GenrePicker
            selected={store.genres}
            onChange={store.toggleGenre}
          />

          <RecentWatchesInput
            watches={store.recentWatches}
            onChange={store.setRecentWatches}
          />

          {/* Free text */}
          <div>
            <label
              htmlFor="freetext"
              className="block text-cinema-muted text-xs uppercase tracking-widest mb-3"
            >
              Describe what you want <span className="text-cinema-danger">*</span>
            </label>
            <textarea
              id="freetext"
              rows={3}
              value={store.freeText}
              onChange={e => store.setFreeText(e.target.value)}
              placeholder="e.g. Something like Interstellar but more emotional and less hard sci-fi…"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg text-sm font-sans resize-none',
                'bg-cinema-elevated border border-cinema-border',
                'text-cinema-text placeholder:text-cinema-muted',
                'focus:outline-none focus:border-cinema-accent transition-colors'
              )}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-sans font-medium text-sm',
              'transition-all duration-150 focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-cinema-accent',
              canSubmit
                ? 'bg-cinema-accent text-cinema-bg hover:bg-cinema-accent-dim'
                : 'bg-cinema-elevated text-cinema-muted cursor-not-allowed'
            )}
          >
            {store.status === 'loading' ? 'Finding films…' : 'Find my films'}
          </button>

          {/* History panel (desktop — inside left col) */}
          <div className="hidden md:block">
            <HistoryPanel
              sessions={store.history}
              onSelect={handleSelectSession}
              onClear={handleClearHistory}
              isClearing={isClearing}
            />
          </div>
        </aside>

        {/* ── Right: Results panel ── */}
        <section>
          {store.status === 'idle' && (
            <div className="flex flex-col items-center justify-center h-64
              text-cinema-muted text-center px-8">
              <span className="text-4xl mb-4">🎬</span>
              <p className="text-sm leading-relaxed">
                Tell us your mood and what you're looking for.<br />
                CineAI will find films that actually fit.
              </p>
            </div>
          )}

          {store.status === 'loading' && <LoadingState />}

          {(store.status === 'success' || store.status === 'error') &&
            store.recommendations.length > 0 && (
            <div className="space-y-4">
              <p className="text-cinema-muted text-xs uppercase tracking-widest">
                {store.recommendations.length} picks for you
              </p>
              {store.recommendations.map((rec, i) => (
                <RecommendationCard key={`${rec.title}-${i}`} rec={rec} index={i} />
              ))}
            </div>
          )}

          {store.status === 'error' && store.recommendations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64
              text-cinema-muted text-center px-8">
              <span className="text-4xl mb-4">⚠️</span>
              <p className="text-sm">{store.errorMessage}</p>
              <button
                onClick={() => store.reset()}
                className="mt-4 text-cinema-accent text-sm hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </section>

        {/* History panel (mobile — below results) */}
        <div className="md:hidden">
          <HistoryPanel
            sessions={store.history}
            onSelect={handleSelectSession}
            onClear={handleClearHistory}
            isClearing={isClearing}
          />
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
          'px-4 py-2.5 rounded-lg text-sm font-sans',
          'bg-cinema-surface border border-cinema-border text-cinema-text',
          'shadow-card-hover transition-all'
        )}>
          {toast}
        </div>
      )}
    </div>
  )
}
