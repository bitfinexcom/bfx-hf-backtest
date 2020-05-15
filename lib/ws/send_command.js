'use strict'

const send = require('./send')

/**
 * Sends the provided command & arguments
 *
 * @memberOf module:Backtest
 * @private
 * @see send
 *
 * @param {BacktestState} btState - backtest state
 * @param {string} command - command
 * @param {Array} args - command arguments
 */
module.exports = (btState = {}, cmd = '', args = []) => {
  send(btState, [cmd, args])
}
