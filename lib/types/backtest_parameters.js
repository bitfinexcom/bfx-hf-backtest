'use strict'

/**
 * Backtest execution parameters
 *
 * @typedef BacktestParameters
 * @property {string} symbol - symbol
 * @property {string} tf - time frame
 * @property {number|Date} from - backtest period start timestamp
 * @property {number|Date} to - backtest period end timestamp
 * @property {string} [host] - HF data server endpoint
 * @property {boolean} [includeTrades] - default false
 * @property {boolean} [sync] - default true
 * @property {number} [seedPeriod] - calculated from indicators
 */
