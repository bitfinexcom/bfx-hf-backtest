'use strict'

const { onCandle } = require('bfx-hf-strategy')

module.exports = async (btState = {}, candle = {}) => {
  const { strategy } = btState

  const nextStrategyState = await onCandle(strategy, candle)

  return nextStrategyState
}
