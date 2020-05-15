'use strict'

const { resetIndicators } = require('bfx-hf-strategy')
const _isFunction = require('lodash/isFunction')

const debug = require('../util/debug')

/**
 * Called for incoming backtest start messages, resets indicators and calls the
 * `onStart` handler
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest state
 * @param {Array} msg - incoming message
 * @param {boolean} isPrimary - indicates if this is the primary strategy for
 *   a set of multiple strategies backtested simultaneously (if primary, full
 *   debug data is shown)
 * @returns {Promise} p
 */
module.exports = async (btState = {}, msg = [], isPrimaryStrategy) => {
  const { strategy = {} } = btState
  const { onStart } = strategy
  const [,,, from, to] = msg

  if (isPrimaryStrategy) {
    debug(
      'backtest started for %s -> %s',
      new Date(from).toLocaleString(),
      new Date(to).toLocaleString()
    )
  }

  resetIndicators(strategy)

  if (_isFunction(onStart)) {
    await onStart(strategy)
  }

  // TODO: extract as resetBTState()
  btState.trades = []
  btState.positions = {}
  btState.execPeriod = { from, to }
  btState.nTrades = 0
  btState.nCandles = 0
}
