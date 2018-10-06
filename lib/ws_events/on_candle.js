'use strict'

const {
  onSeedCandle, onSeedCandleUpdate, onCandle, onCandleUpdate
} = require('bfx-hf-strategy')

const isSeedTS = require('../util/is_seed_ts')

/**
 * Called for incoming backtest candle messages
 *
 * @param {Object} btState
 * @param {*[]} msg
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}, msg = []) => {
  const { lastCandle, strategy } = btState
  const { candlePrice } = strategy
  const [, symbol, tf, candle = {}] = msg
  const isUpdate = lastCandle && lastCandle.mts === candle.mts
  let nextStrategyState = strategy

  if (isSeedTS(candle.mts)) {
    if (isUpdate) {
      nextStrategyState = await onSeedCandleUpdate(strategy, candle)
    } else {
      nextStrategyState = await onSeedCandle(strategy, candle)
    }
  } else {
    if (isUpdate) {
      nextStrategyState = await onCandleUpdate(strategy, candle)
    } else {
      nextStrategyState = await onCandle(strategy, candle)
    }
  }

  btState.lastCandle = candle
  btState.lastPrice = candle[candlePrice]
  btState.nCandles += 1
  btState.strategy = nextStrategyState

  return btState
}
