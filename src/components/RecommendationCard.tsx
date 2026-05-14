import { useState } from 'react'
import type { Recommendation } from '../api/client'
import { cn } from '../utils/cn'

interface RecommendationCardProps {
  rec:   Recommendation
  index: number
}

export function RecommendationCard({ rec, index }: RecommendationCardProps) {
  const [imgError, setImgError] = useState(false)

  const scoreColor =
    rec.moodMatchScore >= 90 ? 'text-cinema-success' :
    rec.moodMatchScore >= 70 ? 'text-cinema-accent'  :
    'text-cinema-muted'

  return (
    <article
      className={cn(
        'group flex gap-4 p-4 rounded-card',
        'bg-cinema-surface border border-cinema-border',
        'hover:border-cinema-accent/40 hover:shadow-card-hover',
        'transition-all duration-200',
        'animate-in fade-in slide-in-from-bottom-2'
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      {/* Poster */}
      <div className="flex-shrink-0">
        {rec.posterUrl && !imgError ? (
          <img
            src={rec.posterUrl}
            alt={`${rec.title} poster`}
            width={80}
            height={120}
            className="w-20 h-[120px] object-cover rounded-md shadow-poster"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-[120px] rounded-md bg-cinema-elevated
            flex items-center justify-center border border-cinema-border">
            <span className="text-cinema-muted text-2xl">🎬</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {/* Title + year */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-display text-cinema-text text-lg leading-tight">
            {rec.title}
          </h3>
          <span className="text-cinema-muted text-sm flex-shrink-0">{rec.year}</span>
          {rec.rating && (
            <span className="text-cinema-muted text-xs flex-shrink-0 font-mono">
              ★ {rec.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Genre chips */}
        {rec.genres.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {rec.genres.slice(0, 3).map(g => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 rounded-chip
                  bg-cinema-elevated text-cinema-muted border border-cinema-border"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Mood match bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-0.5 bg-cinema-elevated rounded-full">
            <div
              className="h-0.5 bg-cinema-accent rounded-full transition-all duration-700"
              style={{ width: `${rec.moodMatchScore}%` }}
            />
          </div>
          <span className={cn('text-xs font-mono flex-shrink-0', scoreColor)}>
            {rec.moodMatchScore}% match
          </span>
        </div>

        {/* AI reasoning */}
        <p className="text-cinema-muted text-sm leading-relaxed line-clamp-4">
          {rec.reasoning}
        </p>
      </div>
    </article>
  )
}
