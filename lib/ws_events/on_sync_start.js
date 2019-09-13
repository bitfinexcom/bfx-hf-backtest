'use strict'

const debug = require('../util/debug')

/**
 * Called for incoming backtest sync start messages
 *
 * @param {Object} btState
 * @param {*[]} msg
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}, msg = []) => {
  const [, symbol, tf, from, to] = msg

  debug(
    'backtest data sync started for %s:%s | %s -> %s',
    symbol.substr(1), tf.toUpperCase(), new Date(from).toLocaleString(),
    new Date(to).toLocaleString()
  )

  return btState
}
