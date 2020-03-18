'use strict'

const { closeOpenPositions } = require('bfx-hf-strategy')
const colors = require('colors')

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
  const { keepOpenPositionsAtEnd } = strategy

  if (!keepOpenPositionsAtEnd) {
    await closeOpenPositions(strategy)
  }

  const { trades = [] } = strategy

  if (isPrimary) {
    debug(
      'backtest ended (%s strategy trades, %d candles, %d trades)',
      colors.green(trades.length), btState.nCandles, btState.nTrades
    )
  }

  debugResults(btState, hasMultipleStrategies, isPrimary)

  if (ws) {
    sendResults(btState)
    ws.close()
  }

  btState.isWSClosing = true
  btState.execPeriod = null
}
