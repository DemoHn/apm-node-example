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

  spawn() {
    const [command, cwd] = this.spawnParams

    const args = command.split(' ')
    const cmd = args.shift()
    const options = {
      cwd: cwd,
    }
    const executor = this.executor = cp.spawn(cmd, args, options)
    executor.stdout.on('data', this.onStdoutData)
    executor.stderr.on('data', this.onStderrData)
    executor.on('exit', this.onExit)
  }

  kill(signal = 'SIGINT') {
    this.executor.kill(signal)
  }

  getPID() {
    if (this.executor) {
      return this.executor.pid
    }
    return null
  }
}

module.exports = Process