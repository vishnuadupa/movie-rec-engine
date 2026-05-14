export function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading recommendations">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 p-4 rounded-card bg-cinema-surface border border-cinema-border"
        >
          {/* Poster skeleton */}
          <div className="w-20 h-[120px] rounded-md bg-cinema-elevated animate-pulse flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-5 bg-cinema-elevated rounded animate-pulse w-3/4" />
            <div className="flex gap-1.5">
              <div className="h-4 bg-cinema-elevated rounded-chip animate-pulse w-16" />
              <div className="h-4 bg-cinema-elevated rounded-chip animate-pulse w-12" />
            </div>
            <div className="h-0.5 bg-cinema-elevated rounded animate-pulse w-full" />
            <div className="h-3 bg-cinema-elevated rounded animate-pulse w-full" />
            <div className="h-3 bg-cinema-elevated rounded animate-pulse w-5/6" />
            <div className="h-3 bg-cinema-elevated rounded animate-pulse w-4/6" />
          </div>
        </div>
      ))}
      <p className="text-center text-cinema-muted text-sm pt-2">
        CineAI is curating your picks…
      </p>
    </div>
  )
}
