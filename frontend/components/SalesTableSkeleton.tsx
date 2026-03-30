export default function SalesTableSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header skeleton */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--surface-elevated)' }} />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-36 rounded" style={{ background: 'var(--surface-elevated)' }} />
              <div className="h-3 w-16 rounded" style={{ background: 'var(--surface-elevated)' }} />
            </div>
          </div>
          <div className="h-9 w-32 rounded-xl" style={{ background: 'var(--surface-elevated)' }} />
        </div>
      </header>

      {/* Table skeleton */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          {/* Header row */}
          <div
            className="px-6 py-4 flex gap-6"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {[140, 120, 80, 80, 70, 60].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded"
                style={{ background: 'var(--surface-elevated)', width: w }}
              />
            ))}
          </div>

          {/* Data rows */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="px-6 py-4 flex items-center gap-6"
              style={{ borderBottom: '1px solid var(--border)', opacity: 1 - row * 0.12 }}
            >
              {[140, 120, 80, 80, 70, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-4 rounded"
                  style={{
                    background: 'var(--surface-elevated)',
                    width: w,
                    animation: `skeletonPulse 1.5s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
