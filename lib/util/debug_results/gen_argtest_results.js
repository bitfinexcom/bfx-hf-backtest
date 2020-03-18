'use strict'

const colors = require('colors')
const _isFinite = require('lodash/isFinite')
const _groupBy = require('lodash/groupBy')
const _keys = require('lodash/keys')

const plToCLIStr = require('./pl_to_cli_str')

// TODO: doc
// NOTE: Results are of the form [profitFactor, row = [...]]
const logArgTestResults = (debug, btState, isPrimary) => {
  const { strategy = {} } = btState
  const { trades = [], testArgValue } = strategy
  const symbolTrades = _groupBy(trades, 'symbol')
  const rows = []

  _keys(symbolTrades).forEach(symbol => {
    let plSum = 0
    let volSum = 0
    let feeSum = 0
    let maxPL = -Infinity
    let minPL = Infinity

    symbolTrades[symbol].forEach(t => {
      plSum += t.pl
      volSum += _isFinite(t.price) ? Math.abs(t.price * t.amount) : 0
      feeSum += t.fee
      minPL = Math.min(minPL, t.pl)
      maxPL = Math.max(maxPL, t.pl)
    })

    const losses = trades.filter(t => t.pl < 0).map(t => t.pl)
    const gains = trades.filter(t => t.pl > 0).map(t => t.pl)
    const opens = trades.filter(t => t.pl === 0)
    const totalGain = gains.reduce((pv, v) => pv + v, 0)
    const totalLoss = losses.reduce((pv, v) => pv + v, 0)
    const profitFactor = totalGain / Math.abs(totalLoss)

    rows.push([profitFactor, [
      testArgValue, colors.blue(profitFactor.toFixed(2)),
      plToCLIStr(plSum.toFixed(2)), plToCLIStr(maxPL.toFixed(2)),
      plToCLIStr(minPL.toFixed(2)), plToCLIStr(feeSum.toFixed(2)),
      colors.blue(opens.length), colors.blue(gains.length),
      colors.blue(losses.length), colors.blue(volSum.toFixed(2))
    ]])
  })

  return rows
}

module.exports = logArgTestResults
