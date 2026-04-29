module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/.stryker-tmp/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/.stryker-tmp/', '<rootDir>/coverage/', '<rootDir>/reports/'],
  collectCoverage: true,
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverageFrom: [
    'app/actions/task-actions.ts',
    'app/api/**/*.ts',
    'app/components/dragUtils.ts',
    'app/components/taskManagement.ts',
    'app/components/listManagement.ts',
    'lib/math-utils.ts',
    'lib/date-utils.ts',
    'lib/utils.ts',
    'lib/highlight-colors.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/.stryker-tmp/**'
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
};
