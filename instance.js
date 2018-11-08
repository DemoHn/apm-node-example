const Process = require('./process')
const fs = require('fs')
class Instance {
  constructor(id, command, options = {}) {
    this.id = id
    this.options = Object.assign({
      command,
      cwd: null,
      stdoutFile: null,
      stderrFile: null,
      autoRestart: true,
    }, options)
    this.process = null
    this.isRunning = false
    // flags
    this._emitter = null
    this._restartFlag = false
    this._forceStopFlag = false
  }

  setEmitter(emitter) {
    this._emitter = emitter
  }

  start() {
    const { cwd, command } = this.options
    const self = this
    const proc = this.process = new Process(command, cwd)
    // bind evenets
    proc.onStdoutData = (data) => self._emitter.emit('stdout_data', self.id, data)
    proc.onStderrData = (data) => self._emitter.emit('stderr_data', self.id, data)
    proc.onExit = this._onExit.bind(this)
    // spawn process
    this.process.spawn()
    this.isRunning = true
  }

  stop(signal) {
    this._forceStopFlag = true
    this.process.kill(signal)
  }

  // event handlers
  _onExit(code, signal) {
    this.isRunning = false
    this._emitter.emit('exit', this.id, code, signal)
    if (!this._forceStopFlag && (this._restartFlag || this.options.autoRestart)) {
      this._restartFlag = false
      this.start()
    }
    this._forceStopFlag = false
  }
}

module.exports = Instance