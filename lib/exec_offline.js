'use strict'

const { Candle, PublicTrade } = require('bfx-api-node-models')

const { onTrade, onCandle, onStart, onEnd } = require('./ws_events')
const initState = require('./init_state')
const flatPromise = require('flat-promise')

const drainDataPoints = async (context, dataPointFeed, btState) => {
  while (!btState.isClosing && !context.done && dataPointFeed.size() > 0) {
    if (dataPointFeed.peek().mts > dataPointFeed.windowLowerBound) {
      break
    }

    const dataPoint = dataPointFeed.pop()

    if (dataPoint instanceof Candle) {
      btState = await onCandle(btState, [null, null, null, dataPoint])
    } else if (dataPoint instanceof PublicTrade) {
      btState = await onTrade(btState, [null, null, dataPoint])
    }
  }

  return btState
}

/**
 * Run an offline backtest with user-supplied data
 *
 * @param {Object} strategy
 * @param {Object} args
 * @param {Object} args.candles - key'ed by market, assumed sorted!
 * @param {Object?} args.trades - key'ed by market, assumed sorted!
 * @return {Object} btState
 */
const execOffline = async (strategy = {}, args = {}) => {
  const {
    start,
    end,
    includeTrades,
    candleSeed,
    seedCandles,
    priceFeed,
    perfManager,
    startPerformanceWatchers,
    constraints,
    context,
    dataPointFeed
  } = args

  let watchers = []
  let isDraining = false
  const { promise: onFinishDrainingData, resolve, reject } = flatPromise()

  const abortStrategy = () => {
    btState.isClosing = true
  }

  if (candleSeed) {
    strategy = await seedCandles(strategy)
  }

  let btState = initState({
    strategy: {
      backtesting: true,
      ...strategy
    },
    from: start,
    to: end,
    priceFeed
  })

  btState.trades = includeTrades
  btState = await onStart(btState, [null, null, null, start, end])

  if (startPerformanceWatchers) {
    watchers = startPerformanceWatchers(perfManager, abortStrategy, constraints)
  }

  context.once('done', () => {
    resolve()
  })

  dataPointFeed.once('close', async () => {
    if (isDraining) {
      return
    }

    if (dataPointFeed.size() > 0) {
      btState = await drainDataPoints(context, dataPointFeed, btState)
    }

    resolve()
  })

  dataPointFeed.once('error', (err) => {
    reject(err)
  })

  dataPointFeed.on('drain', async () => {
    if (isDraining) {
      return
    }

    isDraining = true

    try {
      btState = await drainDataPoints(context, dataPointFeed, btState)
    } catch (err) {
      return reject(err)
    }

    isDraining = false

    if (dataPointFeed.closed) {
      resolve()
    }
  })

  dataPointFeed.start(context, start, end)

  await onFinishDrainingData
  btState = await onEnd(btState)

  watchers.forEach(watcher => watcher.close())

  return btState
}

module.exports = execOffline
