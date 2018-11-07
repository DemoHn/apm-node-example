const yargs = require('yargs')
const net = require('net')
const fs = require('fs')
const daemonize2 = require("daemonize2")

const sockFile = '/tmp/apm.sock'
const pidFile = '/tmp/apm.pid'
yargs
  .command('start', 'start (create) an instance', (yargs) => {
    return yargs
      .option('command', {
        alias: 'c',
        description: 'command line to execute'
      })
      .option('cwd', {
        alias: 'w',
        description: 'current working directory'
      })
      .option('autoRestart', {
        type: 'boolean',
        alias: 'r',
        default: true,
        description: 'if auto_restart process',
      })
      .option('stdoutFile', {
        default: null,
        description: 'stdout file'
      })
      .option('stderrFile', {
        default: null,
        description: 'stderr file'
      })
      .option('id', {
        description: 'instance id'
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

function createDaemon (callback) {
  console.log('[apm] start daemon')
  if (!fs.existsSync(sockFile)) {
    const daemon = daemonize2.setup({
      main: 'index.js',
      name: 'apm',
      pidfile: pidFile,
      silent: true,
    })

    daemon.start((err, pid) => {
      console.log(`[apm] create daemon -> PID: ${pid}`)
      callback(pid)
    })
  } else {
    console.log('[apm] daemon has already started')
    callback(null)
  }
}

function connectAndWrite (writeData, callback) {
  const client = new net.Socket()
  client.connect(sockFile, () => {
    client.write(JSON.stringify(writeData))

    client.on('data', (resp) => {
      callback(JSON.parse(resp.toString()))
      client.destroy()
    })
  })
}

function startHandler (args) {
  const cmd = Object.assign({}, args, {
    event: 'start'
  })
  createDaemon(() => {
    connectAndWrite(cmd, ({ id }) => {
      console.log(`[apm] start instance id: ${id}`)
    })
  })
}

function stopHandler (args) {
  const cmd = Object.assign({}, args, {
    event: 'stop'
  })
  createDaemon(() => {
    connectAndWrite(cmd, ({ id }) => {
      console.log(`[apm] instance id: ${id} has stopped`)
    })
  })
}

function listHandler (args) {
  const cmd = Object.assign({}, { id: args.id }, {
    event: 'list'
  })
  createDaemon(() => {
    connectAndWrite(cmd, (data) => {
      console.log('\nID\tSTATUS\tPID')
      console.log('=============================')
      data.forEach(item => {
        console.log(`${item.id}\t${item.status}\t${item.pid}`)
      })
    })
  })
}

// just register an handle to prevent accidentally
// exit the process
process.on('SIGINT', () => { process.exit(0) })