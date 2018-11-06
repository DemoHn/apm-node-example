const Process = require('./process')

class Instance {
  constructor(id, command, options = {}) {
    this.id = id
    this.command = command
    // instance options
    this.options = {
      env: null,
      cwd: null,
      autoRestart: true,
    }
    // process instance
    this.process = null
    // mark this flag to true means service
    this.restartFlag = false
  }

  start() {
    const { env, cwd } = this.options
    this.process = new Process(this.command, env, cwd)
    this.process._bindEventHandlers()
    this.process.spawn()    
  }

  stop(signal = 'SIGINT') {
    this.process.kill(signal)
  }

  restart(signal = 'SIGINT') {
    const self = this
    this.restartFlag = true
    this.stop(signal)
  }

  // event handlers
  _bindEventHandlers() {
    const self = this
    const proc = this.process
    proc.onExit = (code, signal) => {
      if (self.options.autoRestart || self.restartFlag) {
        // reset `restartFlag` by all means
        self.restartFlag = false
        self.start()
      }
    }

    proc.onError = (error) => {
      // TODO - handle error
      console.log('[err]', error)
      if (self.options.autoRestart || self.restartFlag) {
        self.restartFlag = false
        self.start()
      }
    }
  }
}

module.exports = Instance