const fs = require('fs');
const path = require('path');
const os = require('os');
const stream = require('stream');
const util = require('util');
const shell = require('shelljs');
const Transform = stream.Transform;
const requestPromise = require('request-promise');
const PYPI_PREFIX = `https://pypi.python.org/pypi`;

const isPresent = packageName => {
  return requestPromise(`${PYPI_PREFIX}/${packageName}/json`);
}

const findOnPypi = packageName => {
  return isPresent(packageName);
};


const depsFromReqs = checkoutLocation => {
  console.log(`returning deps from requirements.txt in directory ${checkoutLocation}`)
  return ['a', 'b'];
}


class AddMockSetup extends Transform {
  constructor(options) {
    super();
  }
  _transform (chunk, enc, callback) {
    const startOfSetupMethodCall = chunk.indexOf('setup(');
    if (startOfSetupMethodCall !== -1) {
      const mockSetup = `
      
def setup(**args):
  print args

`
      const chunkWithMockSetup = chunk.slice(0, startOfSetupMethodCall) + mockSetup + chunk.slice(startOfSetupMethodCall);
      this.push(chunkWithMockSetup);
    } else {
      this.push(chunk);
    }
    callback();
  }
}

// TODO: promisify so that we can async-await
const depsFromSetupPy = (setupPyStream, publishDir, callback) => {
  const setupPyWithMockPath = path.join(publishDir, 'setup-mock.py')
  const setupPyMockStream = fs.createWriteStream(setupPyWithMockPath)
  setupPyStream.pipe(new AddMockSetup()).pipe(setupPyMockStream);
  const ret = shell.exec(`python ${setupPyWithMockPath} install`, {cwd: publishDir}, (code, stdout, stderr) => {});
}

module.exports = {
  findOnPypi: findOnPypi,
  depsFromReqs: depsFromReqs,
  depsFromSetupPy: depsFromSetupPy,
}