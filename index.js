#!/usr/bin/env node

const program = require('commander');
const getPythonPath = require('./unpack');
const shell = require('shelljs');
const yarnWhichInfo = shell.which('yarn');
const npmWhichInfo = shell.which('npm');
const { findOnNpm, publishToNpm, createPackageJsonWithDeps } = require('./lib/npm-registry');
const { findOnPypi, downloadSource, depsFromReqs } = require('./lib/pypi');

let pkgManager = 'npm';




async function addInstallHandler(otherDeps) {
  for (dep of otherDeps) {

    try {
      // check if dependency is available on NPM registry
      const isAvailableOnNpm = await(findOnNpm(dep));
      if (!isAvailableOnNpm) {
        console.log('not found on npm, searching on pypi');
        // if not available, search on PyPi
        if (findOnPypi()) {
          console.log('found on pypi!!')
          // download the source code
          const downloadLocation = downloadSource(dep);

          // check if requirements.txt present, create dependency list
          const deps = depsFromReqs(downloadLocation);

          // create package.json with dependency list
          createPackageJsonWithDeps(deps, downloadLocation);
          
          // publish to npm registry
          publishToNpm(downloadLocation);
        } else {
          console.log('package not found on pypi');
          process.exit(1);
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
