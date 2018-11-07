const net = require('net')

class Server {
  constructor(sockFile, master) {
    this.sockFile = sockFile
    this.master = master

    this.server = null
  }

  listen() {
    const self = this
    this.server = net.createServer((socket) => {
      socket.on('data', (data) => {
        const reqObj = JSON.parse(data.toString())
        switch (reqObj.event) {
          case "start":
            self.handleStart(socket, reqObj); break
          case "stop":
            self.handleStop(socket, reqObj); break
          case "list":
            self.handleList(socket, reqObj); break
          default:
            break
        }
        socket.end()
      })
    })

    this.server.listen(sockFile)
  }

  handleStart(socket, reqObj) {
    const options = Object.assign(reqObj)
    this.master.create(command, reqObj)
    socket.end()
  }

  handleStop(socket, reqObj) {
    const { id } = reqObj
    this.master.stop(id, () => {
      socket.end()
    })
  }

  handleList(socket, reqObj) {
    // TODO
  }
}

module.exports = Server