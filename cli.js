const yargs = require('yargs')
const net = require('net')
const daemonize2 = require("daemonize2")

const sockFile = '/tmp/apm.sock'
const pidFile = '/tmp/apm.pid'
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

function createDaemon () {
  var daemon = daemonize2.setup({
    main: 'index.js',
    name: 'apm',
    pidfile: pidFile,
  })

  daemon.start()
}

function startHandler (args) {
  createDaemon()
}

function stopHandler (args) {

}

function listHandler (args) {

}