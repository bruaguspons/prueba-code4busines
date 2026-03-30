'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSales } from '@/lib/api';
import type { Sale } from '@/types/sale';
import CreateSaleModal from './CreateSaleModal';
import EvaluateModal from './EvaluateModal';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

function Stars({ score }: { score: number | null }) {
  if (score === null) {
    return <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>—</span>;
  }
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={n <= score ? 'var(--star-color)' : 'none'}
          stroke={n <= score ? 'var(--star-color)' : 'var(--border-strong)'}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function SalesTable() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [evaluating, setEvaluating] = useState<Sale | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchSales = useCallback(async () => {
    try {
      const data = await getSales();
      setSales(data);
      setFetchError('');
    } catch {
      setFetchError('No se pudieron cargar las ventas. ¿Está el backend corriendo?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  function handleCreated(sale: Sale) {
    setSales((prev) => [sale, ...prev]);
    addToast('Venta creada exitosamente', 'success');
  }

  function handleEvaluated(updated: Sale) {
    setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    addToast('Puntaje guardado exitosamente', 'success');
  }

  const evaluated = sales.filter((s) => s.score !== null);
  const avgScore =
    evaluated.length > 0
      ? evaluated.reduce((sum, s) => sum + (s.score ?? 0), 0) / evaluated.length
      : null;

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(n);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      {/* Toast notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-5 py-3 rounded-xl shadow-lg font-mono text-sm flex items-center gap-2"
            style={{
              background: t.type === 'success' ? 'var(--accent)' : '#dc2626',
              color: '#fff',
              animation: 'toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {t.type === 'success' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            )}
            {t.message}
          </div>
        ))}
      </div>

      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Top bar */}
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
                  Registro de Ventas
                </h1>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {sales.length} {sales.length !== 1 ? 'registros' : 'registro'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-sm font-medium transition-opacity cursor-pointer"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nueva Venta
            </button>
          </div>
        </header>

        {/* Stats bar */}
        {sales.length > 0 && (
          <div style={{ background: 'var(--surface-elevated)', borderBottom: '1px solid var(--border)' }}>
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-8">
              <Stat
                label="Total vendido"
                value={formatAmount(sales.reduce((s, x) => s + x.amount, 0))}
              />
              <Stat label="Evaluadas" value={`${evaluated.length} / ${sales.length}`} />
              {avgScore !== null && (
                <Stat
                  label="Puntaje promedio"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Stars score={Math.round(avgScore)} />
                      <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {avgScore.toFixed(1)}
                      </span>
                    </span>
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <svg
                className="animate-spin"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: 'var(--accent)' }}
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>Cargando ventas…</p>
            </div>
          ) : fetchError ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}
            >
              <p className="font-mono text-sm" style={{ color: '#dc2626' }}>{fetchError}</p>
              <button
                onClick={fetchSales}
                className="mt-4 px-4 py-2 rounded-lg font-mono text-xs cursor-pointer"
                style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}
              >
                Reintentar
              </button>
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6M9 16h4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Sin ventas aún</p>
                <p className="font-mono text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Creá tu primera venta para comenzar</p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="px-5 py-2.5 rounded-xl font-mono text-sm font-medium cursor-pointer"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Crear venta
              </button>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Cliente', 'Producto', 'Monto', 'Fecha', 'Puntaje', 'Acciones'].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-xs font-mono tracking-wider uppercase"
                          style={{ color: 'var(--text-muted)', fontWeight: 500 }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, i) => (
                      <tr
                        key={sale.id}
                        style={{
                          borderBottom: i < sales.length - 1 ? '1px solid var(--border)' : undefined,
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--row-hover)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '')}
                      >
                        <td className="px-6 py-4">
                          <span className="font-serif font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {sale.customer}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {sale.product}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="font-mono text-sm font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: 'var(--amount-bg)', color: 'var(--accent)' }}
                          >
                            {formatAmount(sale.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(sale.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Stars score={sale.score} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setEvaluating(sale)}
                            className="px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-colors cursor-pointer"
                            style={{
                              background: 'var(--surface-elevated)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border)',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'var(--accent)';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.border = '1px solid var(--accent)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'var(--surface-elevated)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.border = '1px solid var(--border)';
                            }}
                          >
                            {sale.score !== null ? 'Re-evaluar' : 'Evaluar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {avgScore !== null && (
                    <tfoot>
                      <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--surface-elevated)' }}>
                        <td colSpan={4} className="px-6 py-3">
                          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                            Puntaje promedio de {evaluated.length} venta{evaluated.length !== 1 ? 's' : ''} evaluada{evaluated.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="flex items-center gap-1.5">
                            <Stars score={Math.round(avgScore)} />
                            <span className="font-mono text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                              {avgScore.toFixed(1)}
                            </span>
                          </span>
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {showCreate && (
        <CreateSaleModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {evaluating && (
        <EvaluateModal
          sale={evaluating}
          onClose={() => setEvaluating(null)}
          onEvaluated={handleEvaluated}
        />
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        {label}:
      </span>
      <span className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}
