'use strict'

const WS = require('ws')
const debug = require('debug')('hf:backtest:exec')
const _isFinite = require('lodash/isFinite')

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
 * @param {Object} strategy
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
module.exports = async (strategy = {}, args = {}) => {
  const {
    from,
    to,
    symbol,
    tf,
    host = DEFAULT_HOST,
    includeTrades = true,
    candleFields = '*',
    tradeFields = '*',
    sync = true
  } = args

  const {
    seedPeriod = seedPeriodForIndicators(strategy)
  } = strategy

  // Adjust range for seed period
  const nTo = Number(to)
  let nFrom = Number(from)

  if (_isFinite(seedPeriod) && seedPeriod > 0) {
    nFrom -= seedPeriod * candleWidth(tf)
  }

  debug('running via %s', host)

  const ws = new WS(host)

  let btState = initState({
    ...args,

    // Set backtesting flag to disable real trades/tracking
    strategy: {
      ...strategy,

      trades: [],
      backtesting: true
    },

    from: nFrom,
    to: nTo,
    ws
  })

  const btMessages = []
  let processing = false
  let currentMessage = 0

  // TODO: Refactor; this has many performance leaks, but it gets the job done.
  const processMessages = async () => {
    let msg

    while (currentMessage <= btMessages.length - 1) {
      msg = btMessages[currentMessage]
      currentMessage += 1

      btState = await onWSMessage(btState, msg)

      if (currentMessage % 10000 === 0) {
        debug(
          'processed 10k messages (%d/%d)',
          currentMessage, btMessages.length
        )
      }
    }
  }

  let cleanupTimeout = null

  // TODO: Refactor; a few messages are always left un-processed, hence the need
  //       for a cleanup task
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

    btState = await onWSOpen(btState)

    debug('requesting data stream...')

    // The connection is closed after receiving a 'bt.end' message
    sendWSCommand(btState, 'bt', [
      nFrom,
      nTo,
      symbol,
      tf,
      includeTrades,
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
    btState = await onWSClose(btState)

    debug('backtest complete, socket closed')
  })
}
