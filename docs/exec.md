## Functions

<dl>
<dt><a href="#execOffline">execOffline(strategy, args, progressCallback)</a> ⇒ <code>Object</code></dt>
<dd><p>Run an offline backtest with user-supplied data</p>
</dd>
<dt><a href="#execOnline">execOnline(strategies, args)</a></dt>
<dd><p>Executes a backtest for the specified period/symbol/tf, logs results to the
console.</p>
</dd>
<dt><a href="#execStream">execStream(strategy, market, args, progressCallback)</a></dt>
<dd><p>Executes a backtest on a dazaar market data stream, logs results to the
console.</p>
</dd>
</dl>

<a name="execOffline"></a>

## execOffline(strategy, args, progressCallback) ⇒ <code>Object</code>
Run an offline backtest with user-supplied data

**Kind**: global function  
**Returns**: <code>Object</code> - btState  

| Param | Type | Description |
| --- | --- | --- |
| strategy | <code>Object</code> |  |
| args | <code>Object</code> |  |
| args.candles | <code>Object</code> | key'ed by market, assumed sorted! |
| args.trades | <code>Object</code> | key'ed by market, assumed sorted! |
| progressCallback | <code>function</code> | optional, called with i/total updates |

<a name="execOnline"></a>

## execOnline(strategies, args)
Executes a backtest for the specified period/symbol/tf, logs results to the
console.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| strategies | <code>Array.&lt;Object&gt;</code> |  |
| args | <code>Object</code> |  |
| args.host | <code>string</code> | HF data server endpoint |
| args.from | <code>number</code> \| <code>Date</code> | backtest period start timestamp |
| args.to | <code>number</code> \| <code>Date</code> | backtest period end timestamp |
| args.symbol | <code>string</code> |  |
| args.tf | <code>string</code> | time frame |
| args.includeTrades | <code>boolean</code> | defaults to false |
| args.sync | <code>boolean</code> | default true |
| args.seedPeriod | <code>number</code> | optional, calculated from indicators |
| args.candleFields | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  |
| args.tradeFields | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  |

<a name="execStream"></a>

## execStream(strategy, market, args, progressCallback)
Executes a backtest on a dazaar market data stream, logs results to the
console.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| strategy | <code>Array.&lt;Object&gt;</code> |  |
| market | <code>Object</code> |  |
| args | <code>Object</code> |  |
| args.from | <code>number</code> \| <code>Date</code> | backtest period start timestamp |
| args.to | <code>number</code> \| <code>Date</code> | backtest period end timestamp |
| args.isTrade | <code>function</code> | optional, function to detect a trade vs. a candle |
| progressCallback | <code>function</code> | optional, called with i/total updates |

