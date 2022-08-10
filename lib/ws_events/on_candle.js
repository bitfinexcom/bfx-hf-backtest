'use strict'

const {
  onSeedCandle,
  onSeedCandleUpdate,
  onCandle,
  onCandleUpdate
} = require('bfx-hf-strategy')

const isSeedTS = require('../util/is_seed_ts')
const simulateLiveCandle = require('../util/simulate_live_candle')

const SIMULATE_LIVE_CANDLES = true

/**
 * Called for incoming backtest candle messages
 *
 * @param {Object} btState
 * @param {*[]} msg
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}, msg = []) => {
  const { lastCandle, strategy, priceFeed, lastPriceUpdate } = btState
  const { candlePrice } = strategy
  const [,,, candle = {}] = msg
  const isUpdate = lastCandle && lastCandle.mts === candle.mts
  let nextStrategyState = strategy

  if (isSeedTS(btState, candle.mts)) {
    if (isUpdate) {
      nextStrategyState = await onSeedCandleUpdate(strategy, candle)
    } else {
      nextStrategyState = await onSeedCandle(strategy, candle)
    }
  } else {
    if (isUpdate) {
      nextStrategyState = await onCandleUpdate(strategy, candle)
    } else {
      nextStrategyState = SIMULATE_LIVE_CANDLES
        ? await simulateLiveCandle(btState, candle)
        : await onCandle(strategy, candle)
    }
  }

  btState.lastCandle = candle
  btState.lastPrice = candle[candlePrice]
  btState.nCandles += 1
  btState.strategy = nextStrategyState
  btState.candles.push(candle)

  if (candle.mts > lastPriceUpdate) {
    priceFeed.update(candle[candlePrice], candle.mts)
    btState.lastPriceUpdate = candle.mts
  }

  return btState
}
