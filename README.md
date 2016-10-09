# Analyze Deps

Compares dependencies in the specified `package.json` to the latest available versions.

## Installation

```shell
npm install analyze-deps --save
```

## Usage

```js
const analyzeDeps = require('analyze-deps');
const packageJson = {
  name: 'analyze-deps',
  license: 'MIT',
  dependencies: {
    'lodash.mapvalues': "^4.6.0",
    'package-json': "^1.2.0",
    'promise-all': "^1.0.0",
    'semver': "^5.2.0"
  },
  devDependencies: {
    'eslint': "^3.7.0"
  }
};

analyzeDeps(packageJson).then(analysis => console.log(analysis));
/*
  {
    dependencies: {
      'lodash.mapvalues': {
        status: 'latest'
      },
      'package-json': {
        status: 'not-latest',
        current: '^1.2.0',
        latest: '2.4.0',
        diff: 'major'
      },
      'promise-all': {
        status: 'latest'
      },
      semver: {
        status: 'not-latest',
        current: '^5.2.0',
        latest: '5.3.0',
        diff: 'minor'
      }
    },
    devDependencies: {
      eslint: {
        status: 'not-latest',
        current: '^3.7.0',
        latest: '3.7.1',
        diff: 'patch'
      }
    }
  }
*/
```

## License

[MIT](http://moroshko.mit-license.org)
