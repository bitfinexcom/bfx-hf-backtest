'use strict'

const asciiChart = require('asciichart')
const _reduce = require('lodash/reduce')
const _chunk = require('lodash/chunk')

const CHART_HEIGHT = 20
const CHART_WIDTH_CHARS = 90
const CHART_PADDING = '            '

// TODO: doc
const genPLChart = (strategy) => {
  const { trades = [] } = strategy

  const nzPLTrades = trades.filter(t => t.pl !== 0)
  const chunkSize = Math.ceil(nzPLTrades.length / CHART_WIDTH_CHARS)
  const chunkedNZPL = _chunk(nzPLTrades, chunkSize)
    .map(c => _reduce(c, (prev, curr) => prev + curr.pl, 0))

  let lastPL = 0
  const lastPLDataPoints = chunkedNZPL.map((pl) => {
    lastPL += pl
    return lastPL
  })

  return asciiChart.plot(lastPLDataPoints, {
    height: CHART_HEIGHT,
    format: function (x) {
      return (CHART_PADDING + x.toFixed(2)).slice(-CHART_PADDING.length)
    }
  })
}

module.exports = genPLChart
