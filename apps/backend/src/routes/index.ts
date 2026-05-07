import { Router } from 'express';
import { authRouter } from './auth.routes';
import { protectedRouter } from './protected.routes';
import { pricesRouter } from './prices.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/prices', pricesRouter);

export default router;
