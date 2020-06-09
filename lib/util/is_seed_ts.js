'use strict'

const _isFinite = require('lodash/isFinite')

/**
 * @private
 *
 * @param {object} btState - backtest state
 * @param {number} ts - timestamp
 * @returns {boolean} isSeedTS
 */
const isSeedTS = (btState = {}, ts) => {
  const { from } = btState

  return _isFinite(ts) && _isFinite(from) && ts < from
}

module.exports = isSeedTS
