'use strict'

/**
 * Updates backtest state to reflect connection open.
 *
 * @private
 *
 * @param {object} btState - backtest state
 */
const onOpen = async (btState = {}) => {
  btState.isWSOpen = true
  btState.isWSClosing = false
}

module.exports = onOpen
