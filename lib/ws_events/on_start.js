'use strict'

const { resetIndicators } = require('bfx-hf-strategy')
const _isFunction = require('lodash/isFunction')

const debug = require('../util/debug')

/**
 * Called for incoming backtest start messages
 *
 * @private
 *
 * @param {object} btState - backtest state
 * @param {Array} msg - message
 * @param {boolean} [isPrimary] - indicates if the handler is being called for
 *   the first strategy in a set of strategies
 * @returns {object} nextBtState
 */
const onWSEventStart = async (btState = {}, msg = [], isPrimary) => {
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

  resetIndicators(strategy)

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

module.exports = onWSEventStart
