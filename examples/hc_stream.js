'use strict'

process.env.DEBUG = '*'

const path = require('path')

const async = require('async')
const hypercore = require('hypercore')

const { Candle } = require('bfx-api-node-models')
const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')
const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')

const { onCandle, onStart, onEnd } = require('../lib//ws_events')
const initState = require('../lib/init_state')

const hopts = {
  valueEncoding: 'json',
  overwrite: true
}

const rawCandleData = require('./btc_candle_data.json').sort((a, b) => a[0] - b[0])
const lastCandle = rawCandleData[rawCandleData.length - 1]

const feed = hypercore(path.join(__dirname, 'dbs', 'BTCUSD'), hopts)
async.forEach(rawCandleData, (el, cb) => {
  feed.append([el], cb)
}, (err) => {
  if (err) throw err

  feed
    .createReadStream()
    .on('data', async (data) => {
      await exec(data)
    })
})

// run strategy
const market = {
  symbol: SYMBOLS.BTC_USD, // tBTCUSD
  tf: TIME_FRAMES.ONE_HOUR // 1h
}
const strat = EMAStrategy(market)

let btState = initState({
  strategy: {
    backtesting: true,
    ...strat
  },

  from: null,
  to: 1533919680000
})

btState.trades = false
let first = true
async function exec (el) {
  const sc = {
    ...new Candle(el).toJS(),
    ...market // attach market data
  }

  if (first) {
    first = false
    btState = await onStart(btState, [null, null, null, el[0], lastCandle[0]])
  }

  btState = await onCandle(btState, [null, null, null, sc])

  if (sc.mts === lastCandle[0]) {
    btState = btState = await onEnd(btState)
    feed.close()
  }
}
