import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSale, listSales, evaluateSale, ValidationError, NotFoundError } from '../src/services/salesService';

vi.mock('../src/db/prisma', () => ({
  default: {
    sale: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from '../src/db/prisma';

const mockPrisma = prisma as unknown as {
  sale: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listSales', () => {
  it('returns all sales', async () => {
    const mockSales = [
      { id: 1, customer: 'Acme', product: 'Widget', amount: 100, score: null, createdAt: new Date() },
    ];
    mockPrisma.sale.findMany.mockResolvedValue(mockSales);

    const result = await listSales();

    expect(result).toEqual(mockSales);
    expect(mockPrisma.sale.findMany).toHaveBeenCalledOnce();
  });
});

describe('createSale', () => {
  it('creates a sale with valid data', async () => {
    const input = { customer: 'Acme Corp', product: 'Widget Pro', amount: 1500 };
    const created = { id: 1, ...input, score: null, createdAt: new Date() };
    mockPrisma.sale.create.mockResolvedValue(created);

    const result = await createSale(input);

    expect(result).toEqual(created);
    expect(mockPrisma.sale.create).toHaveBeenCalledWith({
      data: { customer: 'Acme Corp', product: 'Widget Pro', amount: 1500 },
    });
  });

  it('throws ValidationError when customer is missing', async () => {
    await expect(createSale({ product: 'Widget', amount: 100 })).rejects.toThrow(ValidationError);
    await expect(createSale({ customer: '', product: 'Widget', amount: 100 })).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when product is missing', async () => {
    await expect(createSale({ customer: 'Acme', amount: 100 })).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when amount is missing', async () => {
    await expect(createSale({ customer: 'Acme', product: 'Widget' })).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when amount is not positive', async () => {
    await expect(createSale({ customer: 'Acme', product: 'Widget', amount: 0 })).rejects.toThrow(ValidationError);
    await expect(createSale({ customer: 'Acme', product: 'Widget', amount: -10 })).rejects.toThrow(ValidationError);
  });
});

describe('evaluateSale', () => {
  it('updates score for existing sale', async () => {
    const existing = { id: 1, customer: 'Acme', product: 'Widget', amount: 100, score: null, createdAt: new Date() };
    const updated = { ...existing, score: 4 };
    mockPrisma.sale.findUnique.mockResolvedValue(existing);
    mockPrisma.sale.update.mockResolvedValue(updated);

    const result = await evaluateSale(1, 4);

    expect(result).toEqual(updated);
    expect(mockPrisma.sale.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { score: 4 } });
  });

  it('throws ValidationError when score is below 1', async () => {
    await expect(evaluateSale(1, 0)).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when score is above 5', async () => {
    await expect(evaluateSale(1, 6)).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when score is not an integer', async () => {
    await expect(evaluateSale(1, 3.5)).rejects.toThrow(ValidationError);
  });

  it('throws NotFoundError when sale does not exist', async () => {
    mockPrisma.sale.findUnique.mockResolvedValue(null);
    await expect(evaluateSale(999, 3)).rejects.toThrow(NotFoundError);
  });
});
