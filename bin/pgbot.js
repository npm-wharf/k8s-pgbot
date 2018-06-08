#!/usr/bin/env node

const archive = require('../src/index')
const chalk = require('chalk')
const bole = require('bole')

const levelColors = {
  debug: 'gray',
  info: 'white',
  warn: 'yellow',
  error: 'red'
}

const debugOut = {
  write: function (data) {
    const entry = JSON.parse(data)
    const levelColor = levelColors[entry.level]
    console.log(`${chalk[levelColor](entry.time)} - ${chalk[levelColor](entry.level)} ${entry.message}`)
  }
}

bole.output({
  level: 'info',
  stream: debugOut
})

require('yargs') // eslint-disable-line no-unused-expressions
  .usage('$0 <command>')
  .command(require('../src/command/backup')(archive))
  .command(require('../src/command/restore')(archive))
  .help()
  .version()
  .argv
