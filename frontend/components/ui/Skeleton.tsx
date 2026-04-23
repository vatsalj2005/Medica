export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-4 ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="card p-6 space-y-3">
          <SkeletonLine className="w-1/2" />
          <SkeletonLine className="w-1/4 h-8" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[#1e321e] px-6 py-4 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-[#1e321e] last:border-0 px-6 py-4 flex gap-6">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} className={`flex-1 ${j === 0 ? "w-1/4" : ""}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <SkeletonLine className="w-64 h-7" />
        <SkeletonLine className="w-40" />
      </div>
      <SkeletonStatCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <SkeletonLine className="w-40 h-5" />
          {[0, 1, 2].map(i => <SkeletonCard key={i} className="h-16" />)}
        </div>
        <div className="card p-6 space-y-4">
          <SkeletonLine className="w-40 h-5" />
          {[0, 1, 2].map(i => <SkeletonCard key={i} className="h-16" />)}
        </div>
      </div>
    </div>
  );
}
