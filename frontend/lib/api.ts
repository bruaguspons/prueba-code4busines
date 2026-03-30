import type { Sale } from '@/types/sale';

// Server-side: API_URL (no expuesta al browser, usada por Next.js server)
// Client-side: NEXT_PUBLIC_API_URL (expuesta al browser)
const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:4000')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getSales(): Promise<Sale[]> {
  const res = await fetch(`${BASE_URL}/sales`, { cache: 'no-store' });
  return handleResponse<Sale[]>(res);
}

export async function createSale(data: {
  customer: string;
  product: string;
  amount: number;
}): Promise<Sale> {
  const res = await fetch(`${BASE_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Sale>(res);
}

export async function evaluateSale(id: number, score: number): Promise<Sale> {
  const res = await fetch(`${BASE_URL}/sales/${id}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score }),
  });
  return handleResponse<Sale>(res);
}
