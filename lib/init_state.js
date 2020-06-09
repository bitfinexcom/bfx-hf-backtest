'use strict'

const { DEFAULT_HOST } = require('./constants')

/**
 * Create a new backtest state object
 *
 * @param {object} args - arguments
 * @param {string} [args.host] - should match ws connection
 * @param {ws.WebSocket} args.ws - ws client, connected to target host
 * @param {number} args.from - bt start timestamp
 * @param {number} args.to - bt end timestamp
 * @param {object} args.strategy - strategyState
 * @returns {object} initialBtState
 */
const initState = (args = {}) => {
  const { strategy = {}, ws, from, to, host = DEFAULT_HOST } = args

  return {
    ws,
    host,
    strategy,

    isWSOpen: false,
    isWSClosing: false,

    nTrades: 0,
    nCandles: 0,
    trades: [],
    position: null,
    execPeriod: {
      from,
      to
    },

    mts: Date.now(),
    lastCandle: null,
    lastTrade: null
  }
}

module.exports = initState
