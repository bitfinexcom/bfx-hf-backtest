// @create-index

const onCandle = require('./on_candle.js');
const onEnd = require('./on_end.js');
const onStart = require('./on_start.js');
const onSyncEnd = require('./on_sync_end.js');
const onSyncStart = require('./on_sync_start.js');
const onTrade = require('./on_trade.js');

module.exports = {
  onCandle,
  onEnd,
  onStart,
  onSyncEnd,
  onSyncStart,
  onTrade,
}


