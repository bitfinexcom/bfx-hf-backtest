'use strict'

process.env.DEBUG = process.env.DEBUG || 'bfx:*'

const path = require('path')

const async = require('async')
const hypercore = require('hypercore')
const Hyperbee = require('hyperbee')

const replicate = require('@hyperswarm/replicator')

const HFBT = require('../')
const HFS = require('bfx-hf-strategy')
const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')

const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')

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

const market = {
  symbol: SYMBOLS.BTC_USD,
  tf: TIME_FRAMES.ONE_HOUR
}

const kp = HFS.candleMarketDataKey(market)

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

      replicate(localFeed, { lookup: true, live: false })

      localDb = new Hyperbee(localFeed, hbOpts)
      localDb.feed.ready(next)
    })
  },

  prepareCandles: ['setupCores', async (res) => {
    // feed data into the data source / server

    const batch = db.batch()
    for (let i = 0; i < rawCandleData.length; i++) {
      const data = rawCandleData[i]
      const mts = data[0]

      const k = kp + mts
      await batch.put(k, data)
    }

    await batch.flush()
  }],

  runStrategy: ['prepareCandles', 'setupCores', async ({ findIndexes }) => {
    const strat = EMAStrategy(market)

    const { exec, onEnd } = await HFBT.execStream(strat, market, {
      from,
      to
      // isTrade: null, // you can pass a custom `isTrade` frunction here in options
    })

    // sparse-replicates the data and runs the strategy on the returned frame of data
    const s = localDb.createReadStream({ gte: kp + from, lte: kp + to })

    let btState
    s.on('data', async (data) => {
      const { key, value } = data
      btState = await exec(key, value)
    })

    s.on('end', async () => {
      btState = await onEnd(btState)
    })
  }]
}, (err, { runStrategy }) => {
  if (err) throw err
})
