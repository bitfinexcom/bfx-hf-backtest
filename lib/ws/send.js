'use strict'

/**
 * Sends the provided message as JSON
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest state
 * @param {Array} msg - message to send
 */
module.exports = (btState = {}, msg = []) => {
  const { ws } = btState

  if (!ws) {
    throw new Error('no ws client available')
  }

  ws.send(JSON.stringify(msg))
}
