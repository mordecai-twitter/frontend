module.exports = {
  setupFilesAfterEnv: ['./test/setup.js', 'jest-canvas-mock'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js'
  },
  moduleFileExtensions: [
    'js',
    'vue',
    'json'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/components/**/*.vue',
    '<rootDir>/pages/**/*.vue',
    '<rootDir>/common/**/*.js'

  ],
  testEnvironment: 'jsdom',
  testResultsProcessor: 'jest-sonar-reporter',
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
}
