'use strict'

const isSeedTS = require('../util/is_seed_ts')
const { onTrade, onSeedTrade } = require('bfx-hf-strategy')

/**
 * Called for incoming backtest trade messages, calls the relevant handler.
 *
 * @private
 *
 * @param {object} btState - backtest state
 * @param {Array} msg - incoming message
 * @returns {Promise} p
 */
module.exports = async (btState = {}, msg = []) => {
  const { strategy } = btState
  const [,, trade = {}] = msg

  if (isSeedTS(trade.mts)) {
    await onSeedTrade(strategy, trade)
  } else {
    await onTrade(strategy, trade)
  }

  btState.lastPrice = trade.price
  btState.nTrades = btState.nTrades + 1
}
