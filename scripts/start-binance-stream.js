const path = require('path');

// Load the compiled backend priceStream service
const svcPath = path.resolve(__dirname, '..', 'apps', 'backend', 'dist', 'services', 'priceStream.service.js');
const svc = require(svcPath);

const { subscribeToPriceStream, priceEmitter } = svc;

// subscribe to BTC and ETH by default
subscribeToPriceStream(['BTC', 'ETH']);

priceEmitter.on('tick', (t) => {
  console.log('[tick]', new Date().toISOString(), t.symbol, t.price);
});

console.log('Started Binance stream for BTC and ETH — logging ticks');
