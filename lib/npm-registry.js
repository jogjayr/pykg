const isPresent = packageName => {
  return Math.random() > 0.5;
}

const findOnNpm = packageName => {
  if (isPresent(packageName)) {
    return true;
  } else {
    return false
  }
};

const getVersionFromSetupPy = checkoutLocation => {
  console.log(`returning version from setup.py located in ${checkoutLocation}`);

  // locate setup.py
  // locate setup method call
  // create dummy python file with mocked out setup and build_py methods
  // run dummy python file and return version


  return '1.0.0'
}

const writePackageJson = (depList, version) => {
  console.log(`writing package.json with dependencies ${depList.join(', ')} and version ${version}`);
}

const createPackageJsonWithDeps = (depList, checkoutLocation) => {
  // get package version

  const packageVersion = getVersionFromSetupPy(checkoutLocation);

  writePackageJson(depList, packageVersion);

}

const publishToNpm = checkoutLocation => {
  console.log(`publishing package at location ${checkoutLocation}`);
}

module.exports = {
  findOnNpm: findOnNpm,
  createPackageJsonWithDeps: createPackageJsonWithDeps,
  publishToNpm: publishToNpm,
};
