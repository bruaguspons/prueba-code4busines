export interface Sale {
  id: number;
  customer: string;
  product: string;
  amount: number;
  score: number | null;
  createdAt: string;
}
