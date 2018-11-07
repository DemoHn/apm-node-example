const net = require('net')

class Server {
  constructor(sockFile, master) {
    this.sockFile = sockFile
    this.master = master

    this.server = null
  }

  listen () {
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
            socket.end()
            break
        }
      })
    })

    this.server.listen(this.sockFile)
  }

  handleStart (socket, reqObj) {
    const { command, id } = reqObj
    let _id = id
    if (id) {
      this.master.start(id)
    } else {
      const inst = this.master.create(command, reqObj)
      _id = inst.id
    }

    socket.end(JSON.stringify({ id: _id }))
  }

  handleStop (socket, reqObj) {
    const { id } = reqObj
    this.master.stop(id, () => {
      socket.end(JSON.stringify({ id }))
    })
  }

  handleList (socket, reqObj) {
    const { id } = reqObj
    const data = []
    const master = this.master
    if (id) {
      data.push(master.getInfo(id))
    } else {
      const { instances } = master
      Object.keys(instances).forEach((id) => {
        data.push(master.getInfo(id))
      })
    }
    console.log(data)
    socket.end(JSON.stringify(data))
  }
}

module.exports = Server