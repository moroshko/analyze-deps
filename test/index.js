const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const mock = require('mock-require');

chai.use(chaiAsPromised);
mock('package-json', './package-json-mock');

const analyzeAllDeps = require('../src/index'); // Must be required after the mock is set up

describe('analyzeAllDeps', () => {
  it('should do nothing if package.json is empty', () =>
    expect(analyzeAllDeps({})).to.eventually.deep.equal({})
  );

  it('should analyze dependencies', () =>
    expect(analyzeAllDeps({
      name: 'analyze-deps',
      license: 'MIT',
      dependencies: {
        semver: '^5.2.0'
      }
    })).to.eventually.deep.equal({
      dependencies: {
        semver: {
          status: 'not-latest',
          current: '^5.2.0',
          latest: '5.3.0',
          latestRange: '^5.3.0',
          diff: 'minor'
        }
      }
    })
  );

  it('should analyze devDependencies', () =>
    expect(analyzeAllDeps({
      devDependencies: {
        chai: '~2.3.0',
        nyc: '8.3.0-candidate'
      }
    })).to.eventually.deep.equal({
      devDependencies: {
        chai: {
          status: 'not-latest',
          current: '~2.3.0',
          latest: '3.5.0',
          latestRange: '~3.5.0',
          diff: 'major'
        },
        nyc: {
          status: 'not-latest',
          current: '8.3.0-candidate',
          latest: '8.3.1',
          latestRange: '8.3.1',
          diff: 'prepatch'
        }
      }
    })
  );

  it('should not analyze dependencies if options.dependencies === false', () =>
    expect(analyzeAllDeps({
      dependencies: {
        semver: '^5.2.0'
      }
    }, {
      dependencies: false
    })).to.eventually.deep.equal({})
  );

  it('should not analyze devDependencies if options.devDependencies === false', () =>
    expect(analyzeAllDeps({
      devDependencies: {
        chai: '~2.3.0'
      }
    }, {
      devDependencies: false
    })).to.eventually.deep.equal({})
  );

  it('should set status to "latest" if the range contains only the latest version', () =>
    expect(analyzeAllDeps({
      dependencies: {
        semver: '^5.3.0'
      }
    })).to.eventually.deep.equal({
      dependencies: {
        semver: {
          status: 'latest'
        }
      }
    })
  );

  it('should return an error if there are no versions in range', () =>
    expect(analyzeAllDeps({
      dependencies: {
        semver: '^99.99.99'
      }
    })).to.eventually.deep.equal({
      dependencies: {
        semver: {
          status: 'error',
          error: 'Package `semver` doesn\'t have versions in range ^99.99.99. Latest version is 5.3.0.'
        }
      }
    })
  );

  it('should return an error if range contains a space', () =>
    expect(analyzeAllDeps({
      dependencies: {
        semver: '^2.3.0 || ^4.0.0'
      }
    })).to.eventually.deep.equal({
      dependencies: {
        semver: {
          status: 'error',
          error: 'I don\'t know how to update `semver` range ^2.3.0 || ^4.0.0 to include only the latest version 5.3.0.'
        }
      }
    })
  );

  it('should return an error if range contains a pipe', () =>
    expect(analyzeAllDeps({
      dependencies: {
        semver: '^2.3.0||^4.0.0'
      }
    })).to.eventually.deep.equal({
      dependencies: {
        semver: {
          status: 'error',
          error: 'I don\'t know how to update `semver` range ^2.3.0||^4.0.0 to include only the latest version 5.3.0.'
        }
      }
    })
  );

  it('should return an error if range contains an \'x\'', () =>
    expect(analyzeAllDeps({
      dependencies: {
        semver: '2.3.x'
      }
    })).to.eventually.deep.equal({
      dependencies: {
        semver: {
          status: 'error',
          error: 'I don\'t know how to update `semver` range 2.3.x to include only the latest version 5.3.0.'
        }
      }
    })
  );

  it('should return an error calculating latestRange fails', () =>
    expect(analyzeAllDeps({
      dependencies: {
        semver: '<=5.2.0'
      }
    })).to.eventually.deep.equal({
      dependencies: {
        semver: {
          status: 'error',
          error: 'I don\'t know how to update `semver` range <=5.2.0 to include only the latest version 5.3.0.'
        }
      }
    })
  );

  it('should return an error if package doesn\'t exist', () =>
    expect(analyzeAllDeps({
      dependencies: {
        semverrrrrrrr: '^5.3.0'
      }
    })).to.eventually.deep.equal({
      dependencies: {
        semverrrrrrrr: {
          status: 'error',
          error: 'Package `semverrrrrrrr` doesn\'t exist'
        }
      }
    })
  );
});
