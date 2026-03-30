'use client';

import { useState, useRef, useEffect } from 'react';
import { createSale } from '@/lib/api';
import type { Sale } from '@/types/sale';

interface Props {
  onClose: () => void;
  onCreated: (sale: Sale) => void;
}

interface FormErrors {
  customer?: string;
  product?: string;
  amount?: string;
}

export default function CreateSaleModal({ onClose, onCreated }: Props) {
  const [customer, setCustomer] = useState('');
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!customer.trim()) e.customer = 'Customer name is required';
    if (!product.trim()) e.product = 'Product name is required';
    if (!amount.trim()) {
      e.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      e.amount = 'Amount must be a positive number';
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      const sale = await createSale({
        customer: customer.trim(),
        product: product.trim(),
        amount: Number(amount),
      });
      onCreated(sale);
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
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
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--accent)' }}>
                New Record
              </p>
              <h2 className="text-2xl font-serif font-bold" style={{ color: 'var(--text-primary)' }}>
                Create Sale
              </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-8 py-6 space-y-5">
            {serverError && (
              <div
                className="rounded-lg px-4 py-3 text-sm font-mono"
                style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
              >
                {serverError}
              </div>
            )}

            <Field
              label="Customer"
              error={errors.customer}
              inputRef={firstInputRef}
            >
              <input
                ref={firstInputRef}
                type="text"
                value={customer}
                onChange={(e) => { setCustomer(e.target.value); setErrors((p) => ({ ...p, customer: undefined })); }}
                placeholder="e.g. Acme Corporation"
                className="field-input"
              />
            </Field>

            <Field label="Product" error={errors.product}>
              <input
                type="text"
                value={product}
                onChange={(e) => { setProduct(e.target.value); setErrors((p) => ({ ...p, product: undefined })); }}
                placeholder="e.g. Widget Pro"
                className="field-input"
              />
            </Field>

            <Field label="Amount" error={errors.amount}>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: undefined })); }}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="field-input pl-8"
                />
              </div>
            </Field>
          </div>

          <div
            className="px-8 pb-8 flex gap-3"
          >
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
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-mono text-sm font-medium transition-opacity cursor-pointer flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.7 : 1 }}
            >
              {loading && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {loading ? 'Creating…' : 'Create Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  inputRef,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="block text-xs font-mono tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-mono" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}
    </div>
  );
}
