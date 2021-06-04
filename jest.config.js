module.exports = {
    testEnvironment: 'node',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    moduleFileExtensions: ['js', 'json', 'ts'],
    modulePaths: ['<rootDir>'],
    moduleDirectories: ['node_modules', 'src'],
    roots: ['src'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.{ts,tsx,js,jsx}',
      '!src/**/*.d.ts',
      '!src/server/**/*.ts',
      '!src/bootstrap.ts',
      '!src/kafka/*.ts',
      '!src/command.ts',
      '!src/index.ts',
      '!src/store/__template__/*',
    ],
  };