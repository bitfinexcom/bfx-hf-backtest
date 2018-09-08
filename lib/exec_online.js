'use strict'

const WS = require('ws')
const PI = require('p-iteration')
const debug = require('debug')('hf:backtest:exec')
const _isFinite = require('lodash/isFinite')
const _max = require('lodash/max')

const { seedPeriodForIndicators } = require('bfx-hf-strategy')
const { candleWidth } = require('bfx-hf-util')

const { DEFAULT_HOST } = require('./constants')
const initState = require('./init_state')
const onWSOpen = require('./ws/on_open')
const onWSMessage = require('./ws/on_message')
const onWSClose = require('./ws/on_close')
const sendWSCommand = require('./ws/send_command')
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
    host = DEFAULT_HOST,
    candles = true,
    trades = true,
    candleFields = '*',
    tradeFields = '*',
    sync = true
  } = args

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
        trades: []
      }
    })
  ))

  const btMessages = []
  let processing = false
  let currentMessage = 0

  const processMessages = async () => {
    let msg

    while (currentMessage <= btMessages.length - 1) {
      msg = btMessages[currentMessage]
      currentMessage += 1

      for (let i = 0; i < btStates.length; i += 1) {
        btStates[i] = await onWSMessage(btStates[i], msg)
      }

      if (currentMessage % 10000 === 0) {
        debug(
          'processed 10k messages (%d/%d)',
          currentMessage, btMessages.length
        )
      }
    }
  }

  let cleanupTimeout = null

  const startProcessing = (noCleanup) => {
    processing = true

    return processMessages().then(() => {
      processing = false

      if (cleanupTimeout === null && !noCleanup) {
        cleanupTimeout = setTimeout(() => {
          if (currentMessage < btMessages.length && !processing) {
            debug('running final cleanup task')
            startProcessing(true)
          }

          cleanupTimeout = null
        }, 100)
      }
    })
  }

  ws.on('open', async () => {
    debug('ws open')

    await PI.forEach(btStates, async (state, i) => {
      btStates[i] = await onWSOpen(state)
    })

    debug('requesting data stream...')

    // The connection is closed after receiving a 'bt.end' message
    // NOTE: Only the first strategy is used here, as the websocket is shared
    sendWSCommand(btStates[0], 'exec.bt', [
      nFrom,
      nTo,
      symbol,
      tf,
      candles,
      trades,
      candleFields,
      tradeFields,
      sync
    ])
  })

  let isFirstMessage = true

  ws.on('message', (msgJSON = '') => {
    if (isFirstMessage) {
      debug('processing stream...')
      console.log('')
      isFirstMessage = false
    }

    let msg

    try {
      msg = JSON.parse(msgJSON)
      btMessages.push(msg)
    } catch (e) {
      debug('error parsing bt message: %s', e.message)
    }

    if (!processing || msg[0] === C.BT_END) {
      startProcessing()
    }
  })

  ws.on('close', async () => {
    await PI.forEach(btStates, async (state, i) => {
      btStates[i] = await onWSClose(state)
    })

    debug('backtest complete, socket closed')
  })
}
