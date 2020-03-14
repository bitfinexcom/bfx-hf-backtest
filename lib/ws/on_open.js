'use strict'

/**
 * Updates backtest state to reflect connection open.
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest state
 */
const onOpen = async (btState = {}) => {
  btState.isWSOpen = true
  btState.isWSClosing = false
}

module.exports = onOpen
