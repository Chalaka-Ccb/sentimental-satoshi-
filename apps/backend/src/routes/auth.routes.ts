import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = credentialsSchema.parse(req.body);
    const tokens = await authService.register(email, password);
    res.status(201).json(tokens);
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credentialsSchema.parse(req.body);
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const tokens = await authService.refreshTokens(refreshToken);
    res.json(tokens);
  } catch (err) { next(err); }
});

export { router as authRouter };