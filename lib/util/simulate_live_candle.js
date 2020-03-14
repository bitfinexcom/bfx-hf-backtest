'use strict'

const { onCandle, onTrade } = require('bfx-hf-strategy')

const N_TRADES = 5
const DUST = 0.0000001

/**
 * Simulates trades for a candle, calling the `onTrade` handler for each one
 *
 * @memberOf module:Backtest
 * @private
 *
 * @param {BacktestState} btState - backtest state
 * @param {Candle} candle - candle to simulate
 * @returns {Promise} p
 */
const simulateLiveCandle = async (btState = {}, candle = {}) => {
  const { strategy } = btState
  const { open, high, low, close, vol, mts } = candle

  await onCandle(strategy, candle)

  if (!(vol === 0 || (open === close && high === low && open === high))) {
    const trades = []
    let dir = Math.random() > 0.5 ? 1 : -1
    let highReached = open === high
    let lowReached = open === low
    let currPrice = open
    let priceStep = dir === 1 // go to high or low
      ? high === open ? 0 : (high - open) / N_TRADES
      : open === low ? 0 : (open - low) / N_TRADES

    trades.push({
      amount: 0,
      price: currPrice,
      mts
    })

    while (true) {
      // Handle hitting high point (go to low, or close)
      if (!highReached && Math.abs(currPrice - high) < DUST) {
        dir *= -1
        highReached = true
        priceStep = lowReached
          ? high === close ? 0 : (high - close) / N_TRADES // go to close
          : high === low ? 0 : (high - low) / N_TRADES // go to low

      // Handle hitting low point (go to high, or close)
      } else if (!lowReached && Math.abs(currPrice - low) < DUST) {
        dir *= -1
        lowReached = true
        priceStep = highReached
          ? close === low ? 0 : (close - low) / N_TRADES // go to close
          : high === low ? 0 : (high - low) / N_TRADES // go to high
      } else if (highReached && lowReached && Math.abs(currPrice - close) < DUST) {
        break
      }

      if (priceStep === 0) {
        break
      }

      currPrice += priceStep * dir

      trades.push({
        amount: 0, // set evenly at the end
        price: +currPrice.toFixed(7), // starts with open
        mts
      })
    }

    // Set trade amounts & pass to strategy
    const singleTradeAmount = vol / trades.length
    let trade

    for (let i = 0; i < trades.length; i += 1) {
      trade = trades[i]
      trade.amount = singleTradeAmount

      await onTrade(btState.strategy, trade)

      btState.lastPrice = trade.price
      btState.nTrades += 1
    }
  }
}

module.exports = simulateLiveCandle
