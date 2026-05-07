import { Router } from 'express';
import { authRouter } from './auth.routes';
import { protectedRouter } from './protected.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);

export default router;
