const path = require('path')

function create (config, spawn, Archive, Command) {
  let pg = config.postgres
  const opts = {
    command: 'pg_dump',
    settings: [
      { argument: 'host', value: pg.host },
      { argument: 'port', value: pg.port },
      { argument: 'username', value: pg.user },
      { argument: 'password', value: pg.password },
      { argument: 'format', value: 'tar' },
      { argument: 'file', value: config.archivePath },
      { argument: 'serializable-deferrable', flag: true },
      { argument: 'database', value: pg.database, valueOnly: true }
    ]
  }
  const command = Command(opts, spawn)
  return command.run()
    .then(
      () => {
        const archive = Archive(config)
        return archive.backupFrom()
          .then(
            null,
            err => {
              throw new Error(`Compression and upload failed with ${err.stack}`)
            }
          )
      },
      err => {
        throw new Error(`Backup failed with ${err.stack}`)
      }
    )
}

function restore (config, spawn, Archive, Command) {
  let pg = config.postgres
  const archive = Archive(config)
  return archive.restoreTo()
    .then(
      info => {
        const file = path.join(info.path, info.files[0])
        const opts = {
          command: 'pg_restore',
          settings: [
            { argument: 'host', value: pg.host },
            { argument: 'port', value: pg.port },
            { argument: 'username', value: pg.user },
            { argument: 'password', value: pg.password },
            { argument: 'format', value: 'tar' },
            { argument: 'dbname', value: pg.database },
            { argument: 'filename', value: file, valueOnly: true }
          ]
        }
        const command = Command(opts, spawn)
        return command.run()
          .then(
            null,
            err => {
              throw new Error(`Restoration of archive to postgres failed with ${err.stack}`)
            }
          )
      },
      err => {
        throw new Error(`Download or decompression failed with ${err.stack}`)
      }
    )
}

module.exports = function (config, spawn, Archive, Command) {
  return {
    create: create.bind(null, config, spawn, Archive, Command),
    restore: restore.bind(null, config, spawn, Archive, Command)
  }
}
