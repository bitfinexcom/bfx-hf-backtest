'use strict'

const _isFinite = require('lodash/isFinite')

/**
 * Evalutes if the timestamp is prior to backtest start
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest staet
 * @param {number} ts - timestamp
 * @return {boolean} isSeedTS
 */
const isSeedTS = (btState = {}, ts) => {
  const { from } = btState

  return _isFinite(ts) && _isFinite(from) && ts < from
}

module.exports = isSeedTS
