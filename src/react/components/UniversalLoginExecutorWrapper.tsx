import * as React from "react";
import UniversalLoginExecutor from "./UniversalLoginExecutor";
import { TestResult } from "../interfaces";
import { remote } from "electron";
const { session } = remote;

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  setResult: (testResults: TestResult[], allTestsFinished: boolean) => void;
}

interface Test {
  expectLoginSuccess: boolean;
  expectError: boolean;
  reuseSession: boolean;
  speedFactor?: number;
  enterCorrectEmail?: boolean;
  enterCorrectPassword?: boolean;
  skipCondition?: SkipCondition;
}

// sometimes a test should be skipped. this defines the conditions under which that should happen
interface SkipCondition {
  testDependency: number; // skip depending on the result of the test with this number
  skipIfPassedEquals: boolean; // skip if the result success ("passed") of the test dependency equals this value
}

// don't change test order. it matters when it comes to deciding if a test can be skipped.
const tests = [
  {
    expectLoginSuccess: false,
    expectError: true,
    reuseSession: false,
    speedFactor: 5,
    enterCorrectEmail: false
  },
  {
    expectLoginSuccess: false,
    expectError: true,
    reuseSession: false,
    speedFactor: 3,
    enterCorrectEmail: true,
    enterCorrectPassword: false
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    reuseSession: false,
    speedFactor: 10,
    enterCorrectEmail: true,
    enterCorrectPassword: true
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    reuseSession: false,
    speedFactor: 1,
    enterCorrectEmail: true,
    enterCorrectPassword: true,
    skipCondition: { testDependency: 2, skipIfPassedEquals: true }
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    reuseSession: true,
    skipCondition: { testDependency: 3, skipIfPassedEquals: false }
  }
];

const SSO_TEST_PARTITION = "ssotest";
const SECOND = 1000;

class UniversalLoginExecutorWrapper extends React.Component<Props, State> {
  state = {
    currentTest: 0,
    testResults: [],
    storageDataCleared: []
  };

  isPassed(test: Test, result) {
    return test.expectLoginSuccess == result.loggedIn && test.expectError == result.error;
  }

  advance() {
    if (this.hasNextTest()) {
      this.setState(state => {
        return {
          currentTest: state.currentTest + 1
        };
      });
    }
  }

  hasNextTest() {
    return !!tests[this.state.currentTest + 1];
  }

  clearStorageData(currentTest: number) {
    if (this.state.storageDataCleared[currentTest]) {
      return;
    }

    session.fromPartition(SSO_TEST_PARTITION).clearStorageData();
    this.setState(state => {
      let storageDataCleared = state.storageDataCleared;
      storageDataCleared[currentTest] = true;

      return { storageDataCleared };
    });
  }

  setResult(currentTest: number, testResult: TestResult) {
    this.setState(state => {
      let testResults = state.testResults;
      testResults[currentTest] = testResult;

      const allTestsFinished = testResults.length === tests.length;
      this.props.setResult(testResults, allTestsFinished);

      return { testResults };
    });

    this.advance();
  }

  skipTest(currentTest: number) {
    const testResult = { skipped: true };
    this.setResult(currentTest, testResult);
  }

  render() {
    const { currentTest, testResults } = this.state;
    const test = tests[currentTest];

    const skipConditionFulfilled =
      test.skipCondition &&
      testResults[test.skipCondition.testDependency] &&
      testResults[test.skipCondition.testDependency].passed ===
        test.skipCondition.skipIfPassedEquals;

    if (skipConditionFulfilled) {
      this.skipTest(currentTest);
    }

    if (!test.reuseSession) {
      this.clearStorageData(currentTest);
    }

    return (
      <UniversalLoginExecutor
        webviewId={this.state.currentTest}
        loginUrl={this.props.loginUrl}
        username={this.props.username + (test.enterCorrectEmail ? "" : "WRONG")}
        password={this.props.password + (test.enterCorrectPassword ? "" : "WRONG")}
        speed={test.speedFactor}
        timeout={15 * SECOND}
        partition={SSO_TEST_PARTITION}
        takeScreenshot={false}
        setResult={(result, screenshot) => {
          const testResult = {
            passed: this.isPassed(test, result),
            timedOut: result.timedOut,
            screenshot
          };

          this.setResult(currentTest, testResult);
        }}
      />
    );
  }
}

export default UniversalLoginExecutorWrapper;
