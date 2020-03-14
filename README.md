# Bitfinex Honey Framework Backtesting Tools for Node.JS

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-backtest.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-backtest)

This repo provides an interface for executing backtests for
[bfx-hf-strategy](https://github.com/bitfinexcom/bfx-hf-strategy) strategies
using either offline data, or a
[bfx-hf-data-server](https://github.com/bitfinexcom/bfx-hf-data-server) instance
for historical Bitfinex market data.

## Features

* Offline backtest execution with user-supplied trade & candle data
* Online backtest execution with data from `bfx-hf-data-server`
* Simulates trades within a candle if none are provided

## Installation

```bash
npm i --save bfx-hf-backtest
```

## Quickstart

```js
const HFS = require('bfx-hf-strategy')
const HFBT = require('bfx-hf-backtest')
const Strategy = ... // strategy instance
const candles = [/* ... */]

const candleKey = HFS.candleMarketDataKey({
  symbol: SYMBOLS.BTC_USD,
  tf: TIME_FRAMES.ONE_HOUR
})

HFBT.execOffline(strat, {
  trades: {},
  candles: {
    [candleKey]: candles,
  }
}).then((btState) => {
  const { trades = [] } = btState

  // analyze backtest trades...
})
```

## Docs

[Refer to `docs/`](/docs) for JSDoc-generated API documentation, and the
[`examples/`](/examples) folder for executable examples.

## Examples

### Offline Backtests

To execute a backtest of a trading strategy using historical data, the
`execOffline` method is provided which will run the strategy against each trade
& candle in-order by timestamp:

```js
const HFS = require('bfx-hf-strategy')
const HFBT = require('bfx-hf-backtest')

const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')
const { Candle } = require('bfx-api-node-models')
const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')
const rawCandleData = require('./btc_candle_data.json')

// During real execution, candles can arrive from any market/at any time (if
// sub'ed to multiple time frames); hence, each candle must include its origin
// symbol/time frame pair.
const market = {
  symbol: SYMBOLS.BTC_USD,
  tf: TIME_FRAMES.ONE_HOUR
}

const candleKey = HFS.candleMarketDataKey(market)
const strat = EMAStrategy(market)
const candles = rawCandleData
  .sort((a, b) => a[0] - b[0])
  .map(c => ({
    ...(new Candle(c).toJS()),
    ...market // attach market data
  }))

const run = async () => {
  await HFBT.execOffline(strat, {
    trades: {},
    candles: {
      [candleKey]: candles,
    }
  })
}

try {
  run()
} catch (e) {
  console.error(e)
}
```

### Online Backtests

Online backtests are executed a running `bfx-hf-data-server` instance, which
will automatically synchronize historical data as needed and pass it to the
backtesting logic:

```js
const HFBT = require('bfx-hf-backtest')
const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')
const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')

const now = Date.now()
const market = {
  symbol: SYMBOLS.XMR_USD,
  tf: TIME_FRAMES.ONE_MINUTE
}

const strat = EMAStrategy(market)
const run = async () => {
  await HFBT.execOnline([strat], {
    exchange: 'bitfinex',
    from: now - (2 * 24 * 60 * 60 * 1000),
    to: now,
    trades: true,
    candles: true,
    ...market
  })
}

try {
  run()
} catch (e) {
  console.error(e)
}
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
