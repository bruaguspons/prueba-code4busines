import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import prisma from '../src/db/prisma';

beforeEach(async () => {
  await prisma.sale.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /sales', () => {
  it('returns 200 and an array', async () => {
    const res = await request(app).get('/sales');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns existing sales', async () => {
    await prisma.sale.create({
      data: { customer: 'Acme', product: 'Widget', amount: 100 },
    });

    const res = await request(app).get('/sales');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].customer).toBe('Acme');
  });
});

describe('POST /sales', () => {
  it('returns 201 with valid body', async () => {
    const res = await request(app).post('/sales').send({
      customer: 'Acme Corp',
      product: 'Widget Pro',
      amount: 1500,
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.customer).toBe('Acme Corp');
    expect(res.body.product).toBe('Widget Pro');
    expect(res.body.amount).toBe(1500);
    expect(res.body.score).toBeNull();
  });

  it('returns 400 when customer is missing', async () => {
    const res = await request(app).post('/sales').send({ product: 'Widget', amount: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when product is missing', async () => {
    const res = await request(app).post('/sales').send({ customer: 'Acme', amount: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when amount is missing', async () => {
    const res = await request(app).post('/sales').send({ customer: 'Acme', product: 'Widget' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when amount is not positive', async () => {
    const res = await request(app).post('/sales').send({ customer: 'Acme', product: 'Widget', amount: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /sales/:id/evaluate', () => {
  it('returns 200 with valid score', async () => {
    const sale = await prisma.sale.create({
      data: { customer: 'Acme', product: 'Widget', amount: 100 },
    });

    const res = await request(app).post(`/sales/${sale.id}/evaluate`).send({ score: 4 });
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(4);
  });

  it('returns 400 with score below 1', async () => {
    const sale = await prisma.sale.create({
      data: { customer: 'Acme', product: 'Widget', amount: 100 },
    });

    const res = await request(app).post(`/sales/${sale.id}/evaluate`).send({ score: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 400 with score above 5', async () => {
    const sale = await prisma.sale.create({
      data: { customer: 'Acme', product: 'Widget', amount: 100 },
    });

    const res = await request(app).post(`/sales/${sale.id}/evaluate`).send({ score: 6 });
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).post('/sales/999999/evaluate').send({ score: 3 });
    expect(res.status).toBe(404);
  });
});
