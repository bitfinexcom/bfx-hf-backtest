'use strict'

/**
 * Sends the provided message as JSON
 *
 * @param {Object} btState
 * @param {*[]} msg
 */
module.exports = (btState = {}, msg = []) => {
  const { ws } = btState

  if (!ws) {
    throw new Error('no ws client available')
  }

  ws.send(JSON.stringify(msg))
}
