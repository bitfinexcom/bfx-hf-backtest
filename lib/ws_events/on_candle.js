'use strict'

const {
  onSeedCandle,
  onSeedCandleUpdate,
  onCandle,
  onCandleUpdate
} = require('bfx-hf-strategy')

const isSeedTS = require('../util/is_seed_ts')
const simulateLiveCandle = require('../util/simulate_live_candle')

/**
 * Called for incoming backtest candle messages, routes the message to the
 * relevant handler.
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest state
 * @param {Array} msg - incoming message
 * @returns {Promise} p
 */
module.exports = async (btState = {}, msg = []) => {
  const { lastCandle, strategy } = btState
  const { candlePrice, simulateLiveCandleEnabled } = strategy
  const [,,, candle = {}] = msg
  const isUpdate = lastCandle && lastCandle.mts === candle.mts

  if (isSeedTS(btState, candle.mts)) {
    if (isUpdate) {
      await onSeedCandleUpdate(strategy, candle)
    } else {
      await onSeedCandle(strategy, candle)
    }
  } else {
    if (isUpdate) {
      await onCandleUpdate(strategy, candle)
    } else {
      simulateLiveCandleEnabled
        ? await simulateLiveCandle(btState, candle)
        : await onCandle(strategy, candle)
    }
  }

  btState.lastCandle = candle
  btState.lastPrice = candle[candlePrice]
  btState.nCandles += 1
}
