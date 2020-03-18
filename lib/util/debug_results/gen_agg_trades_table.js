'use strict'

const _keys = require('lodash/keys')
const _isEmpty = require('lodash/isEmpty')
const _groupBy = require('lodash/groupBy')
const { prepareAmount } = require('bfx-api-node-util')
const Table = require('cli-table')
const colors = require('colors')

/**
  * TODO: Doc
  *
  * @param {Strategy} strategy
  * @returns {string} aggTableString
  */
const genAggTradesTable = (strategy) => {
  const { trades = [] } = strategy
  const symbolTrades = _groupBy(trades, 'symbol')
  const aggTable = new Table({
    head: ['Label', 'Trades', '% of Trades', 'P/L', 'Min P/L', 'Max P/L'],
    colAligns: ['right', 'middle', 'middle', 'right', 'right', 'right'],
    chars: {
      mid: '',
      'left-mid': '',
      'mid-mid': '',
      'right-mid': ''
    }
  })

  const tradeGroups = {}
  let totalTrades = 0

  _keys(symbolTrades).forEach(symbol => {
    symbolTrades[symbol].filter(t => !_isEmpty(t.label)).forEach(t => {
      const { label } = t

      if (!tradeGroups[label]) {
        tradeGroups[label] = {
          count: 0,
          pl: 0,
          plMin: Infinity,
          plMax: -Infinity
        }
      }

      totalTrades += 1
      tradeGroups[label].count += 1
      tradeGroups[label].pl += t.pl
      tradeGroups[label].plMin = Math.min(tradeGroups[label].plMin, t.pl)
      tradeGroups[label].plMax = Math.max(tradeGroups[label].plMax, t.pl)
    })
  })

  Object
    .keys(tradeGroups)
    .sort((a, b) => tradeGroups[b].pl - tradeGroups[a].pl)
    .forEach((label) => {
      const g = tradeGroups[label]
      const percCount = Math.floor((g.count / totalTrades) * 100)

      aggTable.push([
        label,
        colors.green(g.count),

        colors[percCount > 75
          ? 'red'
          : percCount > 50
            ? 'orange'
            : percCount > 25
              ? 'green'
              : 'blue'](percCount),

        colors[g.pl >= 0 ? 'green' : 'red'](prepareAmount(g.pl)),
        colors[g.plMin >= 0 ? 'green' : 'red'](prepareAmount(g.plMin)),
        colors[g.plMax >= 0 ? 'green' : 'red'](prepareAmount(g.plMax))
      ])
    })

  return aggTable.toString()
}

module.exports = genAggTradesTable
