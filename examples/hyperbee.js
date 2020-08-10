'use strict'

process.env.DEBUG = process.env.DEBUG || 'bfx:*'

const path = require('path')

const async = require('async')
const hypercore = require('hypercore')
const Hyperbee = require('hyperbee')

const replicate = require('@hyperswarm/replicator')

const { Candle } = require('bfx-api-node-models')
const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')
const HFS = require('bfx-hf-strategy')

const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')

const { onCandle, onStart, onEnd } = require('../lib/ws_events')
const initState = require('../lib/init_state')

const hopts = {
  overwrite: true
}

const hbOpts = {
  valueEncoding: 'json'
}

let rawCandleData = require('./btc_candle_data.json')

rawCandleData = rawCandleData.sort((a, b) => {
  return a[0] - b[0]
})

const kp = HFS.candleMarketDataKey({
  symbol: SYMBOLS.BTC_USD,
  tf: TIME_FRAMES.ONE_HOUR
})

const from = rawCandleData[0][0]
const to = rawCandleData[999][0]

console.log('from:', from, 'to:', to)

let feed
let localFeed
let db
let localDb
async.auto({
  setupCores: (next) => {
    // server has 1000 entries
    feed = hypercore(path.join(__dirname, 'dbs', 'BTCUSD'), hopts)
    db = new Hyperbee(feed, hbOpts)

    // lets share it
    db.feed.ready(() => {
      replicate(feed, { announce: true, live: true, lookup: false })

      // localcopy will have a frame of it
      // lets sync some data from the middle
      localFeed = hypercore(path.join(__dirname, 'dbs', 'BTCUSD_frame'), feed.key, {
        ...hopts,
        sparse: true
      })

      localDb = new Hyperbee(localFeed, hbOpts)

      localDb.feed.ready(next)
    })
  },

  setupRep: ['setupCores', (res, next) => {
    // remove me in new hypercore version

    localFeed.once('peer-add', () => {
      next()
    })

    replicate(localFeed, { lookup: true, live: false })
  }],

  prepareCandles: ['setupCores', async (res) => {
    // feed data into the data source / server

    const batch = db.batch()
    for (let i = 0; i < rawCandleData.length; i++) {
      const data = rawCandleData[i]
      const mts = data[0]

      const k = kp + mts
      await batch.put(k, JSON.stringify(data))
    }

    await batch.flush()
  }],

  runStrategy: ['prepareCandles', 'setupCores', 'setupRep', ({ findIndexes }, next) => {
    let { market, btState } = getStrategy(from, to)
    const exec = getExec(market, btState, from, to, next)

    // sparse-replicates the data and runs the strategy on the returned frame of data
    const s = localDb.createReadStream({ gte: kp + from, lte: kp + to })
    let count = 0

    s.on('data', async (data) => {
      count++
      const { value } = data
      btState = await exec(value)
    })

    s.on('end', async () => {
      btState = await onEnd(btState)
      next(null, { count })
    })
  }]
}, (err, { runStrategy }) => {
  if (err) throw err

  console.log('processed', runStrategy.count, 'entries')
})

function getStrategy (from, to) {
  const market = {
    symbol: SYMBOLS.BTC_USD, // tBTCUSD
    tf: TIME_FRAMES.ONE_HOUR // 1h
  }

  const strat = EMAStrategy(market)
  const btState = initState({
    strategy: {
      backtesting: true,
      ...strat
    },

    from: from,
    to: to
  })

  btState.trades = false

  return { market, btState }
}

function getExec (market, btState, from, to, cb) {
  const opts = { first: true }
  return async function (el) {
    const sc = {
      ...new Candle(el).toJS(),
      ...market // attach market data
    }

    if (opts.first) {
      opts.first = false
      btState = await onStart(btState, [null, null, null, from, to])
    }

    btState = await onCandle(btState, [null, null, null, sc])

    if (sc.mts === to) {
      // btState = await onEnd(btState)
    }

    return btState
  }
}
