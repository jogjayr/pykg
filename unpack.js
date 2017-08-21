const { join } = require('path');
let packageJson = require(join(process.cwd(), 'package.json'));


module.exports = function getPythonPath() {
  const pathFromDepList = depList => depList.reduce((prev, depName) => {
    const packageMainPath = join(process.cwd(), 'node_modules', depName);
    if (prev) {
      prev += `:${packageMainPath}`;
    } else {
      prev = packageMainPath
    }
    return prev;
  }, '');
  
  let depPath, devDepPath;
  
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
};
