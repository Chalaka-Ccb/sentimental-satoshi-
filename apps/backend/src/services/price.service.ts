import axios from 'axios';

const GECKO = 'https://api.coingecko.com/api/v3';
const headers = process.env.COINGECKO_API_KEY
  ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY } 
  : {};


// OHLCV for charting — returns Lightweight Charts format
export async function getOHLCV(coinId: string, days: number) {
  const { data } = await axios.get(`${GECKO}/coins/${coinId}/ohlc`, {
    params: { vs_currency: 'usd', days }, // CoinGecko returns [timestamp, open, high, low, close]
    headers, 
  });
  return (data as number[][]).map(([t, o, h, l, c]) => ({ 
    time: Math.floor(t / 1000),// Convert ms to seconds
    open: o, high: h, low: l, close: c, // Keep as numbers for charting
  }));
}

// Current market data for multiple coins
export async function getMarketData(coinIds: string[]) {
  const { data } = await axios.get(`${GECKO}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      ids: coinIds.join(','),
      order: 'market_cap_desc',
      sparkline: false,
      price_change_percentage: '1h,24h,7d',
    },
    headers,
  });
  return data;
}

// Map common ticker symbols to CoinGecko IDs
export const SYMBOL_TO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  XRP: 'ripple', 
  DOGE: 'dogecoin', 
  AVAX: 'avalanche-2', 
  DOT: 'polkadot',
  LINK: 'chainlink', 
  MATIC: 'matic-network', 
  SHIB: 'shiba-inu',
  BNB: 'binancecoin',
  LTC: 'litecoin',
  UNI: 'uniswap',
  TRX: 'tron',
  BCH: 'bitcoin-cash',
  ATOM: 'cosmos',
  XLM: 'stellar',
  ETC: 'ethereum-classic',
  APT: 'aptos',
  NEAR: 'near',
  OP: 'optimism',
  ARB: 'arbitrum',
  FIL: 'filecoin',
  ICP: 'internet-computer',
  SUI: 'sui',
  TAO: 'bittensor',
  INJ: 'injective-protocol',
  AAVE: 'aave',
  RUNE: 'thorchain',
  PEPE: 'pepe',
  TON: 'the-open-network',
  KAS: 'kaspa',
};