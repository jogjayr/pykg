const querystring = require('querystring');
const requestPromise = require('request-promise');
const request = require('request');
const tar = require('tar-stream');
const tarfs = require('tar-fs');
const gunzip = require('gunzip-maybe');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const shell = require('shelljs');
const gzip = zlib.createGzip();

const { depsFromReqs, depsFromSetupPy } = require('./pypi');
const NPM_REGISTRY_PREFIX = 'https://registry.npmjs.org';
const NPM_PYKG_ORG = 'pypi';
const isPresent = (packageName) => {
  const packageWithoutAt = `${NPM_PYKG_ORG}/${packageName}`
  const escapedPackageName = `@${querystring.escape(packageWithoutAt)}`;
  return requestPromise(`${NPM_REGISTRY_PREFIX}/${escapedPackageName}`).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
}

const findOnNpm = (packageName) => {
  return isPresent(packageName);
};



const getLatestSdistUrl = (version, releases) => {
  const sdistRelease = releases[version].filter(release => release.packagetype === 'sdist')[0];
  return sdistRelease.url;
}

const getInstalledPackageManager = () => {
  return 'npm';
  // if (yarnWhichInfo) {
  //   pkgManager = 'yarn';
  // } else if (npmWhichInfo) {
  //   pkgManager = 'npm';
  // } else {
  //   console.error('You need either npm or yarn installed globally');
  //   process.exit(1);
  // }
}


const downloadSource = pypiReleaseInfo => {
  const info = pypiReleaseInfo.info;
  const sdistUrl = getLatestSdistUrl(info.version, pypiReleaseInfo.releases);
  const tmpLibDir = path.join(os.tmpdir(), info.name);

  if(!fs.existsSync(tmpLibDir)) {
    fs.mkdirSync(tmpLibDir);
  }
  const extract = tar.extract();
  const pack = tar.pack();
  const extractDir = `${info.name}-${info.version}`;
  const publishDir = path.join(tmpLibDir, extractDir);
  extract.on('entry', function(header, stream, callback) {
    if (header.name === path.join(extractDir,'setup.py')) {
      // check if requirements.txt present, create dependency list
      // const deps = depsFromReqs(downloadLocation);
      depsFromSetupPy(stream, publishDir, (deps) => {

      });
    } else {
      stream.pipe(pack.entry(header, callback))
    }
  });

  extract.on('finish', function() {
    // all entries done - lets finalize it
    pack.finalize();
    const packageJsonPath = path.join(publishDir, 'package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf-8');
  });

  request(sdistUrl).pipe(gunzip()).pipe(extract);
  const packageJson = {
    name: `@${NPM_PYKG_ORG}/${info.name}`,
    version: pypiReleaseInfo.info.version,
    author: `${info.author}<${info.author_email}>`,
    description: info.description,
    bugs: info.bugtrack_url,
    license: info.license
  };
  const tmpDirStream = tarfs.extract(tmpLibDir);
  pack.pipe(tmpDirStream);
  
  return publishDir;
}


const publishToNpm = (pypiReleaseInfo, program) => {
  // download the source code
  const downloadLocation = downloadSource(pypiReleaseInfo);
  const shellCommand = `${getInstalledPackageManager()} publish --access public ${downloadLocation}`;
  console.log('Run ', shellCommand, ' to publish this package to NPM before continuing');
}

module.exports = {
  findOnNpm: findOnNpm,
  publishToNpm: publishToNpm,
  getInstalledPackageManager: getInstalledPackageManager,
};
