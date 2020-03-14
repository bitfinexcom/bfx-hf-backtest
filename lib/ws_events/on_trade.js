'use strict'

const isSeedTS = require('../util/is_seed_ts')
const { onTrade, onSeedTrade } = require('bfx-hf-strategy')

/**
 * Called for incoming backtest trade messages
 *
 * @param {Object} btState
 * @param {*[]} msg
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
