export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-card border border-line bg-surface p-6 text-sm text-ink-soft"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
      />
      {label}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-card border border-risk-high/30 bg-risk-high-bg p-6 text-sm text-risk-high"
    >
      <p className="font-medium">Couldn&apos;t load this data</p>
      <p className="mt-1 text-risk-high/90">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-card border border-risk-high/40 bg-white/60 px-3 py-1.5 text-xs font-medium text-risk-high hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-risk-high"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-line bg-paper/40 p-8 text-center">
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1 font-sans text-sm text-ink-soft">{description}</p>
      )}
    </div>
  );
}
