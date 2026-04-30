import WebSocket from 'ws';
import { EventEmitter } from 'events';

export const priceEmitter = new EventEmitter();
let wsInstance: WebSocket | null = null;

export function subscribeToPriceStream(symbols: string[]) {
  if (wsInstance) wsInstance.terminate();

  const streams = symbols.map(s => `${s.toLowerCase()}usdt@miniTicker`).join('/');
  wsInstance = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  wsInstance.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.data) {
      priceEmitter.emit('tick', {
        symbol: msg.data.s.replace('USDT', ''),
        price: parseFloat(msg.data.c),
        high24h: parseFloat(msg.data.h),
        low24h: parseFloat(msg.data.l),
        volume24h: parseFloat(msg.data.v),
      });
    }
  });

  wsInstance.on('close', () => {
    console.log('[PriceStream] Disconnected — reconnecting in 5s');
    setTimeout(() => subscribeToPriceStream(symbols), 5000);
  });

  wsInstance.on('error', (err) => console.error('[PriceStream]', err.message));
}