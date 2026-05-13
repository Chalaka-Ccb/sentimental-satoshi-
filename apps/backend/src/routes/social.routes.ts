import { Router } from 'express';
import { z } from 'zod';
import * as socialService from '../services/social.service';
import { authenticate } from '../middleware/authenticate';

const router = Router();


router.get('/:symbol', authenticate, async (req, res, next) => {
  try {
    // 1. Validate the symbol parameter
    const symbol = z.string().min(1).max(10).parse(req.params.symbol).toUpperCase();

    // 2. Fetch data from all configured social sources
    
    const posts = await socialService.fetchAllSocial(symbol);

    // 3. Return the normalized posts
    res.json({
      symbol,
      count: posts.length,
      posts,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    
    next(err);
  }
});

export { router as socialRouter };