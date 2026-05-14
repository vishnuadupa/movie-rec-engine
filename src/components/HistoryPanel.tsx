import type { Session } from '../api/client'
import { cn } from '../utils/cn'

interface HistoryPanelProps {
  sessions:     Session[]
  onSelect:     (session: Session) => void
  onClear:      () => void
  isClearing:   boolean
}

export function HistoryPanel({
  sessions, onSelect, onClear, isClearing
}: HistoryPanelProps) {
  if (sessions.length === 0) return null

  return (
    <div className="border-t border-cinema-border pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-cinema-muted text-xs uppercase tracking-widest">
          Past sessions
        </h2>
        <button
          onClick={onClear}
          disabled={isClearing}
          className={cn(
            'text-cinema-muted text-xs hover:text-cinema-danger transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinema-danger',
            isClearing && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isClearing ? 'Clearing…' : 'Clear all'}
        </button>
      </div>

      <div className="space-y-2">
        {sessions.map(session => {
          const date = new Date(session.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day:   'numeric',
          })
          const topTitles = session.recommendations
            .slice(0, 2)
            .map(r => r.title)
            .join(', ')

          return (
            <button
              key={session.sessionId}
              onClick={() => onSelect(session)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg',
                'bg-cinema-elevated border border-cinema-border',
                'hover:border-cinema-accent/40 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinema-accent'
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-cinema-text text-xs truncate flex-1">
                  {session.input.freeText}
                </span>
                <span className="text-cinema-muted text-xs flex-shrink-0">{date}</span>
              </div>
              <p className="text-cinema-muted text-xs mt-0.5 truncate">
                {topTitles}…
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
