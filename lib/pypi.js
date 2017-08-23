

const isPresent = packageName => {
  return Math.random() > 0.5;
}

const findOnPypi = packageName => {
  if (isPresent(packageName)) {
    return true;
  } else {
    return false
  }
};

const downloadSource = packageName => {
  console.log(`downloading source for ${packageName}`)
  return 'foo';
}

const depsFromReqs = checkoutLocation => {
  console.log(`returning deps from requirements.txt in directory ${checkoutLocation}`)
  return ['a', 'b'];
}

module.exports = {
  findOnPypi: findOnPypi,
  downloadSource: downloadSource,
  depsFromReqs: depsFromReqs,
}