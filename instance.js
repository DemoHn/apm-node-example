const Process = require('./process')
const fs = require('fs')
class Instance {
  constructor(id, command, options = {}) {
    this.id = id
    this.command = command
    // instance options
    this.options = Object.assign({
      cwd: null,
      stdoutFile: null,
      stderrFile: null,
      autoRestart: true,
    }, options)
    // process instance
    this.process = null
    // mark this flag to true means service
    this.restartFlag = false
    this.forceStopFlag = false
    // event handler
    this._emitter = null
    // file streams
    this._stdoutStream = null
    this._stderrStream = null
    // init
    this._init()
  }

  _init() {
    const { stdoutFile, stderrFile } = this.options
    // open files
    if (stdoutFile) {
      this._stdoutStream = fs.createWriteStream(stdoutFile)
    }
    if (stderrFile) {
      this._stderrStream = fs.createWriteStream(stderrFile)
    }
  }

  setEmitter(emitter) {
    this._emitter = emitter
  }

  start() {
    const { cwd } = this.options
    this.process = new Process(this.command, cwd)
    // bind evenets    
    this.process.onExit = this._onExit.bind(this)
    this.process.onStdoutData = this._onStdoutData.bind(this)
    this.process.onStderrData = this._onStderrData.bind(this)
    // spawn process
    this.process.spawn()
  }

  stop(signal = 'SIGINT') {
    this.forceStopFlag = true
    this.process.kill(signal)
  }

  restart(signal = 'SIGINT') {
    this.restartFlag = true
    this.stop(signal)
  }
  // close file streams, clear handles, etc.
  close() {
    if (this._stdoutStream)
      this._stdoutStream.close()
    if (this._stderrStream)
      this._stderrStream.close()
  }

  // event handlers
  _onExit(code, signal) {
    this._emitter.emit('exit', this.id, code, signal)
    if (!this.forceStopFlag && (this.restartFlag || this.options.autoRestart)) {
      this.restartFlag = false
      this.start()
    }
    this.forceStopFlag = false
  }

  _onStdoutData(data) {
    this._emitter.emit('stdout_data', this.id, data)
    if (this._stdoutStream) {
      this._stdoutStream.write(data)
    }
  }

  _onStderrData(data) {
    this._emitter.emit('stdout_error', this.id, data)
    if (this._stderrStream) {
      this._stderrStream.write(data)
    }
  }
}

module.exports = Instance