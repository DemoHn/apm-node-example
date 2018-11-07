const yargs = require('yargs')
const net = require('net')

const sockFile = '/tmp/apm.sock'
yargs
  .command('start', 'start (create) an instance', (yargs) => {
    return yargs
      .option('cmd', {
        alias: 'c',
        description: 'command line to execute'
      })
      .option('cwd', {
        alias: 'w',
        description: 'current working directory'
      })
  }, startHandler)
  .command('stop', 'stop an instance', (yargs) => {
    return yargs
      .option('id', {
        description: 'instance id'
      })
  }, stopHandler)
  .command('list', 'list all instances', () => { }, listHandler)
  .help()
  .argv

function startHandler(args) {

}

function stopHandler(args) {

}

function listHandler(args) {

}