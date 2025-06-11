// jest.config.js
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['js', 'json'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    moduleNameMapper: {
      '^file-type$': '<rootDir>/__mocks__/file-type.js'
    }
  }
  