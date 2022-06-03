'use strict'

const { Candle, PublicTrade } = require('bfx-api-node-models')

const { onTrade, onCandle, onStart, onEnd } = require('./ws_events')
const initState = require('./init_state')
const flatPromise = require('flat-promise')

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
    priceFeed,
    perfManager,
    startPerformanceWatchers,
    constraints,
    context,
    dataPointFeed
  } = args

  let watchers = []
  let isDraining = false
  const { promise: onFinishDrainingData, resolve } = flatPromise()

  const abortStrategy = () => {
    btState.isClosing = true
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

  dataPointFeed.once('close', () => {
    if (isDraining) {
      return
    }

    resolve()
  })

  dataPointFeed.on('drain', async () => {
    if (isDraining) {
      return
    }

    isDraining = true

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
