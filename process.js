const cp = require('child_process')

class Process {
  constructor(command, cwd = null) {
    // executor object
    this.executor = null
    this.spawnParams = [command, cwd]
    // event handlers     
    this.onStdoutData = (data) => { }
    this.onStderrData = (data) => { }
    this.onExit = () => { }
  }

  spawn () {
    // TODO: for commands like "ls -l 'Documents and Settings'" it will be failed!
    const [command, cwd] = this.spawnParams

    const args = command.split(' ')
    const cmd = args.shift()
    const options = {
      cwd: cwd,
    }
    this.executor = cp.spawn(cmd, args, options)
    this._bindEvents()
  }

  kill (signal = 'SIGINT') {
    this.executor.kill(signal)
  }

  getPID () {
    if (this.executor) {
      return this.executor.pid
    }
    return null
  }

  _bindEvents () {
    const executor = this.executor
    // bind events with corresponded handlers
    executor.stdout.on('data', this.onStdoutData)
    executor.stderr.on('data', this.onStderrData)
    executor.on('exit', this.onExit)
  }
}

module.exports = Process