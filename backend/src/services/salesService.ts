import prisma from '../db/prisma';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function listSales() {
  return prisma.sale.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createSale(data: {
  customer?: unknown;
  product?: unknown;
  amount?: unknown;
}) {
  const { customer, product, amount } = data;

  if (!customer || typeof customer !== 'string' || customer.trim() === '') {
    throw new ValidationError('customer is required');
  }
  if (!product || typeof product !== 'string' || product.trim() === '') {
    throw new ValidationError('product is required');
  }
  if (amount === undefined || amount === null) {
    throw new ValidationError('amount is required');
  }
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new ValidationError('amount must be a positive number');
  }

  return prisma.sale.create({
    data: {
      customer: customer.trim(),
      product: product.trim(),
      amount: numAmount,
    },
  });
}

export async function evaluateSale(id: number, score: unknown) {
  if (
    score === undefined ||
    score === null ||
    !Number.isInteger(Number(score)) ||
    Number(score) < 1 ||
    Number(score) > 5
  ) {
    throw new ValidationError('score must be an integer between 1 and 5');
  }

  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale) {
    throw new NotFoundError(`Sale with id ${id} not found`);
  }

  return prisma.sale.update({
    where: { id },
    data: { score: Number(score) },
  });
}
