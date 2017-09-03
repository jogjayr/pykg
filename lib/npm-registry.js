const querystring = require('querystring');
const requestPromise = require('request-promise');
const request = require('request');
const tar = require('tar-stream');
const gunzip = require('gunzip-maybe');
const fs = require('fs');
const zlib = require('zlib');
const gzip = zlib.createGzip();

const { depsFromReqs } = require('./pypi');
const NPM_REGISTRY_PREFIX = 'https://registry.npmjs.org';

function isPresent(packageName) {
  const packageWithoutAt = `pypi/${packageName}`
  const escapedPackageName = `@${querystring.escape(packageWithoutAt)}`;
  return requestPromise(`${NPM_REGISTRY_PREFIX}/${escapedPackageName}`).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
}

function findOnNpm(packageName) {
  return isPresent(packageName);
};


function getLatestSdistUrl(version, releases) {
  const sdistRelease = releases[version].filter(release => release.packagetype === 'sdist')[0];
  return sdistRelease.url;
}


const writePackageJson = (depList, version) => {
  console.log(`writing package.json with dependencies ${depList.join(', ')} and version ${version}`);
}

const createPackageJsonWithDeps = (depList, checkoutLocation) => {
  // get package version

  // const packageVersion = getVersionFromSetupPy(checkoutLocation);

  writePackageJson(depList, packageVersion);

}

const downloadSource = pypiReleaseInfo => {
  const sdistUrl = getLatestSdistUrl(pypiReleaseInfo.info.version, pypiReleaseInfo.releases);
  const fsStream = fs.createWriteStream('/tmp/bs4.tar.gz');
  var extract = tar.extract();
  var pack = tar.pack();

  extract.on('entry', function(header, stream, callback) {
    if (header.name === 'requirements.txt') {
      // check if requirements.txt present, create dependency list
      const deps = depsFromReqs(downloadLocation);
    }
    stream.pipe(pack.entry(header, callback))
  });

  extract.on('finish', function() {
    // all entries done - lets finalize it
    const info = pypiReleaseInfo.info;
    const packageJson = {
      name: pypiReleaseInfo.info.name,
      version: pypiReleaseInfo.info.version,
      author: `${info.author}<${info.author_email}>`,
      description: info.description,
      bugs: info.bugtrack_url,
      license: info.license
    };
    pack.entry({name: 'package.json'}, JSON.stringify(packageJson), function() {
      pack.finalize()
    });
  });

  request(sdistUrl).pipe(gunzip()).pipe(extract);

  pack.pipe(gzip).pipe(fsStream);
}


const publishToNpm = pypiReleaseInfo => {
  // download the source code
  const downloadLocation = downloadSource(pypiReleaseInfo);
  

  // // create package.json with dependency list
  // createPackageJsonWithDeps(deps, downloadLocation);
  // console.log(`publishing package at location ${checkoutLocation}`);
}

module.exports = {
  findOnNpm: findOnNpm,
  createPackageJsonWithDeps: createPackageJsonWithDeps,
  publishToNpm: publishToNpm,
};
