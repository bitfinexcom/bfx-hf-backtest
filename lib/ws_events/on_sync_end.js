'use strict'

const debug = require('../util/debug')
const moment = require('moment')

/**
 * Called for incoming backtest sync start messages
 *
 * @param {Object} btState
 * @param {*[]} msg
 * @return {Object} nextBtState
 */
module.exports = async (btState = {}, msg = []) => {
  const [, symbol, tf, from, to] = msg

  const fromDate = moment.utc(from).format("YYYY-MM-DD hh:mm:ss")
  const toDate = moment.utc(to).format("YYYY-MM-DD hh:mm:ss")

  debug(
    'backtest data sync ended for %s:%s | %s -> %s',
    symbol.substr(1), tf.toUpperCase(), fromDate, toDate
  )
  console.log('')

  return btState
}
