const GECKO = 'https://api.coingecko.com/api/v3';

async function test() {
  const coin = 'bitcoin';
  const days = 30;
  const url = `${GECKO}/coins/${coin}/ohlc?vs_currency=usd&days=${days}`;
  const res = await fetch(url, { headers: {} });
  const data = await res.json();
  const mapped = data.map(([t, o, h, l, c]) => ({
    time: Math.floor(t / 1000), open: o, high: h, low: l, close: c,
  }));
  console.log('Sample OHLCV points:', mapped.slice(0, 3));
  console.log('Point shape keys:', Object.keys(mapped[0] || {}));
}

test().catch(err => { console.error(err); process.exit(1); });
