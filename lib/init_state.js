'use strict'

const { DEFAULT_HOST } = require('./constants')

/**
 * Initializes state for a backtest
 *
 * @param {object} args - backtest parameters
 * @param {string} [args.host] - should match ws connection
 * @param {WebSocket} args.ws - ws client, connected to target host
 * @param {number} args.from
 * @param {number} args.to
 * @param {object} args.strategy - strategyState
 * @returns {object} btState
 */
module.exports = (args = {}) => {
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
