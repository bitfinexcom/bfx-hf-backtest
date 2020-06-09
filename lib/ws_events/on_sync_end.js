'use strict'

const debug = require('../util/debug')

/**
 * Called for incoming backtest sync start messages
 *
 * @private
 *
 * @param {object} btState - backtest state
 * @param {Array} msg - message
 * @returns {object} nextBtState
 */
const onWSEventSyncEnd = async (btState = {}, msg = []) => {
  const [, symbol, tf, from, to] = msg

  debug(
    'backtest data sync ended for %s:%s | %s -> %s',
    symbol.substr(1), tf.toUpperCase(), new Date(from).toLocaleString(),
    new Date(to).toLocaleString()
  )

  console.log('')

  return btState
}

module.exports = onWSEventSyncEnd
