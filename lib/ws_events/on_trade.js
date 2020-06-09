'use strict'

const isSeedTS = require('../util/is_seed_ts')
const { onTrade, onSeedTrade } = require('bfx-hf-strategy')

/**
 * Called for incoming backtest trade messages
 *
 * @private
 *
 * @param {object} btState - backtest state
 * @param {Array} msg - message
 * @returns {object} nextBtState
 */
const onWSEventTrade = async (btState = {}, msg = []) => {
  const { strategy } = btState
  const [,, trade = {}] = msg
  let nextStrategyState = strategy

  if (isSeedTS(trade.mts)) {
    nextStrategyState = await onSeedTrade(strategy, trade)
  } else {
    nextStrategyState = await onTrade(strategy, trade)
  }

  btState.lastPrice = trade.price
  btState.nTrades = btState.nTrades + 1
  btState.strategy = nextStrategyState

  return btState
}

module.exports = onWSEventTrade
