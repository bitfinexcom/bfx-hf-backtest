'use strict'

const send = require('./send')

/**
 * Sends the provided command & arguments
 *
 * @private
 * @see send
 *
 * @param {object} btState - backtest state
 * @param {string} command - command
 * @param {Array} args - command arguments
 */
module.exports = (btState = {}, cmd = '', args = []) => {
  send(btState, [cmd, args])
}
