import { Router } from 'express';
import { getOHLCV, getMarketData, SYMBOL_TO_ID } from '../services/price.service';

const router = Router();

// GET /api/v1/prices/:symbol/ohlcv?days=90
router.get('/:symbol/ohlcv', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const days = req.query.days ? Number(req.query.days) : 30;
    const coinId = SYMBOL_TO_ID[symbol.toUpperCase()] || symbol.toLowerCase();
    const data = await getOHLCV(coinId, days);
    res.json({ symbol: symbol.toUpperCase(), days, data });
  } catch (err) { next(err); }
});

// GET /api/v1/prices/markets?symbols=BTC,ETH
router.get('/markets', async (req, res, next) => {
  try {
    const qs = typeof req.query.symbols === 'string' ? req.query.symbols : '';
    const symbols = qs ? qs.split(',').map(s => s.trim().toUpperCase()) : Object.keys(SYMBOL_TO_ID);
    const ids = symbols.map(s => SYMBOL_TO_ID[s] || s.toLowerCase());
    const data = await getMarketData(ids);
    res.json({ symbols, data });
  } catch (err) { next(err); }
});

export { router as pricesRouter };
