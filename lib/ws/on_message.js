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
 * @param {Object} msg
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}, msg = {}) => {
  try {
    const [type] = msg

    switch (type) {
      case C.BT_START: {
        return onStart(btState, msg)
      }

      case C.BT_SYNC_START: {
        return onSyncStart(btState, msg)
      }

      case C.BT_SYNC_END: {
        return onSyncEnd(btState, msg)
      }

      case C.BT_END: {
        return onEnd(btState, msg)
      }

      case C.BT_CANDLE: {
        return onCandle(btState, msg)
      }

      case C.BT_TRADE: {
        return onTrade(btState, msg)
      }

      default: {
        // debug('recv unknown client message: %j', msg)
        return btState
      }
    }
  } catch (e) {
    debug('failed to handle data server msg: %s [%j]', e.stack, msg)
    return btState
  }
}
