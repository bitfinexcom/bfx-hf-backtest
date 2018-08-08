'use strict'

/**
 * @param {Object} btState
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}) => {
  return {
    ...btState,
    isWSOpen: false,
    isWSClosing: false
  }
}
