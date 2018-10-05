'use strict'

const C = require('../constants')

const strategyMessages = {
  [C.BT_CANDLE]: true,
  [C.BT_TRADE]: true,
  [C.BT_START]: true,
  [C.BT_END]: true,
}

module.exports = (msg = {}) => {
  const [type] = msg

  return !!strategyMessages[type]
}
