'use strict'

const _isFunction = require('lodash/isFunction')
const { closeOpenPositions } = require('bfx-hf-strategy')

const debug = require('../util/debug')
const debugResults = require('../util/debug_results')
const sendResults = require('../ws/send_results')

/**
 * Called for incoming backtest end messages. (ws client must exist, as this
 * func is triggered by a ws event)
 *
 * @private
 *
 * @param {object} btState - backtest state
 * @param {Array} msg - message
 * @param {boolean} isPrimary - true if this is the primary strategy
 * @param {boolean} hasMany - true if multiple strategies are being tested
 * @returns {object} nextBtState
 */
const onWSEventEnd = async (btState = {}, msg = [], isPrimary, hasMany) => {
  const { strategy = {}, ws } = btState
  const { onEnd } = strategy
  let strategyState = strategy

  if (_isFunction(onEnd)) {
    strategyState = await onEnd(strategyState)
  }

  strategyState = await closeOpenPositions(strategyState)

  const { trades = [] } = strategyState

  if (isPrimary) {
    debug(
      'backtest ended (%d strategy trades, %d candles, %d trades)',
      trades.length, btState.nCandles, btState.nTrades
    )
  }

  debugResults({
    ...btState,
    strategy: strategyState
  }, hasMany)

  if (ws) {
    sendResults({
      ...btState,
      strategy: strategyState
    })

    ws.close()
  }

  return {
    ...btState,

    isWSClosing: true,
    execPeriod: null,
    strategy: strategyState
  }
}

module.epoxrts = onWSEventEnd
