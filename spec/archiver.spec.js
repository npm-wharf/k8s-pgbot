require('./setup')

const Archiver = require('../src/archiver')

const archive = {
  backupFrom: () => {},
  restoreTo: () => {}
}

const command = {
  run: () => {}
}

describe('Archiver', function () {
  describe('archive creation', function () {
    let config, spawn, opts
    before(function () {
      config = {
        basePath: '/var/lib/postgresql/data',
        dataPath: '/pg/db',
        patterns: 'archive.dump',
        archivePath: '/var/lib/postgresql/data/pg/db/archive.dump',
        postgres: {
          host: '0.0.0.0',
          port: 5432,
          database: 'postgres',
          user: 'postgres',
          password: 'postgres'
        }
      }
      opts = {
        command: 'pg_dump',
        settings: [
          { argument: 'host', value: '0.0.0.0' },
          { argument: 'port', value: 5432 },
          { argument: 'username', value: 'postgres' },
          { argument: 'password', value: 'postgres' },
          { argument: 'format', value: 'tar' },
          { argument: 'file', value: config.archivePath },
          { argument: 'serializable-deferrable', flag: true },
          { argument: 'database', value: 'postgres', valueOnly: true }
        ]
      }
      spawn = {}
    })
    describe('when pg_dump fails', function () {
      let archiver
      let commandMock, commandStub, archiveStub
      before(function () {
        commandMock = sinon.mock(command)
        archiveStub = sinon.stub()
        commandStub = sinon.stub()
        commandStub
          .withArgs(opts, spawn)
          .returns(command)

        commandMock
          .expects('run')
          .rejects(new Error('exeunt non zero'))

        archiver = Archiver(config, spawn, archiveStub, commandStub)
      })

      it('should reject with error', function () {
        return archiver.create()
          .should.be.rejectedWith(``)
      })

      it('should call expected dependencies', function () {
        commandMock.verify()
        archiveStub.called.should.equal(false)
      })
    })

    describe('when tar or upload fails', function () {
      let archiver
      let commandMock, commandStub, archiveMock, archiveStub
      before(function () {
        archiveMock = sinon.mock(archive)
        commandMock = sinon.mock(command)
        archiveStub = sinon.stub()
        commandStub = sinon.stub()
        commandStub
          .withArgs(opts, spawn)
          .returns(command)

        commandMock
          .expects('run')
          .resolves()

        archiveStub
          .withArgs(config)
          .returns(archive)

        archiveMock
          .expects('backupFrom')
          .rejects(new Error('no interwebs'))

        archiver = Archiver(config, {}, archiveStub, commandStub)
      })

      it('should reject with error', function () {
        return archiver.create()
          .should.be.rejectedWith(``)
      })

      it('should call expected dependencies', function () {
        commandMock.verify()
        archiveMock.verify()
      })
    })

    describe('on success', function () {
      let archiver
      let commandMock, commandStub, archiveMock, archiveStub
      before(function () {
        archiveMock = sinon.mock(archive)
        commandMock = sinon.mock(command)
        archiveStub = sinon.stub()
        commandStub = sinon.stub()
        commandStub
          .withArgs(opts, spawn)
          .returns(command)

        commandMock
          .expects('run')
          .resolves()

        archiveStub
          .withArgs(config)
          .returns(archive)

        archiveMock
          .expects('backupFrom')
          .resolves({})

        archiver = Archiver(config, {}, archiveStub, commandStub)
      })

      it('should resolve successfully', function () {
        return archiver.create()
          .should.eventually.eql({})
      })

      it('should call expected dependencies', function () {
        commandMock.verify()
        archiveMock.verify()
      })
    })
  })

  describe('archive restoration', function () {
    let config, spawn, opts
    before(function () {
      config = {
        basePath: '/var/lib/postgresql/data',
        dataPath: '/pg/db',
        patterns: 'archive.dump',
        archivePath: '/var/lib/postgresql/data/pg/db/archive.dump',
        postgres: {
          host: '0.0.0.0',
          port: 5432,
          database: 'postgres',
          user: 'postgres',
          password: 'postgres'
        }
      }
      opts = {
        command: 'pg_restore',
        settings: [
          { argument: 'host', value: '0.0.0.0' },
          { argument: 'port', value: 5432 },
          { argument: 'username', value: 'postgres' },
          { argument: 'password', value: 'postgres' },
          { argument: 'format', value: 'tar' },
          { argument: 'dbname', value: 'postgres' },
          { argument: 'filename', value: config.archivePath, valueOnly: true }
        ]
      }
      spawn = {}
    })

    describe('when pg_dump fails', function () {
      let archiver
      let commandMock, commandStub, archiveMock, archiveStub
      before(function () {
        archiveMock = sinon.mock(archive)
        commandMock = sinon.mock(command)
        archiveStub = sinon.stub()
        commandStub = sinon.stub()
        commandStub
          .withArgs(opts, spawn)
          .returns(command)

        commandMock
          .expects('run')
          .rejects(new Error('database broke'))

        archiveStub
          .withArgs(config)
          .returns(archive)

        archiveMock
          .expects('restoreTo')
          .resolves({
            path: '',
            files: [
              config.archivePath
            ]
          })

        archiver = Archiver(config, {}, archiveStub, commandStub)
      })

      it('should reject with error', function () {
        return archiver.restore()
          .should.be.rejectedWith(``)
      })

      it('should call expected dependencies', function () {
        commandMock.verify()
        archiveMock.verify()
      })
    })

    describe('when tar or download fails', function () {
      let archiver
      let commandStub, archiveMock, archiveStub
      before(function () {
        archiveMock = sinon.mock(archive)
        archiveStub = sinon.stub()
        commandStub = sinon.stub()

        archiveStub
          .withArgs(config)
          .returns(archive)

        archiveMock
          .expects('restoreTo')
          .rejects(new Error('no interwebs'))

        archiver = Archiver(config, {}, archiveStub, commandStub)
      })

      it('should reject with error', function () {
        return archiver.restore()
          .should.be.rejectedWith(``)
      })

      it('should call expected dependencies', function () {
        archiveMock.verify()
        commandStub.called.should.equal(false)
      })
    })

    describe('on success', function () {
      let archiver
      let commandMock, commandStub, archiveMock, archiveStub
      before(function () {
        archiveMock = sinon.mock(archive)
        commandMock = sinon.mock(command)
        archiveStub = sinon.stub()
        commandStub = sinon.stub()
        commandStub
          .withArgs(opts, spawn)
          .returns(command)

        commandMock
          .expects('run')
          .resolves({ exit: 0 })

        archiveStub
          .withArgs(config)
          .returns(archive)

        archiveMock
          .expects('restoreTo')
          .resolves({
            path: '',
            files: [
              config.archivePath
            ]
          })

        archiver = Archiver(config, {}, archiveStub, commandStub)
      })

      it('should resolve successfully', function () {
        return archiver.restore()
          .should.eventually.eql({ exit: 0 })
      })

      it('should call expected dependencies', function () {
        commandMock.verify()
        archiveMock.verify()
      })
    })
  })
})
