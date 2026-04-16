interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center mb-4 text-text-dim opacity-50">{icon}</div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-text-muted mb-6">{description}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium transition-all hover:shadow-glow-md hover:scale-105 active:scale-95 ripple"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
