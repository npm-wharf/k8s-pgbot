const bole = require('bole')
const log = bole('k8s-pgbot')
const parse = require('shell-quote').parse
const SIGTERM = 'SIGTERM'
const SIGINT = 'SIGINT'

function addSignalHandler (configuration) {
  if (!configuration.signalsHandled) {
    configuration.signalsHandled = true
    process.on(SIGTERM, onShutdown.bind(null, configuration))
    process.on(SIGINT, onShutdown.bind(null, configuration))
    process.on('exit', onShutdown.bind(null, configuration))
  }
}

function getArguments (configuration) {
  return configuration.settings.reduce((args, definition) => {
    if (definition.argument) {
      if (definition.valueOnly) {
        args.push(definition.value)
      } else if (definition.flag) {
        args.push(`--${definition.argument}`)
      } else {
        args.push(`--${definition.argument}=${definition.value}`)
      }
    }
    return args
  }, [])
}

function mapEnvironment (environment, configuration) {
  configuration.settings.forEach(definition => {
    if (definition.type === 'number') {
      environment[definition.env] = parseInt(definition.value)
    } else if (definition.value === undefined) {
      environment[definition.env] = ''
    } else {
      environment[definition.env] = definition.value
    }
  })
}

function onShutdown (configuration, exitCode) {
  removeShutdownHandler()
  stop(configuration)
}

function removeShutdownHandler () {
  process.removeAllListeners(SIGINT, onShutdown)
  process.removeAllListeners(SIGTERM, onShutdown)
  process.removeAllListeners('exit', onShutdown)
}

function run (configuration, spawn, onExit) {
  addSignalHandler(configuration)
  const parts = parse(configuration.command)
  const argList = getArguments(configuration)
  const environment = process.env
  mapEnvironment(environment, configuration)
  const child = spawn(
    parts[0],
    parts.slice(1).concat(argList),
    {
      cwd: configuration.cwd || process.cwd(),
      env: environment,
      stdio: configuration.stdio || 'pipe'
    }
  )
  return new Promise((resolve, reject) => {
    child.on('error', e => {
      const msg = `Failed to execute command with error: ${e.stack}`
      log.error(msg)
      const err = new Error(msg)
      if (configuration.waiting) {
        configuration.waiting.reject(err)
      }
      reject(err)
    })

    child.on('close', (code) => {
      if (configuration.waiting) {
        configuration.waiting.resolve({exit: code})
      }
      resolve({exit: code})
    })

    if (configuration.stdout) {
      child.stdout.pipe(configuration.stdout)
    }

    configuration.process = child
  })
}

function stop (configuration) {
  if (configuration.process && !configuration.waiting) {
    const deferred = {resolve: null, reject: null, promise: null}
    configuration.waiting = deferred
    deferred.promise = new Promise((resolve) => {
      deferred.resolve = () => {
        delete configuration.waiting
        resolve()
      }
      configuration.process.kill(SIGTERM)
    })
    return deferred.promise
  } else {
    return configuration.waiting.promise
  }
}

module.exports = function (configuration, spawn) {
  return {
    run: run.bind(null, configuration, spawn),
    stop: stop.bind(null, configuration)
  }
}
