import { Router } from 'express';

const router = Router();

// TODO: Implementar com SQLite
router.get('/', async (req, res) => {
  res.json({ attendances: [] });
});

export default router;
