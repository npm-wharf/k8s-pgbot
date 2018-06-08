const config = require('./config')
const spawn = require('child_process').spawn
const Archive = require('@npm-wharf/cloud-archive')
const Command = require('./command')
const archiver = require('./archiver')(config, spawn, Archive, Command)

module.exports = {
  create: archiver.create,
  restore: archiver.restore
}
