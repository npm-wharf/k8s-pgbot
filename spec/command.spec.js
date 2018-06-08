require('./setup')
const stream = require('stream')
const spawn = require('child_process').spawn
const Command = require('../src/command')

class EchoStream extends stream.Writable {
  constructor () {
    super()
    this.content = []
  }

  _write (chunk, enc, next) {
    chunk
      .toString()
      .split('\n')
      .map(line => { if (line) this.content.push(line) })
    next()
  }
}

describe('Command', function () {
  describe('when running with arguments', function () {
    let configuration
    let output
    let exited = false
    let exitCode = null
    const TIMEOUT = process.env.TRAVIS ? 8000 : 2000
    before(function () {
      this.timeout(TIMEOUT)
      output = new EchoStream()
      configuration = {
        cwd: './example',
        stdout: output,
        command: 'node index.js',
        settings: [
          { argument: 'exit', value: 0 }
        ]
      }
      const command = Command(configuration, spawn)
      return command.run(configuration)
        .then(code => {
          exitCode = code
          exited = true
        })
    })

    it('should exit with expected code', function () {
      exited.should.eql(true)
      exitCode.should.eql({ exit: 0 })
    })

    it('should log expected results to stdio', function () {
      output.content.should.eql([
        'called with exit code 0'
      ])
    })
  })

  describe('when running with environment variables', function () {
    let configuration
    let output
    let exited = false
    let exitCode = null
    const TIMEOUT = process.env.TRAVIS ? 8000 : 2000
    before(function () {
      this.timeout(TIMEOUT)
      output = new EchoStream()
      configuration = {
        cwd: './example',
        stdout: output,
        command: 'node index.js',
        settings: [
          { env: 'EXIT_CODE', value: 5 }
        ]
      }
      const command = Command(configuration, spawn)
      return command.run(configuration)
        .then(code => {
          exitCode = code
          exited = true
        })
    })

    it('should exit with expected code', function () {
      exited.should.eql(true)
      exitCode.should.eql({ exit: 5 })
    })

    it('should log expected results to stdio', function () {
      output.content.should.eql([
        'called with exit code 5'
      ])
    })
  })
})
