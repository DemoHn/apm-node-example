const net = require('net')
const fs = require('fs')
const daemonize2 = require("daemonize2")

const sockFile = '/tmp/apm.sock'
const pidFile = '/tmp/apm.pid'

function createDaemon(callback) {
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

function sendRequest(writeData, callback) {
  const client = new net.Socket()
  createDaemon(() => {
    client.connect(sockFile, () => {
      client.write(JSON.stringify(writeData))

      client.on('data', (resp) => {
        callback(JSON.parse(resp.toString()))
        client.destroy()
      })
    })
  })
}

function main() {
  const rargs = process.argv.slice(3)
  const options = {}
  const command = process.argv[2]
  for (i = 0; i < rargs.length; i += 2) {
    options[rargs[i].replace(/\-/g, '')] = rargs[i + 1]
  }

  const handlerMap = {
    start: (args) => {
      const cmd = Object.assign({}, args, {
        event: 'start'
      })
      sendRequest(cmd, ({ id }) => {
        console.log(`[apm] start instance id: ${id}`)
      })
    },
    stop: (args) => {
      const cmd = Object.assign({}, args, {
        event: 'stop'
      })
      sendRequest(cmd, ({ id }) => {
        console.log(`[apm] instance id: ${id} has stopped`)
      })
    },
    list: (args) => {
      const cmd = Object.assign({}, { id: args.id }, {
        event: 'list'
      })
      sendRequest(cmd, (data) => {
        console.log('\nID\tSTATUS\tPID')
        console.log('=============================')
        data.forEach(item => {
          console.log(`${item.id}\t${item.status}\t${item.pid}`)
        })
      })
    }
  }

  if (command && handlerMap[command]) {
    const handler = handlerMap[command]
    handler(options)
  }
}

main()