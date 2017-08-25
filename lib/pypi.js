const requestPromise = require('request-promise');
const PYPI_PREFIX = `https://pypi.python.org/pypi`
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

module.exports = {
  findOnPypi: findOnPypi,
  downloadSource: downloadSource,
  depsFromReqs: depsFromReqs,
}