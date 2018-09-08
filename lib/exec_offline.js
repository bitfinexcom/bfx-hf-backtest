'use strict'

const debug = require('debug')('hf-backtest:exec-offline')
const { seedPeriodForIndicators } = require('bfx-hf-strategy')
const _last = require('lodash/last')
const _flatten = require('lodash/flatten')

const { onTrade, onCandle, onStart, onEnd } = require('./ws_events')
const initState = require('./init_state')

/**
 * @param {Object} strategy
 * @param {Object} args
 * @param {Object} args.candles - key'ed by market, assumed sorted!
 * @param {Object} args.trades - key'ed by market, assumed sorted!
 * @return {Object} results
 */
module.exports = async (strategy = {}, args = {}) => {
  const { candles = {}, trades = {} } = args
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
    strategy,
    from: minTS,
    to: maxTS
  })

  btState = await onStart(btState, [null, null, null, minTS, maxTS])

  for (let i = 0; i < btData.length; i += 1) {
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
