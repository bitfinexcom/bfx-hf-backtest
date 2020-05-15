'use strict'

const debug = require('../util/debug')

/**
 * Called for incoming backtest sync start messages.
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {Array} msg - incoming message
 * @returns {Promise} p
 */
module.exports = async (msg = []) => {
  const [, symbol, tf, from, to] = msg

  debug(
    'backtest data sync started for %s:%s | %s -> %s',
    symbol.substr(1), tf.toUpperCase(), new Date(from).toLocaleString(),
    new Date(to).toLocaleString()
  )
}
