'use strict'

const { sprintf } = require('sprintf-js')
const colors = require('colors/safe')
const _min = require('lodash/min')

const lml = require('./log_multiline')
const logBasicStats = require('./log_basic_stats')
const genArgTestResults = require('./gen_argtest_results')
const genArgTestResultsTable = require('./gen_argtest_results_table')
const genPLChart = require('./gen_pl_chart')
const genTradesTable = require('./gen_trades_table')
const genAggTradesTable = require('./gen_agg_trades_table')
const genPriceAction = require('./gen_price_action')

const PADDING = '  '

// Hacky workaround for processing multiple strategy backtests at once via
// multiple websocket event handlers (same handler, multiple calls)
const argTestResultsData = {}

// TODO: Refactor (need to parallelize anyway)
const printArgTestResults = () => {
  const { rows, debug, testArgKey } = argTestResultsData
  const table = genArgTestResultsTable(testArgKey)

  rows.sort((a, b) => b[0] - a[0])
  rows.forEach(row => table.push(row[1]))

  debug('')
  debug(
    '%s', colors.green(`-- Argument Test Results for ${testArgKey} --`)
  )

  lml(debug, table.toString().split('\n'))
}

/**
 * Logs backtest results to the console
 *
 * @memberOf module:Backtest
 *
 * @param {BacktestState} btState - backtest state
 * @param {boolean} summarize - if true, only a summary of results is displayed
 * @param {boolean} isPrimary - true if this is the first result from a set
 */
const debugResults = (btState = {}, summarize = false, isPrimary) => {
  // NOTE: We use console.log instead of debug() (the pre-v2 method) to remove
  // the millisecond deltas from the output
  const debug = (...args) => console.log(PADDING + sprintf(...args))
  const { output = {}, strategy = {} } = btState
  const { testArgKey, trades = [] } = strategy
  const {
    showTradeTable, showAggrTradesTable, showPLChart,
    showPriceActionForTopGains, showPriceActionForTopLosses
  } = output

  if (summarize) { // TODO: Refactor, see relevant note above
    if (isPrimary) {
      argTestResultsData.debug = debug
      argTestResultsData.testArgKey = testArgKey
      argTestResultsData.rows = [...genArgTestResults(debug, btState)]
      argTestResultsData.timeout = setTimeout(printArgTestResults, 10)
    } else {
      setTimeout(() => {
        genArgTestResults(debug, btState).forEach(row => (
          argTestResultsData.rows.push(row)
        ))
      }, 0)
    }

    return
  }

  logBasicStats(debug, btState, summarize)

  if (trades.length === 0) {
    return
  }

  debug('')

  if (showTradeTable) {
    debug('%s', colors.green('-- All Strategy Trades --'))
    lml(debug, genTradesTable(strategy).split('\n'))
    debug('')
  }

  if (showAggrTradesTable) {
    debug('%s', colors.green('-- Trades Aggregated By Label --'))
    lml(debug, genAggTradesTable(strategy).split('\n'))
    debug('')
  }

  if (showPLChart) {
    debug('%s', colors.green('-- Strategy P/L over Time --'))
    debug('')
    lml(debug, genPLChart(strategy).split('\n'))
    debug('')
  }

  if (showPriceActionForTopGains) {
    const gains = trades.filter(t => t.pl > 0)
    gains.sort((a, b) => b.pl - a.pl)
    const topGains = gains.slice(0, _min([gains.length, 3]))

    if (topGains.length > 0) {
      debug('%s', colors.green('---- Price Action for Top Gains ----'))

      topGains.forEach((t) => {
        debug('')
        lml(debug, genPriceAction(btState, t).split('\n'))
        debug('')
      })
    }
  }

  if (showPriceActionForTopLosses) {
    const losses = trades.filter(t => t.pl < 0)
    losses.sort((a, b) => b.pl - a.pl)
    const topLosses = losses.slice(0, _min([losses.length, 3]))

    if (topLosses.length > 0) {
      debug('%s', colors.green('---- Price Action for Top Losses ----'))

      topLosses.forEach((t) => {
        debug('')
        lml(debug, genPriceAction(btState, t).split('\n'))
        debug('')
      })
    }
  }
}

module.exports = debugResults
