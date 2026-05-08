import { Router } from 'express';
import { authRouter } from './auth.routes';
import { protectedRouter } from './protected.routes';
import { pricesRouter } from './prices.routes'; 
import { newsRouter } from './news.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/prices', pricesRouter);
router.use('/news', newsRouter);

export default router;