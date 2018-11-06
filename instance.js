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
    this.emitter = null
  }

  start() {
    this.spawnProcess()
  }

  stop(signal = 'SIGINT') {
    this.process.kill(signal)
  }

  restart() {
    this.stop()
    // force start
  }

  spawnProcess() {
    const { env, cwd } = this.options
    this.process = new Process(this.command, env, cwd)
    this.process._bindEventHandlers()
    this.process.spawn()
  }

  // event handlers
  _bindEventHandlers() {
    const proc = this.process
    proc.onExit = (code, signal) => {
      if (this.options.autoRestart) {
        this.start()
      }
    }
  }
}

module.exports = Instance