'use strict'

/**
 * @private
 *
 * @param {object} btState - backtest state
 * @returns {object} nextBtState
 */
const onWSClose = async (btState = {}) => ({
  ...btState,
  isWSOpen: false,
  isWSClosing: false
})

module.exports = onWSClose
