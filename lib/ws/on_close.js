'use strict'

/**
 * Updates backtest state to reflect connection close.
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest state
 */
const onClose = async (btState = {}) => {
  btState.isWSOpen = false
  btState.isWSClosing = false
}

module.exports = onClose
