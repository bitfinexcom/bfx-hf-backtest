'use strict'

const WS = require('ws')
const PI = require('p-iteration')
const debug = require('debug')('hf:backtest:exec')
const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')
const _isEmpty = require('lodash/isEmpty')
const _max = require('lodash/max')

const { seedPeriodForIndicators } = require('bfx-hf-strategy')
const { candleWidth } = require('bfx-hf-util')

const { DEFAULT_HOST } = require('./constants')
const initState = require('./init_state')
const onWSOpen = require('./ws/on_open')
const onWSMessage = require('./ws/on_message')
const onWSClose = require('./ws/on_close')
const sendWSCommand = require('./ws/send_command')
const isStrategyMessage = require('./ws/is_strategy_message')
const C = require('./constants')

/**
 * Executes a backtest for the specified period/symbol/tf, logs results to the
 * console.
 *
 * @param {Object[]} strategies
 * @param {Object} args
 * @param {string?} args.host - HF data server endpoint
 * @param {number|Date} args.from - backtest period start timestamp
 * @param {number|Date} args.to - backtest period end timestamp
 * @param {string} args.symbol
 * @param {string} args.tf - time frame
 * @param {boolean?} args.includeTrades - defaults to false
 * @param {boolean?} args.sync - default true
 * @param {number?} args.seedPeriod - optional, calculated from indicators
 * @param {string|string[]?} args.candleFields
 * @param {string|string[]?} args.tradeFields
 */
module.exports = async (strategies = [], args = {}) => {
  const {
    from,
    to,
    symbol,
    tf,
    exchange,
    host = DEFAULT_HOST,
    candles = true,
    trades = true,
    sync = true
  } = args

  if (!_isString(exchange) || _isEmpty(exchange)) {
    throw new Error('exchange required')
  }

  const maxSeedPeriod = _max(strategies.map(strat => (
    strat.seedPeriod || seedPeriodForIndicators(strat)
  )))

  // Adjust range for seed period
  const nTo = Number(to)
  let nFrom = Number(from)

  if (_isFinite(maxSeedPeriod) && maxSeedPeriod > 0) {
    nFrom -= maxSeedPeriod * candleWidth(tf)
  }

  debug('running via %s', host)

  const ws = new WS(host)
  const btStates = strategies.map((strat, i) => (
    initState({
      ...args,

      from: nFrom,
      to: nTo,
      ws: i === 0 ? ws : null, // only the first strategy has a socket

      strategy: {
        ...strat,
        backtesting: true,
        trades: []
      }
    })
  ))

  const btMessages = []

  const startProcessing = async () => {
    await processMessages()
  }

  const processMessages = async () => {
    let currentMessage = 0
    let msg

    while (currentMessage <= btMessages.length - 1) {
      msg = btMessages[currentMessage]
      currentMessage += 1

      if (isStrategyMessage(msg)) {
        const hasMany = btStates.length > 1

        for (let i = 0; i < btStates.length; i += 1) {
          btStates[i] = await onWSMessage(btStates[i], msg, i === 0, hasMany)
        }
      }

      if (currentMessage % 10000 === 0) {
        debug(
          'processed 10k messages (%d/%d)',
          currentMessage, btMessages.length
        )
      }
    }
  }

  let wsMessage

  ws.on('message', (msgJSON = '') => {
    try {
      wsMessage = JSON.parse(msgJSON)
      btMessages.push(wsMessage)
    } catch (e) {
      debug('error parsing bt message: %s', e.message)
    }

    if (wsMessage[0] === C.MESSAGES.BT_END) {
      debug('processing %d messages...', btMessages.length)
      startProcessing()
    } else if (wsMessage[0] === C.MESSAGES.BT_START) {
      debug('receiving backtest data...')
    }
  })

  ws.on('open', async () => {
    debug('ws open')

    await PI.forEach(btStates, async (state, i) => {
      btStates[i] = await onWSOpen(state)
    })

    debug('requesting data stream...')

    // The connection is closed after receiving a 'bt.end' message
    // NOTE: Only the first strategy is used here, as the websocket is shared
    sendWSCommand(btStates[0], 'exec.bt', [
      exchange,
      nFrom,
      nTo,
      symbol,
      tf,
      candles,
      trades,
      sync
    ])
  })

  ws.on('close', async () => {
    await PI.forEach(btStates, async (state, i) => {
      btStates[i] = await onWSClose(state)
    })

    debug('backtest complete, socket closed')
  })
}
