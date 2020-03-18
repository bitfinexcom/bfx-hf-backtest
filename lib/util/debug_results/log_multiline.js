'use strict'

// TODO: doc
module.exports = (debug, lines) => (
  lines.forEach(l => debug('%s', l))
)
