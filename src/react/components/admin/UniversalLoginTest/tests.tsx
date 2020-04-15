// don't change test order. it matters when it comes to deciding if a test can be skipped.
export const tests = [
  {
    expectLoginSuccess: false,
    expectError: true,
    reuseSession: false,
    speedFactor: 6,
    enterCorrectEmail: false,
  },
  {
    expectLoginSuccess: false,
    expectError: true,
    reuseSession: false,
    speedFactor: 4,
    enterCorrectEmail: true,
    enterCorrectPassword: false,
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    reuseSession: false,
    speedFactor: 10,
    enterCorrectEmail: true,
    enterCorrectPassword: true,
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    reuseSession: false,
    speedFactor: 2,
    enterCorrectEmail: true,
    enterCorrectPassword: true,
    skipCondition: { testDependency: 2, skipIfPassedEquals: true },
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    reuseSession: true,
    skipCondition: { testDependency: 3, skipIfPassedEquals: false },
  },
];
