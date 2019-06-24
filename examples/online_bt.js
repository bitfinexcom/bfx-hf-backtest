'use strict'

process.env.DEBUG = '*'

const HFBT = require('../')
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
    from: now - (3 * 24 * 60 * 60 * 1000),
    to: now,
    trades: true,
    ...market
  })
}

try {
  run()
} catch (e) {
  console.error(e)
}
