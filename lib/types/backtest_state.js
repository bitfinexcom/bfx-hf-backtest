'use strict'

/**
 * Backtest state holding results and backtest metadata
 *
 * @typedef BacktestState
 * @property {WebSocket} [ws] websocket used to communicate with a
 *   `bfx-hf-data-server` instance for online backtests
 * @property {string} [host] URL to a `bfx-hf-data-server` instance for online
 *   backtests
 * @property {object} strategy - strategy under test
 * @property {boolean} isWSOpen - indicates if a connection to a
 *   `bfx-hf-data-server` instance is open
 * @property {boolean} isWSClosing - indicates the `bfx-hf-data-server`
 *   connection is closing
 * @property {number} nTrades - number of trades seen on the backtest
 * @property {number} nCandles - number of candles seen on the backtest
 * @property {StrategyTrade} trades - trades executed by the strategy under test
 * @property {object} execPeriod - range of the backtest
 * @property {number} execPeriod.from - timestamp indicating the start of the
 *  backtest
 * @property {number} execPeriod.to - timestamp indicating the end of the
 *  backtest
 *  @property {number} mts - timestamp of the backtest run
 *  @property {Candle} lastCandle - last seen candle on the test
 *  @property {Candle} lastTrade - last seen trade on the test
 */
