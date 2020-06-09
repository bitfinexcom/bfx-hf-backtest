'use strict'

/**
 * @private
 *
 * @param {object} btState - backtest state
 * @returns {object} nextBtState
 */
const onWSOpen = async (btState = {}) => ({
  ...btState,
  isWSOpen: true,
  isWSClosing: false
})

module.exports = onWSOpen
