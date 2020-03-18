'use strict'

const _last = require('lodash/last')
const _flatten = require('lodash/flatten')

const { onTrade, onCandle, onStart, onEnd } = require('./ws_events')
const initState = require('./init_state')

/**
 * Run an offline backtest with user-supplied data
 *
 * @memberOf module:Backtest
 * @example
 * const HFS = require('bfx-hf-strategy')
 * const HFBT = require('bfx-hf-backtest')
 * const Strategy = ... // strategy instance
 * const candles = [...] // candle dataset
 *
 * const candleKey = HFS.candleMarketDataKey({
 *   symbol: SYMBOLS.BTC_USD,
 *   tf: TIME_FRAMES.ONE_HOUR
 * })
 *
 * HFBT.execOffline(strat, {
 *   trades: {},
 *   candles: {
 *     [candleKey]: candles,
 *   }
 * }).then((btState) => {
 *   const { trades = [] } = btState
 *
 *   // analyze backtest trades...
 * })
 *
 * @param {Strategy} strategy - strategy to backtest
 * @param {BacktestParameters} args - backtest parameters
 * @returns {Promise} p
 */
const execOffline = async (strategy = {}, args = {}, progressCallback) => {
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

  strategy.backtesting = true

  const btState = initState({
    from: minTS,
    to: maxTS,
    strategy
  })

  btState.trades = tradeData.length > 0
  await onStart(btState, [null, null, null, minTS, maxTS])

  let p

  for (let i = 0; i < btData.length; i += 1) {
    if (progressCallback) {
      progressCallback(i + 1, btData.length)
    }

    p = btData[i]

    if (p.type === 'candle') {
      await onCandle(btState, [null, null, null, p])
    } else if (p.type === 'trade') {
      await onTrade(btState, [null, null, p])
    }
  }

  await onEnd(btState)

  return btState
}

module.exports = execOffline
