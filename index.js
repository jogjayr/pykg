#!/usr/bin/env node

const program = require('commander');
const getPythonPath = require('./unpack');
const shell = require('shelljs');

program
  .version('1.0.0')
  .command('install [otherDeps...]')
  .action((otherDeps) => {
    let depList = '';
    if (!otherDeps) {
      otherDeps = [];
    }
    for (dep of otherDeps) {
      depList += ` @pypi/${dep}`;
    }
    const commandToRun = `npm install --save ${depList}`;
    shell.exec(commandToRun);
  });

program.command('start')
  .action(() => {
    const pythonPath = getPythonPath(process.cwd());
    const commandToRun = `PYTHONPATH=${pythonPath}:$PYTHONPATH; export PYTHONPATH;npm start`;
    shell.exec(commandToRun);
  })

program.parse(process.argv);
