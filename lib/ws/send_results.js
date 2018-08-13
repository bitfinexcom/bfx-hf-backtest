'use strict'

const debug = require('debug')('hf:bt:ws:send_results')
const { forEachIndicator } = require('bfx-hf-strategy')

const sendCommand = require('../ws/send_command')

/**
 * Creates a new BT results model on the data server, associated with the
 * active strategy
 *
 * @param {Object} btState
 */
module.exports = (btState = {}) => {
  const { strategy = {} } = btState
  const { trades = [] } = strategy
  const id = `${strategy.id}-${btState.mts}`
  const indicators = []

  forEachIndicator(strategy, (i, key) => {
    indicators.push({
      ...i.serialize(),
      key
    })
  })

  debug('sending strategy results to data server')

  sendCommand(btState, 'bt.results.new', [id, indicators, trades])
}
