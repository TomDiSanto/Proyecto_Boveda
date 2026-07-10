import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post('/accounts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { titular } = req.body;
    if (!titular) {
      res.status(422).json({ error: { code: 'INVALID_DATA', message: 'El titular es requerido' } });
      return;
    }
    const result = await pool.query('INSERT INTO accounts (titular) VALUES ($1) RETURNING *', [titular]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/accounts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM accounts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/accounts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'Cuenta no encontrada' } });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/accounts/:id/deposit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const idemKey = (req.headers['idempotency-key'] as string) || null;

    await pool.query('SELECT deposit_funds($1, $2, $3)', [id, amount, idemKey]);
    const result = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/accounts/:id/withdraw', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const idemKey = (req.headers['idempotency-key'] as string) || null;

    await pool.query('SELECT withdraw_funds($1, $2, $3)', [id, amount, idemKey]);
    const result = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/transfers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromId, toId, amount } = req.body;
    const idemKey = (req.headers['idempotency-key'] as string) || null;

    await pool.query('SELECT transfer_funds($1, $2, $3, $4)', [fromId, toId, amount, idemKey]);
    res.status(200).json({ success: true, message: 'Transferencia completada con éxito' });
  } catch (err) {
    next(err);
  }
});

router.get('/accounts/:id/movements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if account exists first to return 404 if not found
    const accResult = await pool.query('SELECT 1 FROM accounts WHERE id = $1', [id]);
    if (accResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'Cuenta no encontrada' } });
      return;
    }
    
    const result = await pool.query('SELECT * FROM movements WHERE account_id = $1 ORDER BY created_at ASC', [id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
