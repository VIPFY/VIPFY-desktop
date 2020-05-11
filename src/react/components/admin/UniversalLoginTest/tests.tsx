export interface Test {
  setup: string;
  expectLoginSuccess: boolean;
  expectPasswordEntered?: boolean;
  deleteCookies: boolean;
  speedFactor?: number;
  enterCorrectEmail?: boolean;
  enterCorrectPassword?: boolean;
  skipCondition?: SkipCondition;
  timeout?: number;
}

// sometimes a test should be skipped. this defines the conditions under which that should happen
export interface SkipCondition {
  testDependency: number; // skip depending on the result of the test with this number
  skipIfPassedEquals: boolean; // skip if the result success ("passed") of the test dependency equals this value
}

// don't change test order without updating test dependencies
export const tests: Test[] = [
  {
    setup: "Correct Credentials, Fast",
    expectLoginSuccess: true,
    deleteCookies: true,
    speedFactor: 10,
    enterCorrectEmail: true,
    enterCorrectPassword: true
  },
  {
    setup: "Correct Credentials, Slow",
    expectLoginSuccess: true,
    deleteCookies: true,
    speedFactor: 2,
    enterCorrectEmail: true,
    enterCorrectPassword: true,
    skipCondition: { testDependency: 0, skipIfPassedEquals: true }
  },
  {
    setup: "Preexisting Session",
    expectLoginSuccess: true,
    deleteCookies: false,
    skipCondition: { testDependency: 1, skipIfPassedEquals: false }
  },
  {
    setup: "Wrong Email",
    expectLoginSuccess: false,
    deleteCookies: true,
    speedFactor: 6,
    enterCorrectEmail: false
  },
  {
    setup: "Wrong Password",
    expectLoginSuccess: false,
    deleteCookies: true,
    speedFactor: 4,
    enterCorrectEmail: true,
    enterCorrectPassword: false
  }
];
