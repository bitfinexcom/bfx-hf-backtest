'use strict'

const HFU = require('bfx-hf-util')
const _ = require('lodash')
const HFS = require('bfx-hf-strategy')
const Indicators = require('bfx-hf-indicators')

function parseStrategy (strategyContent) {
  const strategy = {}
  const sections = Object.keys(strategyContent)

  let sectionContent
  let section

  for (let i = 0; i < sections.length; i += 1) {
    section = sections[i]
    sectionContent = strategyContent[section]

    if (section.substring(0, 6) === 'define') {
      strategy[section] = eval(sectionContent) // eslint-disable-line
    } else if (section.substring(0, 2) === 'on') {
      strategy[section] = eval(sectionContent)({ HFS, HFU, _ }) // eslint-disable-line
    }
  }

  return strategy
}

const strategyContent = {
  defineIndicators: '(I) => {\n' +
    '  const indicators = {\n' +
    "  \temaL: new I.EMA([100, 'high']),\n" +
    "  \temaS: new I.EMA([10, 'low']),\n" +
    '  }\n' +
    '  \n' +
    "  indicators.emaL.color = '#00ff00'\n" +
    "  indicators.emaS.color = '#ff0000'\n" +
    '    \n' +
    '  return indicators\n' +
    '}',
  onEnter: '({ HFS, _, HFU }) => async (state = {}, update = {}) => {\n' +
    '  if (HFS.getNumCandles(state) < 2) { // 2 price points needed\n' +
    '    return state\n' +
    '  }\n' +
    '\n' +
    '  const { price, mts } = update\n' +
    '  const i = HFS.indicators(state)\n' +
    '  const iv = HFS.indicatorValues(state)\n' +
    '  const { emaS } = i\n' +
    '  const l = iv.emaL\n' +
    '  const s = iv.emaS\n' +
    '  const amount = 1\n' +
    '  \n' +
    '  if (emaS.crossed(l)) {\n' +
    '    if (s > l) {\n' +
    '      return HFS.openLongPositionMarket(state, {\n' +
    '        mtsCreate: mts,\n' +
    '        amount,\n' +
    '        price,\n' +
    "        label: 'enter long',\n" +
    '      })\n' +
    '    } else {\n' +
    '      return HFS.openShortPositionMarket(state, {\n' +
    '        mtsCreate: mts,\n' +
    '        amount,\n' +
    '        price,\n' +
    "        label: 'enter short',\n" +
    '      })\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  return state\n' +
    '}',
  onUpdateLong: '({ HFS, HFU }) => async (state = {}, update = {}) => {\n' +
    '  const { price, mts } = update\n' +
    '  const i = HFS.indicators(state)\n' +
    '  const iv = HFS.indicatorValues(state)\n' +
    '  const { emaS } = i\n' +
    '  const l = iv.emaL\n' +
    '  const s = iv.emaS\n' +
    '  \n' +
    '  if (emaS.crossed(l) && s < l) {\n' +
    '    return HFS.closePositionMarket(state, {\n' +
    '      price,\n' +
    '      mtsCreate: mts,\n' +
    "      label: 'close long',\n" +
    '    })\n' +
    '  }\n' +
    '  \n' +
    '  return state\n' +
    '}',
  onUpdateShort: '({ HFS, HFU }) => async (state = {}, update = {}) => {\n' +
    '  const { price, mts } = update\n' +
    '  const i = HFS.indicators(state)\n' +
    '  const iv = HFS.indicatorValues(state)\n' +
    '  const { emaS } = i\n' +
    '  const l = iv.emaL\n' +
    '  const s = iv.emaS\n' +
    '  \n' +
    '  if (emaS.crossed(l) && s > l) {\n' +
    '    return HFS.closePositionMarket(state, {\n' +
    '      price,\n' +
    '      mtsCreate: mts,\n' +
    "      label: 'close short',\n" +
    '    })\n' +
    '  }\n' +
    '  \n' +
    '  return state\n' +
    '}',
  id: null
}

function getStrategy ({ tf, symbol }) {
  let strategy = parseStrategy(strategyContent)
  strategy = HFS.define({
    ...strategy,

    tf,
    symbol,
    indicators: {
      ...strategy.defineIndicators(Indicators)
    }
  })

  return strategy
}

module.exports = getStrategy
