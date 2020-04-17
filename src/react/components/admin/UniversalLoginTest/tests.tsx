export interface Test {
  expectLoginSuccess: boolean;
  expectError: boolean;
  deleteCookies: boolean;
  speedFactor?: number;
  enterCorrectEmail?: boolean;
  enterCorrectPassword?: boolean;
  skipCondition?: SkipCondition;
}

// sometimes a test should be skipped. this defines the conditions under which that should happen
export interface SkipCondition {
  testDependency: number; // skip depending on the result of the test with this number
  skipIfPassedEquals: boolean; // skip if the result success ("passed") of the test dependency equals this value
}

// don't change test order. it matters when it comes to deciding if a test can be skipped.
export const tests: Test[] = [
  {
    expectLoginSuccess: false,
    expectError: true,
    deleteCookies: true,
    speedFactor: 6,
    enterCorrectEmail: false,
  },
  {
    expectLoginSuccess: false,
    expectError: true,
    deleteCookies: true,
    speedFactor: 4,
    enterCorrectEmail: true,
    enterCorrectPassword: false,
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    deleteCookies: true,
    speedFactor: 10,
    enterCorrectEmail: true,
    enterCorrectPassword: true,
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    deleteCookies: true,
    speedFactor: 2,
    enterCorrectEmail: true,
    enterCorrectPassword: true,
    skipCondition: { testDependency: 2, skipIfPassedEquals: true },
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    deleteCookies: false,
    skipCondition: { testDependency: 3, skipIfPassedEquals: false },
  },
];
