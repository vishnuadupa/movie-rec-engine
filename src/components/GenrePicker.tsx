import { cn } from '../utils/cn'

const GENRES = [
  'Drama', 'Sci-Fi', 'Thriller', 'Comedy',
  'Horror', 'Romance', 'Action', 'Animation',
  'Documentary', 'Crime', 'Fantasy', 'Mystery',
]

interface GenrePickerProps {
  selected: string[]
  onChange: (genre: string) => void
}

export function GenrePicker({ selected, onChange }: GenrePickerProps) {
  return (
    <div>
      <label className="block text-cinema-muted text-xs uppercase tracking-widest mb-3">
        Genres <span className="normal-case">(pick any)</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {GENRES.map(genre => {
          const isSelected = selected.includes(genre)
          return (
            <button
              key={genre}
              onClick={() => onChange(genre)}
              className={cn(
                'py-2 px-3 rounded-lg text-xs font-sans text-center transition-all duration-150',
                'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinema-accent',
                isSelected
                  ? 'border-cinema-accent text-cinema-accent bg-cinema-accent/10'
                  : 'border-cinema-border text-cinema-muted hover:border-cinema-accent/40 hover:text-cinema-text'
              )}
            >
              {genre}
            </button>
          )
        })}
      </div>
    </div>
  )
}
