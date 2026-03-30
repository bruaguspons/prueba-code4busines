import type { Sale } from '@/types/sale';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
