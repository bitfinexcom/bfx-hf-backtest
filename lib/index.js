'use strict'

/**
  * Functions for executing backtests with `bfx-hf-strategy` trading strategies,
  * supporting both offline exec from a static dataset and online exec using a
  * `bfx-hf-data-server` instance for loading live data as-needed.
  *
  * @module Backtest
  */

require('./types/backtest_parameters')
require('./types/backtest_state')
require('./types/strategy_trade')
require('./types/candle')
require('./types/trade')

module.exports = {
  execOffline: require('./exec_offline'),
  execOnline: require('./exec_online'),
  initState: require('./init_state')
}
