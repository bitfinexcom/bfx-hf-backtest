'use strict'

const { onTrade, onCandle, onStart, onEnd } = require('./ws_events')
const initState = require('./init_state')
const { Candle, Trade } = require('bfx-api-node-models')

const _defaultIsTrade = (k, v) => {
  return k.candle === null
}

/**
 * Executes a backtest on a dazaar market data stream, logs results to the
 * console.
 *
 * @param {Object[]} strategy
 * @param {Object} market
 * @param {Object} args
 * @param {number|Date} args.from - backtest period start timestamp
 * @param {number|Date} args.to - backtest period end timestamp
 * @param {Function?} args.isTrade - optional, function to detect a trade vs. a candle
 * @param {Boolean?} args.manualOnStart - optional, use for manual `onStart` calls
 * @param {Function?} progressCallback - optional, called with i/total updates
 */

const execStream = async (strategy = {}, market, args = {}, progressCallback) => {
  const isTrade = args.isTrade || _defaultIsTrade
  const { from, to, manualOnStart } = args // FIXME: remove `manualOnStart` in 2.0

  const btState = initState({
    strategy: {
      backtesting: true,
      ...strategy
    },

    from: from,
    to: to
  })

  btState.trades = false

  const exec = getExec({
    market, btState, from, to, isTrade, progressCallback, manualOnStart
  })

  return { exec, btState, onEnd, onStart }
}

function getExec (conf) {
  let {
    market, btState, from, to, isTrade, progressCallback, manualOnStart
  } = conf

  const opts = manualOnStart ? { first: false } : { first: true }
  let count = 0

  return async function (k, el) {
    if (opts.first) {
      opts.first = false
      btState = await onStart(btState, [null, null, null, from, to])
    }

    if (isTrade(k, el)) {
      btState.trades = true

      const sc = {
        ...new Trade(el).toJS(),
        ...market // attach market data
      }

      btState = await onTrade(btState, [null, null, sc])
    } else {
      const sc = {
        ...new Candle(el).toJS(),
        ...market // attach market data
      }

      btState = await onCandle(btState, [null, null, null, sc])
    }

    count++

    if (progressCallback) progressCallback(count)

    return btState
  }
}

module.exports = execStream
