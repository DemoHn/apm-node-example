const Master = require('./master')
const fs = require('fs')

const sockFile = '/tmp/apm.sock'

function main() {
  const master = new Master(sockFile)
  master.listen()

  process.on('SIGINT', () => {
    fs.unlinkSync(sockFile)
    process.exit(0)
  })

  process.on('uncaughtException', (err) => {
    fs.unlinkSync(sockFile)
    console.log(err)
    process.exit(1)
  })
}

main()