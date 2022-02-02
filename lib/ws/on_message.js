'use strict'

const {
  onTrade, onCandle, onStart, onEnd, onSyncStart, onSyncEnd
} = require('../ws_events')

const debug = require('../util/debug')
const C = require('../constants')

/**
 * Forwards the backtest message to the relevant handler
 *
 * @param {Object} btState
 * @param {array} msg
 * @param {boolean} isPrimary - true if this is the primary strategy
 * @param {boolean} hasMany - true if multiple strategies are being tested
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}, msg = [], isPrimary = false, hasMany = false) => {
  try {
    const [type] = msg

    switch (type) {
      case C.MESSAGES.BT_START: {
        return await onStart(btState, msg, isPrimary)
      }

      case C.MESSAGES.BT_SYNC_START: {
        return await onSyncStart(btState, msg)
      }

      case C.MESSAGES.BT_SYNC_END: {
        return await onSyncEnd(btState, msg)
      }

      case C.MESSAGES.BT_END: {
        return await onEnd(btState, msg, isPrimary, hasMany)
      }

      case C.MESSAGES.BT_CANDLE: {
        return await onCandle(btState, msg)
      }

      case C.MESSAGES.BT_TRADE: {
        return await onTrade(btState, msg)
      }

      case C.MESSAGES.ERROR: {
        debug('recv error: %s [%d]', msg[2], msg[1])
        return btState
      }

      default: {
        return btState
      }
    }
  } catch (e) {
    debug('failed to handle data server msg: %s [%j]', e.stack, msg)
    return btState
  }
}
