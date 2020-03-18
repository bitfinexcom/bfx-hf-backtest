'use strict'

const colors = require('colors')

// TODO: Doc
const plToCLIStr = (pl) => (
  pl >= 0 ? colors.green(pl) : colors.red(pl)
)

module.exports = plToCLIStr
