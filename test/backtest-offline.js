/* eslint-env mocha */

'use strict'

const assert = require('assert')

const { execOffline } = require('../')

const getStrategy = require('./get-strategy')

describe('basic', () => {
  it('just candles: creates trades, calcs prices, pl and fees', async () => {
    const candles = require('./fixtures/btc-usd-candles.js')

    const args = { candles, trades: [] }
    const strategy = getStrategy({ tf: '15m', symbol: 'tBTCUSD' })
    const state = await execOffline(strategy, args)

    const { trades } = state.strategy
    assert.strictEqual(trades.length, 8)

    const { fees, pl, prices } = trades.reduce((acc, el) => {
      acc.pl += el.pl
      acc.fees += el.fee
      acc.prices.push(el.price)

      return acc
    }, { fees: 0, pl: 0, prices: [] })

    assert.strictEqual(fees, 633.102)
    assert.strictEqual(pl, -1672.102)
    assert.deepStrictEqual(
      prices,
      [
        39130, 38844,
        39600, 38844,
        39415, 38734,
        40650, 41334
      ]
    )
  })

  it('trades & candles', async () => {
    const candlesSource = require('./fixtures/eth-eur-candles.js')
    const tradesSource = require('./fixtures/eth-eur-trades.js')

    const args = { candles: candlesSource, trades: tradesSource }
    const strategy = getStrategy({ tf: '5m', symbol: 'tETHEUR' })
    const state = await execOffline(strategy, args)

    const { trades } = state.strategy
    assert.strictEqual(trades.length, 6)

    const { fees, pl, prices } = trades.reduce((acc, el) => {
      acc.pl += el.pl
      acc.fees += el.fee
      acc.prices.push(el.price)

      return acc
    }, { fees: 0, pl: 0, prices: [] })

    assert.strictEqual(fees, 12.772849540920001)
    assert.strictEqual(pl, -39.93235680092029)
    assert.deepStrictEqual(
      prices,
      [1075.09213886, 1056.9326316, 1049.1, 1067.4, 1064.3, 1073.6]
    )
  })
})
