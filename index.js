#!/usr/bin/env node

const program = require('commander');
const getPythonPath = require('./unpack');
const shell = require('shelljs');
const yarnWhichInfo = shell.which('yarn');
const npmWhichInfo = shell.which('npm');
const { findOnNpm, publishToNpm, getInstalledPackageManager } = require('./lib/npm-registry');
const { findOnPypi } = require('./lib/pypi');

// let pkgManager = 'npm';
// Remove until package-finding logic is completely built
let pkgManager = getInstalledPackageManager();

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
            if (pypiReleaseInfo) {
              availableOnPypi[dep] = true;
              // publish to npm registry
              const publishSuccess = await publishToNpm(JSON.parse(pypiReleaseInfo), program);
              if (publishSuccess) {
                availableOnNpm[dep] = true;
              }
            } else {
              console.error(`Package ${dep} not found on pypi`);
              process.exit(1);
            }
          } else {
            continue;
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
  console.log(`Running: ${commandToRun}`)
  if (!program.dryRun) {
    shell.exec(commandToRun);
  }
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
program.option('-d, --dry-run', 'No side effects, just print out the npm/yarn commands you are planning to execute');
program.parse(process.argv);
