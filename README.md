# apm-node-example

## Introduction

This repository is created as the main resource of the sharing titled `Implement a Process Manager in 250 lines` aims to demostrate the essential components of a process manager.

The mini process manager is named as `apm`, the short form of `Anyone's Process Manger`. I expect this workable example to be a learning resource and reference for developing a completed and robust `Process Manager`.

Read the _following content_ for the guidance of getting started and check _the issues_ for the detailed explanation of code.

> (back-story) Initially, the project was planned of about 150 line code before I started to code and realized, however, it's impossible to finish the task in such a limited restrication. Thus I extended the number to 250 afterwhile.

## Getting Started

Prompt the following code to start:

```
$ git clone https://github.com/DemoHn/apm-node-example.git && cd apm-node-example
$ npm install
$ ./bin/apm list  # check if works
```

If everything is OK, the following will output:
```
[apm] start daemon
[apm] create daemon -> PID: 6796

ID	STATUS	PID
=============================
```

That's it!

### Available Commands

1. Create & start an instance with specific command:  
`./bin/apm start --command <cmd> --cwd <cwd>`


2. Start an existing instance:  
`./bin/apm start --id <instID>`


3. Stop an instance:  
`./bin/apm stop --id <instID>`


4. List all instances:  
`./bin/apm list`
