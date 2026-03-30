'use client';

import { useState, useEffect } from 'react';
import { evaluateSale } from '@/lib/api';
import type { Sale } from '@/types/sale';

interface Props {
  sale: Sale;
  onClose: () => void;
  onEvaluated: (sale: Sale) => void;
}

export default function EvaluateModal({ sale, onClose, onEvaluated }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(sale.score ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const displayed = hovered ?? selected;

  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  async function handleSubmit() {
    if (selected === 0) {
      setError('Please select a score');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const updated = await evaluateSale(sale.id, selected);
      onEvaluated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,12,10,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--accent)' }}>
                Evaluate
              </p>
              <h2 className="text-xl font-serif font-bold" style={{ color: 'var(--text-primary)' }}>
                {sale.customer}
              </h2>
              <p className="text-sm font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {sale.product}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)', background: 'var(--surface-elevated)' }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--border)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'var(--surface-elevated)')}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Star Rating */}
        <div className="px-8 py-8">
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => { setSelected(n); setError(''); }}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer transition-transform"
                style={{ transform: displayed >= n ? 'scale(1.1)' : 'scale(1)' }}
                aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill={displayed >= n ? 'var(--star-color)' : 'none'}
                  stroke={displayed >= n ? 'var(--star-color)' : 'var(--border-strong)'}
                  strokeWidth="1.5"
                  style={{ transition: 'fill 0.15s, stroke 0.15s' }}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>

          <div className="text-center h-6">
            {displayed > 0 && (
              <p className="text-sm font-mono" style={{ color: 'var(--star-color)' }}>
                {labels[displayed]}
              </p>
            )}
          </div>

          {error && (
            <p className="text-center text-xs font-mono mt-2" style={{ color: '#dc2626' }}>
              {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-mono text-sm font-medium transition-colors cursor-pointer"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--border)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'var(--surface-elevated)')}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selected === 0}
            className="flex-1 py-3 rounded-xl font-mono text-sm font-medium transition-opacity cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              opacity: loading || selected === 0 ? 0.5 : 1,
              cursor: selected === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {loading && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {loading ? 'Saving…' : 'Save Score'}
          </button>
        </div>
      </div>
    </div>
  );
}
