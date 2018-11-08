const net = require('net')
const fs = require('fs')
const EventEmitter = require('events')
const Instance = require('./instance')

class Master {
  constructor(sockFile) {
    this.sockFile = sockFile
    this.instances = {}
    this.eventHandler = new EventEmitter()

    this._counter = 0
    this._bindEvents()
  }

  listen() {
    const eventMap = {
      start: this._handleStart.bind(this),
      stop: this._handleStop.bind(this),
      list: this._handleList.bind(this),
    }
    const server = net.createServer((socket) => {
      socket.on('data', (data) => {
        const reqObj = JSON.parse(data.toString())
        const handler = eventMap[reqObj.event]
        if (handler)
          handler(reqObj, data => socket.end(JSON.stringify(data)))
      })
    })
    server.listen(this.sockFile)
  }

  _handleStart(reqObj, callback) {
    const { command, id } = reqObj
    if (id && this.instances[id]) {
      this.instances[id].start()
      callback({ id })
    }

    // create & start instance
    this._counter += 1
    const instance = new Instance(this._counter, command, reqObj)
    instance.setEmitter(this.eventHandler)
    instance.start()
    // add instance
    this.instances[this._counter] = instance
    callback({ id: instance.id })
  }

  _handleStop(reqObj, callback) {
    const { id } = reqObj
    const instance = this.instances[id]
    if (instance) {
      instance.stop()
      this.eventHandler.once(`exit_${id}`, () => {
        callback({ id })
      })
    }
  }

  _handleList(reqObj, callback) {
    const { id } = reqObj
    const list = []
    Object.keys(this.instances).forEach((id) => {
      const instance = this.instances[id]
      list.push({
        id,
        status: instance.isRunning ? 'RUNNING' : 'STOPPED',
        pid: instance.isRunning ? instance.process.getPID() : null,
      })
    })
    callback(list)
  }

  _bindEvents() {
    const eventHandler = this.eventHandler
    eventHandler.on('exit', (id, code) => {
      eventHandler.emit(`exit_${id}`)
    })

    eventHandler.on('stdout_data', (id, data) => {
      console.log(`stdout: ${data.toString()}`)
    })
  }
}

module.exports = Master