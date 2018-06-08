function handle (archive) {
  return archive.restore()
}

module.exports = function (archive) {
  return {
    command: 'restore',
    desc: 'pull archive from configured object store and restore to the configured database',
    handler: handle.bind(null, archive)
  }
}
