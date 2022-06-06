'use strict'

const { DEFAULT_HOST } = require('./constants')

/**
 * @param {Object} args
 * @param {string?} args.host - should match ws connection
 * @param {WebSocket?} args.ws - ws client, connected to target host
 * @param {number} args.from
 * @param {number} args.to
 * @param {Object} args.strategy - strategyState
 * @return {Object} initialBtState
 */
module.exports = (args = {}) => {
  const { strategy = {}, ws, from, to, host = DEFAULT_HOST, priceFeed } = args

  return {
    ws,
    host,
    strategy,
    priceFeed,

    isWSOpen: false,
    isWSClosing: false,

    nTrades: 0,
    nCandles: 0,
    trades: [],
    candles: [],
    position: null,
    execPeriod: {
      from,
      to
    },

    mts: Date.now(),
    lastCandle: null,
    lastTrade: null,
    lastPriceUpdate: 0
  }
}
