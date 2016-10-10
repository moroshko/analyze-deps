const semver = require('semver');
const mapValues = require('lodash.mapvalues');
const promiseAll = require('promise-all');
const getPackageData = require('package-json');

const nonDigitStartRegex = /^[^0-9]+/;

const getDiff = (range, version) => {
  if (range.indexOf(' ') !== -1) {
    return '';
  }

  const rangeVersion = range.replace(nonDigitStartRegex, '');

  if (!semver.valid(rangeVersion)) {
    return '';
  }

  return semver.diff(rangeVersion, version); // can't be null as diff shouldn't be calculated
                                             // when rangeVersion === version
};

const analyzePackage = (packageName, range) =>
  getPackageData(packageName).then(result => {
    const latestVersion = result['dist-tags'].latest;
    const versions = Object.keys(result.versions);
    const versionsInRange = versions.filter(version =>
      semver.satisfies(version, range)
    );

    if (versionsInRange.length === 0) {
      return {
        status: 'error',
        error: `Package \`${packageName}\` doesn't have versions in range ${range}. Latest version is ${latestVersion}.`
      };
    }

    if (versionsInRange.length > 1 || versionsInRange[0] !== latestVersion) {
      return {
        status: 'not-latest',
        current: range,
        latest: latestVersion,
        diff: getDiff(range, latestVersion)
      };
    }

    return {
      status: 'latest'
    };
  })
  .catch(err => {
    return {
      status: 'error',
      error: err.message
    };
  });

const analyzeDeps = deps => {
  const tasks = mapValues(deps, (range, packageName) =>
    analyzePackage(packageName, range)
  );

  return promiseAll(tasks);
};

const defaultOptions = {
  dependencies: true,
  devDependencies: true
};

const analyzeAllDeps = (packageJson, options) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  const tasks = ['dependencies', 'devDependencies'].reduce((result, key) => {
    if (packageJson[key] && mergedOptions[key]) {
      result[key] = analyzeDeps(packageJson[key]);
    }

    return result;
  }, {});

  return promiseAll(tasks);
};

module.exports = analyzeAllDeps;
