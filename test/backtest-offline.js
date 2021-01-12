/* eslint-env mocha */

'use strict'

const assert = require('assert')

const { execOffline } = require('../')

const candles = require('./fixtures/btc-usd-candles.js')
const getStrategy = require('./get-strategy')

describe('basic', () => {
  it('just candles: creates trades, calcs prices, pl and fees', async () => {
    const args = { candles, trades: [] }
    const strategy = getStrategy({ tf: '15m', symbol: 'tBTCUSD' })
    const state = await execOffline(strategy, args)

    const { trades } = state.strategy
    assert.strictEqual(trades.length, 14)

    const { fees, pl, prices } = trades.reduce((acc, el) => {
      acc.pl += el.pl
      acc.fees += el.fee
      acc.prices.push(el.price)

      return acc
    }, { fees: 0, pl: 0, prices: [] })

    assert.strictEqual(fees, 1103.4021953382398)
    assert.strictEqual(pl, -5370.304526218242)
    assert.deepStrictEqual(
      prices,
      [
        39130, 38844,
        37910, 39600,
        39657, 38844,
        38888.09766912, 39415,
        39560, 38734,
        39163, 40650,
        39972, 41334
      ]
    )
  })
})
