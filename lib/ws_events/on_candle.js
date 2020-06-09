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
 * @private
 *
 * @param {object} btState - backtest state
 * @param {Array} msg - message
 * @returns {object} nextBtState
 */
const onWSEventCandle = async (btState = {}, msg = []) => {
  const { lastCandle, strategy } = btState
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

  return btState
}

module.exports = onWSEventCandle
