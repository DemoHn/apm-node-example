const Master = require('./master')
const Server = require('./server')
const fs = require('fs')

const sockFile = '/tmp/apm.sock'

function main () {
  const master = new Master()
  const server = new Server(sockFile, master)
  server.listen()

  process.on('SIGINT', () => {
    fs.unlinkSync(sockFile)
    process.exit(0)
  })

  process.on('uncaughtException', () => {
    fs.unlinkSync(sockFile)
    process.exit(1)
  })
}

main()