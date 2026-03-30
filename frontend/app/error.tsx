'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-md px-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          No se pudo conectar al servidor
        </h2>
        <p className="font-mono text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Verificá que el backend esté corriendo en{' '}
          <span style={{ color: 'var(--accent)' }}>localhost:4000</span>
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl font-mono text-sm font-medium cursor-pointer"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
