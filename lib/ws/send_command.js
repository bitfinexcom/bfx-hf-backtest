'use strict'

const send = require('./send')

/**
 * Sends the provided command & arguments
 *
 * @param {Object} btState
 * @param {string} command
 * @param {*[]} args
 */
module.exports = (btState = {}, cmd = '', args = []) => {
  send(btState, [cmd, args])
}
