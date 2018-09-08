'use strict'

const { resetIndicators } = require('bfx-hf-strategy')
const _isFunction = require('lodash/isFunction')
const moment = require('moment')

const debug = require('../util/debug')

/**
 * Called for incoming backtest start messages
 *
 * @param {Object} btState
 * @param {*[]} msg
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}, msg = []) => {
  const { strategy = {} } = btState
  const { onStart } = strategy
  const [, symbol, tf, from, to] = msg

  const fromDate = moment.utc(from).format("YYYY-MM-DD hh:mm:ss")
  const toDate = moment.utc(to).format("YYYY-MM-DD hh:mm:ss")

  debug('backtest started for %s -> %s', fromDate, toDate)
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
