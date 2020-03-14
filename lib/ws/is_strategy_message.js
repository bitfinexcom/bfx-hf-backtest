'use strict'

const C = require('../constants')

const strategyMessages = {
  [C.MESSAGES.BT_CANDLE]: true,
  [C.MESSAGES.BT_TRADE]: true,
  [C.MESSAGES.BT_START]: true,
  [C.MESSAGES.BT_END]: true
}

/**
 * Returns true if the message is relevant to a backtest
 *
 * @todo rename
 * @private
 *
 * @param {Array} msg - incoming message
 * @returns {boolean} isStrategyMessage
 */
const isStrategyMessage = (msg = []) => {
  const [type] = msg

  return !!strategyMessages[type]
}

module.exports = isStrategyMessage
