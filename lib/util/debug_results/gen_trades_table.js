'use strict'

const _keys = require('lodash/keys')
const _groupBy = require('lodash/groupBy')
const { sprintf } = require('sprintf-js')
const Table = require('cli-table')
const colors = require('colors')

/**
  * TODO: Doc
  *
  * @param {Strategy} strategy
  * @returns {string} tableString
  */
const genTradesTable = (strategy) => {
  const { trades = [] } = strategy
  const symbolTrades = _groupBy(trades, 'symbol')
  const table = new Table({
    head: [
      'Date', 'Symbol', 'Direction', 'Amount', 'Price', 'Fee', 'P&L', 'Label'
    ].map(title => colors.white(title)),

    colAligns: [
      '', '', 'middle', 'middle', 'right', 'right', 'right', 'left'
    ],

    chars: {
      mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''
    }
  })

  _keys(symbolTrades).forEach(symbol => {
    let maxPL = -Infinity
    let minPL = Infinity
    let cl
    let date

    symbolTrades[symbol].forEach(t => {
      minPL = Math.min(minPL, t.pl)
      maxPL = Math.max(maxPL, t.pl)

      cl = t.pl === 0
        ? colors.blue
        : t.pl > 0
          ? colors.green
          : colors.red

      date = new Date(+t.mts).toLocaleString()

      table.push([
        date,
        t.symbol.substr(1),
        t.amount > 0 ? 'LONG' : 'SHORT',
        sprintf('%.2f', Math.abs(t.amount)),
        sprintf('%.2f', t.price),
        sprintf('%.2f', t.fee),
        (t.pl > 0 ? '+' : '') + sprintf('%.2f', t.pl),
        t.label || ''
      ].map(row => cl(row)))
    })
  })

  return table.toString()
}

module.exports = genTradesTable
