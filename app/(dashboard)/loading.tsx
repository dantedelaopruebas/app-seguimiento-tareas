export default function Loading() {
  return (
    <>
      {/* Skeleton del topbar */}
      <header className="h-12 border-b border-border-subtle flex items-center px-5 shrink-0">
        <div className="h-3.5 w-24 bg-bg-elevated rounded animate-pulse" />
      </header>
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {/* Quick add */}
          <div className="h-11 bg-bg-subtle border border-border-subtle rounded-lg animate-pulse" />
          {/* Filas de tareas */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-[18px] h-[18px] rounded-full bg-bg-surface" />
              <div className="h-3 bg-bg-surface rounded" style={{ width: `${40 + Math.random() * 40}%` }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
