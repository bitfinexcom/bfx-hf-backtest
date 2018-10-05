'use strict'

const debug = require('debug')('hf:bt:util:debug_results')
const _isFinite = require('lodash/isFinite')
const _groupBy = require('lodash/groupBy')
const { sprintf } = require('sprintf-js')
const colors = require('colors/safe')
const Table = require('cli-table')
const moment = require('moment')
// const fs = require('fs')

// TODO: Remove, replaced by logTrades in hf-strategy

module.exports = (btState = {}, summarize = false) => {
  const { strategy = {} } = btState
  const { id, trades = [], tf } = strategy
  const { from, to } = btState.execPeriod || {}

  // Group trades by symbol for P/L calcs
  const symbolTrades = _groupBy(trades, 'symbol')

  const table = new Table({
    head: [
      'Date',
      'Symbol',
      'Direction',
      'Amount',
      'Price',
      'Fee',
      'P&L',
      'Label'
    ].map(title => colors.white(title)),
    colAligns: [
      '',
      '',
      'middle',
      'middle',
      'right',
      'right',
      'right',
      'left'
    ],
    chars: {
      'mid': '',
      'left-mid': '',
      'mid-mid': '',
      'right-mid': ''
    }
  })

  Object.keys(symbolTrades).forEach(symbol => {
    // let csvOutput = ''
    let plSum = 0
    let volSum = 0
    let feeSum = 0
    let maxPL = -Infinity
    let minPL = Infinity
    let pos
    let cl
    let date

    symbolTrades[symbol].forEach(t => {
      // csvOutput += Object.values(t).join(',')
      // csvOutput += '\n'

      plSum += t.pl
      volSum += _isFinite(t.price) ? Math.abs(t.price * t.amount) : 0
      feeSum += t.fee
      minPL = Math.min(minPL, t.pl)
      maxPL = Math.max(maxPL, t.pl)
      pos = t.amount > 0 ? 'LONG' : 'SHORT'

      cl = t.pl === 0
        ? colors.blue
        : t.pl > 0
          ? colors.green
          : colors.red

      date = moment.utc(t.mts).format('YYYY-MM-DD hh:mm:ss')

      table.push([
        date,
        t.symbol.substr(1),
        t.amount > 0 ? 'LONG' : 'SHORT',
        sprintf('%.2f', Math.abs(t.amount)),
        sprintf('%.2f', t.price),
        sprintf('%.2f', t.fee),
        (t.pl > 0 ? '+' : '') + sprintf('%.2f', t.pl),
        t.label || '',
      ].map(row => cl(row)))
    })

    // fs.writeFileSync(`${__dirname}/../../out.csv`, csvOutput)

    // prints trades
    // console.log(table.toString())

    const losses = trades.filter(t => t.pl < 0).map(t => t.pl)
    const gains = trades.filter(t => t.pl > 0).map(t => t.pl)
    const opens = trades.filter(t => t.pl === 0)

    const nTrades = trades.length
    const totalGain = gains.reduce((pv, v) => pv + v, 0)
    const totalLoss = losses.reduce((pv, v) => pv + v, 0)
    const profitFactor = totalGain / Math.abs( totalLoss )

    const fromDate = moment.utc(from).format('YYYY-MM-DD hh:mm:ss')
    const toDate = moment.utc(to).format('YYYY-MM-DD hh:mm:ss')

    if (summarize) {
      debug(sprintf(
        'PF: %.2f | Profit %.2f | Fees %.2f | %d Positions | %d Gains | %d Losses | Vol %.2f | %s',
        profitFactor, plSum, feeSum, opens.length, gains.length, losses.length, volSum, id
      ))
    } else {
      debug(
        'backtest results for %s:%s [%s]',
        symbol.substr(1), tf.toUpperCase(), id
      )

      debug('%s -> %s', fromDate, toDate )

      debug(sprintf(
        'P/L %.2f | Vol %.2f | Fees %.2f',
        plSum, volSum, feeSum
      ))

      debug(sprintf(
        'Min P/L %.2f | Max P/L %.2f | Avg P/L %.2f',
        minPL, maxPL, plSum / nTrades
      ))

      debug(sprintf(
        'Losses %d (total ~$%.2f) | Gains %d (total ~$%.2f)',
        losses.length, -totalLoss, gains.length, totalGain
      ))

      debug(sprintf(
        'Profit Factor: %.2f | %d Positions | %d Trades',
        profitFactor, opens.length, nTrades
      ))
    }
  })
}
