const net = require('net')
const fs = require('fs')
const EventEmitter = require('events')
const Instance = require('./instance')

class Master {
  constructor() {
    this.counter = 0
    this.eventHandler = new EventEmitter()
    this.instances = {}
    this._bindEvents()
  }

  create(command, options = {}) {
    this.counter += 1
    const counter = this.counter

    const instance = new Instance(counter, command, options)
    // bind event handlers
    instance.setEmitter(this.eventHandler)
    instance.start()

    this.instances[counter] = instance
    return instance
  }

  start(id) {
    const instance = this.instances[id]
    if (instance) {
      instance.start()
    } else {
      console.log(`[apm] start instance: ${id} not found`)
    }
  }

  stop(id, callback) {
    const instance = this.instances[id]
    if (instance) {
      instance.stop()
      this.eventHandler.once(`exit_${id}`, (id, code, signal) => {
        callback()
      })
    } else {
      console.log(`[apm] stop instance: ${id} not found`)
      callback()
    }
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