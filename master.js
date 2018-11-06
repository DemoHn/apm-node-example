const net = require('net')
const fs = require('fs')
const Instance = require('./instance')

class Master {
  constructor() {
    this.counter = 0
    this.instances = {}
  }

  create(command, options = {}) {
    this.counter += 1
    const counter = this.counter

    const instance = new Instance(counter, command, options)
    this.instances[counter] = instance
    return instance
  }

  delete(id) {
    delete this.instances[id]
  }

  // listening socket to recv data
  listen(sockFile) {
    const self = this
    const server = net.createServer((socket) => {
      socket.on('data', (data) => {
        // TODO: should handle data after stream is end
        // to ensure the data is complete!
        self.handleRequest(data, () => {
          socket.end()
        })        
      })      
    })

    server.listen(sockFile)
  }
  
  handleRequest(data, callback) {
    const self = this
    const reqObj = JSON.parse(data.toString())
    switch (reqObj.event) {
      case "start": {
        const { command, cwd, env, autoRestart} = reqObj
        const instance = this.create(command, {
          cwd, env, autoRestart
        })
        instance.start()
        callback()
        break
      }      
      case "stop": {
        const { id } = reqObj
        const instance = this.instances[id]
        if (instance) {
          instance.stop('SIGINT', () => {
            self.delete(id)
          })          
          
        }      
      }

      default:
        callback()
        break
    }
  }
}

module.exports = Master