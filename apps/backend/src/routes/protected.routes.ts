import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/me', authenticate, (req, res) => {
  res.json({ userId: req.user.id });
});

export { router as protectedRouter };
