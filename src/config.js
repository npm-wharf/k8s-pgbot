const path = require('path')

function getConfig () {
  const config = {
    basePath: process.env.BASE_PATH || '/var/lib/postgresql/data',
    dataPath: process.env.DATA_PATH || '/pg/db',
    patterns: 'archive.dump',
    postgres: {
      host: process.env.POSTGRES_HOST || '0.0.0.0',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DATABASE || 'postgres',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres'
    }
  }
  config.archivePath = path.join(config.basePath, config.dataPath, 'archive.dump')
  return config
}

module.exports = getConfig()
