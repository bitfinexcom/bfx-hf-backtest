'use strict'

const colors = require('colors')
const moment = require('moment')
const { sprintf } = require('sprintf-js')
const _isFinite = require('lodash/isFinite')
const _groupBy = require('lodash/groupBy')
const _keys = require('lodash/keys')

const plToCLIStr = require('./pl_to_cli_str')

// TODO: doc
const logBasicStats = (debug, btState) => {
  const { execPeriod = {}, strategy = {} } = btState
  const { trades = [], tf } = strategy
  const { from, to } = execPeriod
  const symbolTrades = _groupBy(trades, 'symbol')

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

    const quote = symbol.substring(4)
    const nTrades = trades.length
    const losses = trades.filter(t => t.pl < 0).map(t => t.pl)
    const gains = trades.filter(t => t.pl > 0).map(t => t.pl)
    const opens = trades.filter(t => t.pl === 0)
    const totalGain = gains.reduce((pv, v) => pv + v, 0)
    const totalLoss = losses.reduce((pv, v) => pv + v, 0)
    const profitFactor = totalGain / Math.abs(totalLoss)

    debug('')
    debug(
      '-- Results for %s:%s over %s --',
      symbol.substr(1), tf, moment.duration(to - from).humanize()
    )

    debug('')
    debug(sprintf(
      'P/L %s | Vol %s | Fees %s',
      plToCLIStr(plSum.toFixed(2)), colors.blue(volSum.toLocaleString()),
      plToCLIStr(feeSum.toFixed(2))
    ))

    debug(sprintf(
      'Min P/L %s | Max P/L %s | Avg P/L %s',
      plToCLIStr(minPL.toFixed(2)), plToCLIStr(maxPL.toFixed(2)),
      plToCLIStr((plSum / nTrades).toFixed(2))
    ))

    debug(sprintf(
      'Losses %s (%s %s) | Gains %s (%s %s)',
      colors.blue(losses.length), quote, colors.red(totalLoss.toFixed(2)),
      colors.blue(gains.length), quote, plToCLIStr(totalGain.toFixed(2))
    ))
    debug('')
    debug(sprintf(
      'Profit Factor: %s | %s Positions | %s Trades',
      colors.blue(profitFactor.toFixed(2)), colors.blue(opens.length),
      colors.blue(nTrades)
    ))
  })
}

module.exports = logBasicStats
