'use strict'

const _last = require('lodash/last')
const _values = require('lodash/values')
const _flatten = require('lodash/flatten')

const { onTrade, onCandle, onStart, onEnd } = require('./ws_events')
const initState = require('./init_state')

/**
 * Run an offline backtest with user-supplied data
 *
 * @param {bfx-hf-strategy.StrategyState} strategy - strategy
 * @param {object} args - arguments
 * @param {object} args.candles - key'ed by market, assumed sorted!
 * @param {object} [args.trades] - key'ed by market, assumed sorted!
 * @param {Function} [progressCallback] - called with i/total updates
 * @returns {object} btState
 */
const execOffline = async (strategy = {}, args = {}, progressCallback) => {
  const { candles = {}, trades = {} } = args
  const candleData = _flatten(_values(candles)).map(c => ({
    ...c,
    type: 'candle'
  }))

  const tradeData = _flatten(_values(trades)).map(t => ({
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
    to: maxTS
  })

  btState.trades = tradeData.length > 0
  btState = await onStart(btState, [null, null, null, minTS, maxTS])

  for (let i = 0; i < btData.length; i += 1) {
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

  return btState
}

module.exports = execOffline
