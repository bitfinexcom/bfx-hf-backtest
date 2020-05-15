'use strict'

const asciiChart = require('asciichart')
const { preparePrice, prepareAmount } = require('bfx-api-node-util')
const { TIME_FRAME_WIDTHS } = require('bfx-hf-util')
const HFS = require('bfx-hf-strategy')
const _isObject = require('lodash/isObject')
const _flatten = require('lodash/flatten')
const _min = require('lodash/min')
const _max = require('lodash/max')

const PRICE_WINDOW_HALF_LENGTH = 20
const CHART_HEIGHT = 10
const CHART_PADDING = '            '

// TODO: Doc
const genPriceAction = (btState, trade) => {
  const { strategy = {} } = btState
  const candles = HFS.getCandles(strategy)
  const tf = HFS.getDefaultTF(strategy)
  const tfWidth = TIME_FRAME_WIDTHS[tf]
  const candleIndex = candles.findIndex(({ mts }) => (trade.mts - mts) < tfWidth)
  const candleWindow = candles.slice(
    _max([0, candleIndex - PRICE_WINDOW_HALF_LENGTH]),
    _min([candles.length - 1, candleIndex + PRICE_WINDOW_HALF_LENGTH])
  )

  // Supports 1 level of nesting in indicator values
  const { iv } = trade
  const indicatorRows = []

  indicatorRows.push(
    `${prepareAmount(trade.amount)} @ ${preparePrice(trade.price)}`
  )

  indicatorRows.push(`pl = ${prepareAmount(trade.pl)}`)

  indicatorRows.push('')
  indicatorRows.push(..._flatten(Object.keys(iv).map((key) => {
    if (_isObject(iv[key])) {
      return Object.keys(iv[key]).map(k => `${key}.${k} = ${iv[key][k].toFixed(4)}`)
    }

    return [`${key} = ${iv[key].toFixed(4)}`]
  })))

  // test
  const chartRows = asciiChart.plot(candleWindow.map(c => c.close), {
    height: CHART_HEIGHT,
    format: function (x) {
      return (CHART_PADDING + x.toFixed(2)).slice(-CHART_PADDING.length)
    }
  }).split('\n')

  const maxRows = _max([indicatorRows.length, chartRows.length])
  const indicatorRowLengths = indicatorRows.map(row => row.length)
  const output = []

  indicatorRowLengths.sort((a, b) => b - a)

  const leftWidth = indicatorRowLengths[0]

  for (let i = 0; i < maxRows; i += 1) {
    let line = ''

    if (indicatorRows[i]) {
      line += indicatorRows[i]
    }

    while (line.length < leftWidth) {
      line += ' '
    }

    if (chartRows[i]) {
      line += chartRows[i]
    }

    output.push(line)
  }

  return output.join('\n')
}

module.exports = genPriceAction
