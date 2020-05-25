'use strict'

/**
 * This module provides an interface for executing backtests using either
 * offline data, or a {@link module:bfx-hf-data-server|bfx-hf-data-server}
 * instance for historical Bitfinex market data.
 *
 * ### Features
 *
 * * Offline backtest execution with user-supplied trade & candle data
 * * Online backtest execution with data from
 *   {@link module:bfx-hf-data-server|bfx-hf-data-server}
 * * Simulates trades within a candle if none are provided
 *
 * ### Installation
 *
 * ```bash
 * npm i --save bfx-hf-backtest
 * ```
 *
 * ### Quickstart
 *
 * ```js
 * const HFS = require('bfx-hf-strategy')
 * const HFBT = require('bfx-hf-backtest')
 * const Strategy = ... // strategy instance
 * const candles = [...]
 *
 * const candleKey = HFS.candleMarketDataKey({
 *   symbol: SYMBOLS.BTC_USD,
 *   tf: TIME_FRAMES.ONE_HOUR
 * })
 *
 * HFBT.execOffline(strat, {
 *   trades: {},
 *   candles: {
 *     [candleKey]: candles,
 *   }
 * }).then((btState) => {
 *   const { trades = [] } = btState
 *
 *   // analyze backtest trades...
 * })
 * ```
 *
 * @license Apache-2.0
 * @module bfx-hf-backtest
 */

module.exports = require('./lib')
