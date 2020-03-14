'use strict'

const _isFunction = require('lodash/isFunction')
const { closeOpenPositions } = require('bfx-hf-strategy')

const debug = require('../util/debug')
const debugResults = require('../util/debug_results')
const sendResults = require('../ws/send_results')

/**
 * Called for incoming backtest end messages. Closes open positions, logs
 * results, and sends them to the data server for storage.
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest state
 * @param {Array} msg - incoming message
 * @param {boolean} [isPrimary] - true if this is the primary strategy
 * @param {boolean} [hasMultipleStrategies] - true if multiple strategies are
 *   being tested
 * @returns {Promise} p
 */
module.exports = async (
  btState = {}, msg = [], isPrimary, hasMultipleStrategies
) => {
  const { strategy = {}, ws } = btState
  const { onEnd } = strategy

  if (_isFunction(onEnd)) {
    await onEnd(strategy)
  }

  await closeOpenPositions(strategy)

  const { trades = [] } = strategy

  if (isPrimary) {
    debug(
      'backtest ended (%d strategy trades, %d candles, %d trades)',
      trades.length, btState.nCandles, btState.nTrades
    )
  }

  debugResults(btState, hasMultipleStrategies)

  if (ws) {
    sendResults(btState)
    ws.close()
  }

  btState.isWSClosing = true
  btState.execPeriod = null
}
