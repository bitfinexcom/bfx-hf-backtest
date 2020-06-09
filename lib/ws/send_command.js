'use strict'

const send = require('./send')

/**
 * Sends the provided command & arguments
 *
 * @private
 *
 * @param {object} btState - backtest state
 * @param {string} cmd - command
 * @param {Array} args - arguments
 */
const sendCommand = (btState = {}, cmd = '', args = []) => {
  send(btState, [cmd, args])
}

module.exports = sendCommand
