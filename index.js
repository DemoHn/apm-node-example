const Master = require('./master')
const Server = require('./server')

const sockFile = '/tmp/apm.sock'

function main() {
  const master = new Master()
  const server = new Server(sockFile, master)
  server.listen()
  console.log('[apm] start daemon')
}

main()