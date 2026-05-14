import { useState, type KeyboardEvent } from 'react'
import { cn } from '../utils/cn'

interface RecentWatchesInputProps {
  watches:  string[]
  onChange: (watches: string[]) => void
}

export function RecentWatchesInput({ watches, onChange }: RecentWatchesInputProps) {
  const [input, setInput] = useState('')

  function addWatch(): void {
    const trimmed = input.trim()
    if (!trimmed || watches.includes(trimmed)) {
      setInput('')
      return
    }
    onChange([...watches, trimmed])
    setInput('')
  }

  function removeWatch(title: string): void {
    onChange(watches.filter(w => w !== title))
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addWatch()
    }
    if (e.key === 'Backspace' && input === '' && watches.length > 0) {
      onChange(watches.slice(0, -1))
    }
  }

  return (
    <div>
      <label className="block text-cinema-muted text-xs uppercase tracking-widest mb-3">
        Recently watched
      </label>

      {/* Tag pills */}
      {watches.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {watches.map(title => (
            <span
              key={title}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip
                bg-cinema-elevated border border-cinema-border text-cinema-text text-xs"
            >
              {title}
              <button
                onClick={() => removeWatch(title)}
                className="text-cinema-muted hover:text-cinema-danger ml-0.5 leading-none
                  focus-visible:outline-none"
                aria-label={`Remove ${title}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addWatch}
        placeholder="Type a movie title, press Enter…"
        className={cn(
          'w-full px-3 py-2.5 rounded-lg text-sm font-sans',
          'bg-cinema-elevated border border-cinema-border',
          'text-cinema-text placeholder:text-cinema-muted',
          'focus:outline-none focus:border-cinema-accent transition-colors'
        )}
      />
      <p className="text-cinema-muted text-xs mt-1.5">
        Press Enter or comma to add
      </p>
    </div>
  )
}
