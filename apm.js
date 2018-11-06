#!/usr/bin/env node
const Master = require('./master')

function main() {
  const master = new Master()

  master.listen('/tmp/apm.sock')
}

main()