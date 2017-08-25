#!/usr/bin/env node

const program = require('commander');
const getPythonPath = require('./unpack');
const shell = require('shelljs');
const yarnWhichInfo = shell.which('yarn');
const npmWhichInfo = shell.which('npm');
const { findOnNpm, publishToNpm } = require('./lib/npm-registry');
const { findOnPypi } = require('./lib/pypi');

let pkgManager = 'npm';

// Remove until package-finding logic is completely built
// if (yarnWhichInfo) {
//   pkgManager = 'yarn';
// } else if (npmWhichInfo) {
//   pkgManager = 'npm';
// } else {
//   console.error('You need either npm or yarn installed globally');
//   process.exit(1);
// }

const availableOnNpm = {};
const availableOnPypi = {};

async function addInstallHandler(otherDeps) {
  for (dep of otherDeps) {
    try {
      // check if dependency is available on NPM registry
      if (availableOnNpm[dep] === undefined) {
        const isAvailableOnNpm = await(findOnNpm(dep));
        if (!isAvailableOnNpm) {
          // if not available, search on PyPi
          if (availableOnPypi[dep] === undefined) {
            const pypiReleaseInfo = await findOnPypi(dep);
            availableOnPypi[dep] = true;
          }
  
          // publish to npm registry
          const publishSuccess = await publishToNpm(pypiReleaseInfo);

          if (publishSuccess) {
            availableOnNpm[dep] = true;
          }
        } else {
          availableOnNpm[dep] = true;
        }
      }
    } catch(e) {
      console.error(e);
      process.exit(1);
    }
  }

  process.exit(0);

  let depList = '';
  if (!otherDeps) {
    otherDeps = [];
  }
  for (dep of otherDeps) {
    depList += ` @pypi/${dep}`;
  }
  let commandToRun;
  if (depList) {
    if (pkgManager === 'npm') {
      commandToRun = `npm install --save ${depList}`;
    } else {
      commandToRun = `yarn add ${depList}`;
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
