'use strict'

const _last = require('lodash/last')
const _flatten = require('lodash/flatten')

const { onTrade, onCandle, onStart, onEnd } = require('./ws_events')
const initState = require('./init_state')

/**
 * Run an offline backtest with user-supplied data
 *
 * @param {Object} strategy
 * @param {Object} args
 * @param {Object} args.candles - key'ed by market, assumed sorted!
 * @param {Object?} args.trades - key'ed by market, assumed sorted!
 * @param {Function?} progressCallback - optional, called with i/total updates
 * @return {Object} btState
 */
const execOffline = async (strategy = {}, args = {}, progressCallback) => {
  const {
    candles = {},
    trades = {},
    priceFeed,
    perfManager,
    startPerformanceWatchers,
    constraints
  } = args

  let watchers = []

  const abortStrategy = () => {
    btState.isClosing = true
  }

  const candleData = _flatten(Object.values(candles)).map(c => ({
    ...c,
    type: 'candle'
  }))

  const tradeData = _flatten(Object.values(trades)).map(t => ({
    ...t,
    type: 'trade'
  }))

  const btData = _flatten([candleData, tradeData])
    .sort((a, b) => a.mts - b.mts)

  const minTS = btData[0].mts
  const maxTS = _last(btData).mts

  let p
  let btState = initState({
    strategy: {
      backtesting: true,
      ...strategy
    },
    from: minTS,
    to: maxTS,
    priceFeed
  })

  btState.trades = tradeData.length > 0
  btState = await onStart(btState, [null, null, null, minTS, maxTS])

  if (startPerformanceWatchers) {
    watchers = startPerformanceWatchers(perfManager, abortStrategy, constraints)
  }

  for (let i = 0; i < btData.length; i += 1) {
    if (btState.isClosing) {
      break
    }

    if (progressCallback) {
      progressCallback(i + 1, btData.length)
    }

    p = btData[i]

    if (p.type === 'candle') {
      btState = await onCandle(btState, [null, null, null, p])
    } else if (p.type === 'trade') {
      btState = await onTrade(btState, [null, null, p])
    }
  }

  btState = await onEnd(btState)

  watchers.forEach(watcher => watcher.close())

  return btState
}

module.exports = execOffline
