'use strict'

const debug = require('debug')('bfx:hf:backtest:ws:send-results')
const { forEachIndicator } = require('bfx-hf-strategy')

const sendCommand = require('../ws/send_command')

/**
 * Creates a new BT results model on the data server, associated with the
 * active strategy
 *
 * @param {Object} btState
 */
module.exports = (btState = {}) => {
  const { strategy = {}, execPeriod = {} } = btState
  const { symbol, tf, trades = [] } = strategy
  const { from, to } = execPeriod
  const btID = btState.mts
  const stID = strategy.id
  const indicators = []

  forEachIndicator(strategy, (i, key) => {
    indicators.push({
      ...i.serialize(),
      key
    })
  })

  debug('sending strategy results to data server')

  sendCommand(btState, 'submit.bt', [
    btID, stID, indicators, trades, symbol, tf, from, to
  ])
}
