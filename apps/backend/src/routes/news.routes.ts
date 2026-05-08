import { Router } from 'express';
import { z } from 'zod';
import * as newsService from '../services/news.service';
import { authenticate } from '../middleware/authenticate';

const router = Router();


router.get('/:symbol', authenticate, async (req, res, next) => {
  try {
    const symbol = z.string().min(1).parse(req.params.symbol);
    
    const news = await newsService.scrapeNews(symbol);
    res.json(news);
  } catch (err) {
    next(err);
  }
});

export { router as newsRouter };