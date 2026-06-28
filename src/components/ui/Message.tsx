import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorCardProps {
  title?: string
  message: string
  onRetry?: () => void
}

/** Inline error state for a single card or section. */
export function ErrorCard({ title = 'Something went wrong', message, onRetry }: ErrorCardProps) {
  return (
    <div className="card flex flex-col items-start gap-2 p-5" role="alert">
      <div className="flex items-center gap-2 text-fg">
        <AlertTriangle size={18} className="text-amber-400" />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm text-white"
        >
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  )
}
