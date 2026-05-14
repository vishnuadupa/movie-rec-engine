import { cn } from '../utils/cn'

const MOODS = [
  'hopeful', 'melancholic', 'tense', 'joyful',
  'contemplative', 'adventurous', 'romantic', 'unsettled',
  'nostalgic', 'inspired', 'dark', 'lighthearted',
]

interface MoodSelectorProps {
  selected: string
  onChange: (mood: string) => void
}

export function MoodSelector({ selected, onChange }: MoodSelectorProps) {
  return (
    <div>
      <label className="block text-cinema-muted text-xs uppercase tracking-widest mb-3">
        Your mood
      </label>
      <div className="flex flex-wrap gap-2">
        {MOODS.map(mood => (
          <button
            key={mood}
            onClick={() => onChange(selected === mood ? '' : mood)}
            className={cn(
              'px-3 py-1.5 rounded-chip text-sm font-sans transition-all duration-150',
              'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinema-accent',
              selected === mood
                ? 'border-cinema-accent text-cinema-accent bg-cinema-accent/10'
                : 'border-cinema-border text-cinema-muted hover:border-cinema-accent/50 hover:text-cinema-text'
            )}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  )
}
