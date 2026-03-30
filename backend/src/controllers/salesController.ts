import { Request, Response } from 'express';
import * as salesService from '../services/salesService';

export async function getSales(req: Request, res: Response) {
  try {
    const sales = await salesService.listSales();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function postSale(req: Request, res: Response) {
  try {
    const sale = await salesService.createSale(req.body);
    res.status(201).json(sale);
  } catch (err) {
    if (err instanceof salesService.ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function evaluateSale(req: Request, res: Response) {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid sale id' });
      return;
    }
    const sale = await salesService.evaluateSale(id, req.body.score);
    res.json(sale);
  } catch (err) {
    if (err instanceof salesService.ValidationError) {
      res.status(400).json({ error: err.message });
    } else if (err instanceof salesService.NotFoundError) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
