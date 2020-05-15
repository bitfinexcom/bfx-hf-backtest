'use strict'

const colors = require('colors')
const Table = require('cli-table')
const _min = require('lodash/min')
const _max = require('lodash/max')
const plToCLIStr = require('./pl_to_cli_str')

const genTradesPerDayTable = (strategy = {}) => {
  const { trades = [] } = strategy
  const table = new Table({
    head: [
      'Date', 'Trades', '% of Trades', 'Gains', 'Losses', 'P/L', 'Min P/L',
      'Max P/L'
    ],

    colAligns: [
      'right', 'middle', 'middle', 'middle', 'middle', 'right', 'right', 'right'
    ],

    chars: {
      mid: '',
      'left-mid': '',
      'mid-mid': '',
      'right-mid': ''
    }
  })

  const data = {}

  trades.forEach((trade) => {
    const dateString = new Date(trade.mts).toDateString()

    if (!data[dateString]) {
      data[dateString] = []
    }

    data[dateString].push(trade)
  })

  Object.keys(data).forEach((dateString) => {
    const dateTrades = data[dateString]
    const tradesPerc = (dateTrades.length / trades.length) * 100
    const nGains = dateTrades.filter(t => t.pl > 0).length
    const nLosses = dateTrades.filter(t => t.pl < 0).length
    const pl = dateTrades.reduce((prev, acc) => prev + acc.pl, 0)
    const minPL = _min(dateTrades.filter(t => t.pl !== 0).map(t => t.pl))
    const maxPL = _max(dateTrades.filter(t => t.pl !== 0).map(t => t.pl))

    table.push([
      colors.green(dateString), colors.blue(dateTrades.length),
      colors.blue(tradesPerc.toFixed(2)), colors.blue(nGains),
      colors.blue(nLosses), plToCLIStr(pl.toFixed(2)),
      plToCLIStr(minPL ? minPL.toFixed(2) : 0),
      plToCLIStr(maxPL ? maxPL.toFixed(2) : 0)
    ])
  })

  return table.toString()
}

module.exports = genTradesPerDayTable
