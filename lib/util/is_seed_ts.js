'use strict'

const _isFinite = require('lodash/isFinite')

module.exports = (btState = {}, ts) => {
  const { from } = btState

  return _isFinite(ts) && _isFinite(from) && ts < from
}
