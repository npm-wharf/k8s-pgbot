const argv = require('yargs') // eslint-disable-line no-unused-expressions
  .usage('$0 <command>')
  .option('exit')
  .argv
const exitCode = process.env.EXIT_CODE ? process.env.EXIT_CODE : argv.exit
console.log(`called with exit code ${exitCode}`)
process.exit(parseInt(exitCode))
