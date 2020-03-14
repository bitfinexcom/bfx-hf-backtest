'use strict'

const {
  onTrade, onCandle, onStart, onEnd, onSyncStart, onSyncEnd
} = require('../ws_events')

const debug = require('../util/debug')
const C = require('../constants')

/**
 * Forwards the backtest message to the relevant handler.
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest state
 * @param {Array} msg - incoming message
 * @param {boolean} isPrimary - true if this is the primary strategy
 * @param {boolean} hasMany - true if multiple strategies are being tested
 * @returns {Promise} p
 */
const onMessage = async (btState = {}, msg = {}, isPrimary = false, hasMany = false) => {
  try {
    const [type] = msg

    switch (type) {
      case C.MESSAGES.BT_START: {
        return onStart(btState, msg, isPrimary, hasMany)
      }

      case C.MESSAGES.BT_SYNC_START: {
        return onSyncStart(msg, isPrimary, hasMany)
      }

      case C.MESSAGES.BT_SYNC_END: {
        return onSyncEnd(msg, isPrimary, hasMany)
      }

      case C.MESSAGES.BT_END: {
        return onEnd(btState, msg, isPrimary, hasMany)
      }

      case C.MESSAGES.BT_CANDLE: {
        return onCandle(btState, msg, isPrimary, hasMany)
      }

      case C.MESSAGES.BT_TRADE: {
        return onTrade(btState, msg, isPrimary, hasMany)
      }

      case C.MESSAGES.ERROR: {
        debug('recv error: %s [%d]', msg[2], msg[1])
        return btState
      }

      default: {
        // debug('recv unknown client message: %j', msg)
      }
    }
  } catch (e) {
    debug('failed to handle data server msg: %s [%j]', e.stack, msg)
  }
}

module.exports = onMessage
