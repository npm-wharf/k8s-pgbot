function handle (archive) {
  return archive.create()
}

module.exports = function (archive) {
  return {
    command: 'archive',
    desc: 'create a new archive of the configured database and upload in configured object store',
    handler: handle.bind(null, archive)
  }
}
