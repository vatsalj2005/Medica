interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({ width, height, className = '' }: SkeletonProps) {
  const style = {
    width: width || '100%',
    height: height || '1rem',
  };

  return (
    <div
      style={style}
      className={`bg-border rounded shimmer ${className}`}
    />
  );
}

export function SkeletonRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton height="1rem" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-4 animate-fade-in">
      <Skeleton width="4rem" height="4rem" className="rounded-full mx-auto" />
      <Skeleton height="1rem" width="60%" className="mx-auto" />
      <Skeleton height="0.75rem" width="40%" className="mx-auto" />
    </div>
  );
}
