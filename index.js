#!/usr/bin/env node

const program = require('commander');
const getPythonPath = require('./unpack');
const shell = require('shelljs');
const yarnWhichInfo = shell.which('yarn');
const npmWhichInfo = shell.which('npm');

let pkgManager;

if (yarnWhichInfo) {
  pkgManager = 'yarn';
} else if (npmWhichInfo) {
  pkgManager = 'npm';
} else {
  console.error('You need either npm or yarn installed globally');
  process.exit(1);
}

const addInstallHandler = otherDeps => {
  console.log(otherDeps)
  let depList = '';
  if (!otherDeps) {
    otherDeps = [];
  }
  for (dep of otherDeps) {
    depList += ` @pypi/${dep}`;
  }
  let commandToRun;
  if (depList) {
    console.log('deplist', depList)
    if (pkgManager === 'npm') {
      commandToRun = `npm install --save ${depList}`;
    } else {
      commandToRun = `yarn add ${depList}`;
      console.log('yarn', commandToRun)
    }
  } else {
    commandToRun = `${pkgManager} install`;
  }
  shell.exec(commandToRun);
};

program
  .version('1.0.0')
  .command('install [otherDeps...]')
  .action(addInstallHandler);

program.command('add [otherDeps...]')
  .action(addInstallHandler);

program.command('start')
  .action(() => {
    const pythonPath = getPythonPath(process.cwd());
    const commandToRun = `PYTHONPATH=${pythonPath}:$PYTHONPATH; export PYTHONPATH; ${pkgManager} start`;
    shell.exec(commandToRun);
  })

program.parse(process.argv);
