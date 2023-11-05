'use strict'

const { resetIndicators } = require('bfx-hf-strategy')
const _isFunction = require('lodash/isFunction')

const debug = require('../util/debug')

/**
 * Called for incoming backtest start messages
 *
 * @param {Object} btState
 * @param {*[]} msg
 * @param {boolean} isPrimary
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}, msg = [], isPrimary = false, shouldResetIndicators = true) => {
  const { strategy = {} } = btState
  const { onStart } = strategy
  const [,,, from, to] = msg

  if (isPrimary) {
    debug(
      'backtest started for %s -> %s',
      new Date(from).toLocaleString(),
      new Date(to).toLocaleString()
    )
  }

  if (shouldResetIndicators) { resetIndicators(strategy) }

  let strategyState = strategy

  if (_isFunction(onStart)) {
    strategyState = await onStart(strategyState)
  }

  return {
    ...btState,

    trades: [],
    positions: {},
    execPeriod: { from, to },
    nTrades: 0,
    nCandles: 0,
    strategy: strategyState
  }
}
