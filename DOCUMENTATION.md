# Bitfinex Honey Framework Backtesting Tools for Node.JS

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

## Usage

Use [execOnline](/module-Backtest.html#.execOnline) for online backtests, and
[execOffline](/module-Backtest.html#.execOffline) for offline backtests.

## Sample Console Output

Given the basic EMA cross example strategy included with `bfx-hf-strategy`, the
output of `execOffline` using the static LEO/USD dataset from
`bfx-hf-strategy-data` is:

```bash
  bfx:hf:strategy:define running with 0.008075% maker fee +0ms
  bfx:hf:strategy:define running with 0.01615% taker fee +1ms
  bfx:hf:backtest:util:debug-results backtest results for LEOUSD:1M [ema_cross] +0ms
  bfx:hf:backtest:util:debug-results 2/19/2020, 8:26:00 PM -> 3/12/2020, 8:50:00 AM +0ms
  bfx:hf:backtest:util:debug-results P/L -4.37 | Vol 2207.01 | Fees 0.36 +0ms
  bfx:hf:backtest:util:debug-results Min P/L -0.15 | Max P/L 0.16 | Avg P/L -0.01 +0ms
  bfx:hf:backtest:util:debug-results Losses 172 (total ~$5.20) | Gains 18 (total ~$0.83) +0ms
  bfx:hf:backtest:util:debug-results Profit Factor: 0.16 | 190 Positions | 380 Trades +0ms
  bfx:hf:backtest:util:debug-results P/L over time: +1ms
  bfx:hf:backtest:util:debug-results  +0ms
  bfx:hf:backtest:util:debug-results   0.14318866 ┤ ╭╮                                                                                             +1ms
  bfx:hf:backtest:util:debug-results   0.12634042 ┤ ││                                                                                             +0ms
  bfx:hf:backtest:util:debug-results   0.10949218 ┤ │╰╮                                                                                            +0ms
  bfx:hf:backtest:util:debug-results   0.09264394 ┤ │ │                   ╭╮                                                                       +0ms
  bfx:hf:backtest:util:debug-results   0.07579570 ┤ │ │   ╭╮              ││                                                                       +0ms
  bfx:hf:backtest:util:debug-results   0.05894746 ┤ │ │   ││              ││                                                                       +0ms
  bfx:hf:backtest:util:debug-results   0.04209922 ┤ │ │   ││      ╭╮      ││                                                                       +0ms
  bfx:hf:backtest:util:debug-results   0.02525098 ┼╮│ ╰╮  ││      ││      ││      ╭╮           ╭╮                                ╭╮    ╭╮          +1ms
  bfx:hf:backtest:util:debug-results   0.00840274 ┤││  │  ││      ││   ╭╮ ││      ││           ││                                ││    ││          +0ms
  bfx:hf:backtest:util:debug-results  -0.00844550 ┤││  │  ││ ╭╮  ╭╯│╭╮ ││ ││      ││           │╰─╮                ╭╮   ╭╮       │╰╮ ╭╮││          +0ms
  bfx:hf:backtest:util:debug-results  -0.02529374 ┤││  │  ││╭╯╰─╮│ ││╰─╯│ │╰╮     │╰╮╭────╮╭╮  │  │  ╭╮            │╰╮╭─╯╰────╮╭─╯ │ ││││╭─╮╭╮     +0ms
  bfx:hf:backtest:util:debug-results  -0.04214198 ┤││  │ ╭╯││   ╰╯ ││   │ │ │     │ ││    │││╭─╯  ╰──╯╰╮       ╭╮╭─╯ ││       ╰╯   │ │││╰╯ │││  ╭  +0ms
  bfx:hf:backtest:util:debug-results  -0.05899022 ┼││  ╰╮│ ││      ╰╯   │ │ │  ╭╮ │ ││    ││╰╯         │╭╮╭─╮╭─╯││   ╰╯            │ │││   ││╰─╮│  +0ms
  bfx:hf:backtest:util:debug-results  -0.07583846 ┤╰╯   ││ ││           │╭╯ │╭╮││╭╯ ││    ││           ││╰╯ ││  ╰╯                 │ │││   ││  ╰╯  +0ms
  bfx:hf:backtest:util:debug-results  -0.09268670 ┤     ╰╯ ││           ││  ╰╯││││  ╰╯    ╰╯           ││   ││                     │╭╯││   ╰╯      +0ms
  bfx:hf:backtest:util:debug-results  -0.10953494 ┤        ││           ╰╯    ││││                     ││   ╰╯                     ╰╯ ││           +0ms
  bfx:hf:backtest:util:debug-results  -0.12638319 ┤        ╰╯                 ││╰╯                     ││                             ╰╯           +0ms
  bfx:hf:backtest:util:debug-results  -0.14323143 ┤                           ││                       ╰╯                                          +0ms
  bfx:hf:backtest:util:debug-results  -0.16007967 ┤                           ││                                                                   +0ms
  bfx:hf:backtest:util:debug-results  -0.17692791 ┤                           ││                                                                   +0ms
  bfx:hf:backtest:util:debug-results  -0.19377615 ┤                           ╰╯                                                                   +0ms
  bfx:hf:util:on-exit caught exit +0ms
  bfx:hf:util:on-exit clean exit +1ms
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

## Examples

### Offline Backtests

To execute a backtest of a trading strategy using historical data, the
`execOffline` method is provided which will run the strategy against each
trade & candle in-order by timestamp:

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
