/** Shimmer placeholder shown while a card's data loads. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-2 ${className}`}
      aria-hidden="true"
    />
  )
}

/** Full-card loading state with a few skeleton lines. */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-5" aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-4 h-3 w-24" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="mb-2 h-4 w-full" />
      ))}
    </div>
  )
}
