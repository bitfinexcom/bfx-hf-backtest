'use strict'

const Table = require('cli-table')

// TODO: doc
const genArgTestResultsTable = (testArgKey) => {
  return new Table({
    head: [
      testArgKey, 'PF', 'Profit', 'Max', 'Min', 'Fees', 'Positions', 'Gains',
      'Losses', 'Vol'
    ],

    colAligns: [
      'right', 'right', 'right', 'right', 'right', 'right', 'middle', 'middle',
      'middle', 'right'
    ],

    chars: {
      mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''
    }
  })
}

module.exports = genArgTestResultsTable
