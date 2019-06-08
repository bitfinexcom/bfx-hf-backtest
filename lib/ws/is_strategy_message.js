'use strict'

const C = require('../constants')

const strategyMessages = {
  [C.MESSAGES.BT_CANDLE]: true,
  [C.MESSAGES.BT_TRADE]: true,
  [C.MESSAGES.BT_START]: true,
  [C.MESSAGES.BT_END]: true,
}

module.exports = (msg = []) => {
  const [type] = msg

  return !!strategyMessages[type]
}
