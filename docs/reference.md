## Modules

<dl>
<dt><a href="#module_bfx-hf-backtest">bfx-hf-backtest</a></dt>
<dd><p>This module provides an interface for executing backtests using either
offline data, or a <a href="https://github.com/bitfinexcom/bfx-hf-data-server">bfx-hf-data-server</a> instance for
historical Bitfinex market data.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#execOffline">execOffline(strategy, args, [progressCallback])</a> ⇒ <code>object</code></dt>
<dd><p>Run an offline backtest with user-supplied data</p>
</dd>
<dt><a href="#execOnline">execOnline(strategies, args)</a> ⇒ <code>Promise</code></dt>
<dd><p>Executes a backtest for the specified period/symbol/tf, logs results to the
console.</p>
</dd>
<dt><a href="#initState">initState(args)</a> ⇒ <code>object</code></dt>
<dd><p>Create a new backtest state object</p>
</dd>
<dt><a href="#debugResults">debugResults(btState, [summarize])</a></dt>
<dd></dd>
</dl>

<a name="module_bfx-hf-backtest"></a>

## bfx-hf-backtest
This module provides an interface for executing backtests using either
offline data, or a [bfx-hf-data-server](https://github.com/bitfinexcom/bfx-hf-data-server) instance for
historical Bitfinex market data.

**License**: Apache-2.0  
**Example** *(online backtest)*  
```js
const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')
const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')
const { execOnline } = require('bfx-hf-backtest')

const now = Date.now()
const market = {
  symbol: SYMBOLS.XMR_USD,
  tf: TIME_FRAMES.ONE_MINUTE
}

const strat = EMAStrategy(market)

await execOnline([strat], {
  exchange: 'bitfinex',
  from: now - (3 * 24 * 60 * 60 * 1000),
  to: now,
  trades: true,
  ...market
})
```
**Example** *(offline backtest)*  
```js
const HFS = require('bfx-hf-strategy')
const { execOffline } = require('bfx-hf-backtest')

const EMAStrategy = require('bfx-hf-strategy/examples/ema_cross')
const { Candle } = require('bfx-api-node-models')
const { SYMBOLS, TIME_FRAMES } = require('bfx-hf-util')
const rawCandleData = [] // data must be provided

// During real execution, candles can arrive from any market/at any time (if
// sub'ed to multiple time frames); hence, each candle must include its
// origin symbol/time frame pair.
const market = {
  symbol: SYMBOLS.BTC_USD,
  tf: TIME_FRAMES.ONE_HOUR
}

const candleKey = HFS.candleMarketDataKey(market)
const strat = EMAStrategy(market)
const candles = rawCandleData
  .sort((a, b) => a[0] - b[0])
  .map(c => ({
    ...(new Candle(c).toJS()),
    ...market // attach market data
  }))

await execOffline(strat, {
  trades: {},
  candles: {
    [candleKey]: candles
  }
})
```
<a name="execOffline"></a>

## execOffline(strategy, args, [progressCallback]) ⇒ <code>object</code>
Run an offline backtest with user-supplied data

**Kind**: global function  
**Returns**: <code>object</code> - btState  

| Param | Type | Description |
| --- | --- | --- |
| strategy | <code>bfx-hf-strategy.StrategyState</code> | strategy |
| args | <code>object</code> | arguments |
| args.candles | <code>object</code> | key'ed by market, assumed sorted! |
| [args.trades] | <code>object</code> | key'ed by market, assumed sorted! |
| [progressCallback] | <code>function</code> | called with i/total updates |

<a name="execOnline"></a>

## execOnline(strategies, args) ⇒ <code>Promise</code>
Executes a backtest for the specified period/symbol/tf, logs results to the
console.

**Kind**: global function  
**Returns**: <code>Promise</code> - p  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| strategies | <code>Array.&lt;bfx-hf-strategy.StrategyState&gt;</code> |  | strategies |
| args | <code>object</code> |  | arguments |
| [args.host] | <code>string</code> | <code>&quot;&#x27;ws://localhost:8899&#x27;&quot;</code> | HF data server endpoint |
| args.from | <code>number</code> \| <code>Date</code> |  | backtest period start timestamp |
| args.to | <code>number</code> \| <code>Date</code> |  | backtest period end timestamp |
| args.symbol | <code>string</code> |  | symbol |
| args.tf | <code>string</code> |  | time frame |
| [args.candles] | <code>boolean</code> | <code>true</code> | whether to include candle data |
| [args.trades] | <code>boolean</code> | <code>true</code> | whether to include trade data |
| [args.sync] | <code>boolean</code> | <code>true</code> | whether to download missing data |
| [args.seedPeriod] | <code>number</code> |  | number of seed candles, defaults to   minimum value required for all strategy indicators |

<a name="initState"></a>

## initState(args) ⇒ <code>object</code>
Create a new backtest state object

**Kind**: global function  
**Returns**: <code>object</code> - initialBtState  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | arguments |
| [args.host] | <code>string</code> | should match ws connection |
| args.ws | <code>ws.WebSocket</code> | ws client, connected to target host |
| args.from | <code>number</code> | bt start timestamp |
| args.to | <code>number</code> | bt end timestamp |
| args.strategy | <code>object</code> | strategyState |

<a name="debugResults"></a>

## debugResults(btState, [summarize])
**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| btState | <code>object</code> |  | backtest state |
| [summarize] | <code>boolean</code> | <code>false</code> | whether to summarize results (recommended   when rendering for multiple runs at once) |

