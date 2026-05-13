import { Router } from 'express';
import { authRouter } from './auth.routes';
import { protectedRouter } from './protected.routes';
import { pricesRouter } from './prices.routes'; 
import { newsRouter } from './news.routes';
import { socialRouter } from './social.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/prices', pricesRouter);
router.use('/news', newsRouter);
router.use('/social', socialRouter);

export default router;