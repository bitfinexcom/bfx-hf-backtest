'use strict'

/**
 * @param {Object} btState
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}) => {
  return {
    ...btState,
    isWSOpen: true,
    isWSClosing: false
  }
}
