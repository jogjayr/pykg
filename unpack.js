const { join } = require('path');

const pathFromDepList = depList => depList.reduce((prev, depName) => {
  const packageMainPath = join(process.cwd(), 'node_modules', depName);
  if (prev) {
    prev = `${prev}:${packageMainPath}`;
  } else {
    prev = packageMainPath;
  }
  prev = `${prev}:${getPythonPath(packageMainPath)}`;
  return prev;
}, '');

const getPythonPath = cwd => {
  let depPath, devDepPath;
  let packageJson = require(join(cwd, 'package.json'));

  if (packageJson.dependencies) {
    depPath = pathFromDepList(Object.keys(packageJson.dependencies));
  }
  if (packageJson.devDependencies) {
    devDepPath = pathFromDepList(Object.keys(packageJson.devDependencies));
  }

  if (depPath && devDepPath) {
    return `${depPath}:${devDepPath}`;
  } else if (depPath) {
    return depPath;
  } else if (devDepPath) {
    return devDepPath;
  }
}

module.exports = getPythonPath;
