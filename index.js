'use strict'

/**
 * This module provides an interface for executing backtests using either
 * offline data, or a {@link external:bfx-hf-data-server} instance for
 * historical Bitfinex market data.
 *
 * @license Apache-2.0
 * @module bfx-hf-backtest
 * @example <caption>online backtest</caption>
 * const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')
 * const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')
 * const { execOnline } = require('bfx-hf-backtest')
 *
 * const now = Date.now()
 * const market = {
 *   symbol: SYMBOLS.XMR_USD,
 *   tf: TIME_FRAMES.ONE_MINUTE
 * }
 *
 * const strat = EMAStrategy(market)
 *
 * await execOnline([strat], {
 *   exchange: 'bitfinex',
 *   from: now - (3 * 24 * 60 * 60 * 1000),
 *   to: now,
 *   trades: true,
 *   ...market
 * })
 *
 * @example <caption>offline backtest</caption>
 * const HFS = require('bfx-hf-strategy')
 * const { execOffline } = require('bfx-hf-backtest')
 *
 * const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')
 * const { Candle } = require('bfx-api-node-models')
 * const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')
 * const rawCandleData = [] // data must be provided
 *
 * // During real execution, candles can arrive from any market/at any time (if
 * // sub'ed to multiple time frames); hence, each candle must include its
 * // origin symbol/time frame pair.
 * const market = {
 *   symbol: SYMBOLS.BTC_USD,
 *   tf: TIME_FRAMES.ONE_HOUR
 * }
 *
 * const candleKey = HFS.candleMarketDataKey(market)
 * const strat = EMAStrategy(market)
 * const candles = rawCandleData
 *   .sort((a, b) => a[0] - b[0])
 *   .map(c => ({
 *     ...(new Candle(c).toJS()),
 *     ...market // attach market data
 *   }))
 *
 * await execOffline(strat, {
 *   trades: {},
 *   candles: {
 *     [candleKey]: candles
 *   }
 * })
 */

/**
 * @external bfx-hf-data-server
 * @see https://github.com/bitfinexcom/bfx-hf-data-server
 */

module.exports = require('./lib')
