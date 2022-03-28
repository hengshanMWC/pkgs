module.exports = {
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/test',
  ],
  testRegex: 'test/(.+)\\.test\\.(js?|ts?)$',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
}
