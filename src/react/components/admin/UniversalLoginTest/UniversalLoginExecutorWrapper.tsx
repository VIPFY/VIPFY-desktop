import * as React from "react";
import UniversalLoginExecutor from "../../UniversalLoginExecutor";
import { LoginResult, TestResult } from "../../../interfaces";
import * as Tests from "./tests";
import { remote } from "electron";
const { session } = remote;

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  takeScreenshot: boolean;
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

const SSO_TEST_PARTITION = "ssotest";
const SECOND = 1000;

class UniversalLoginExecutorWrapper extends React.PureComponent<Props, State> {
  state = {
    currentTest: 0,
    testResults: [],
    storageDataCleared: [],
  };

  isPassed(test: Test, loginResult: LoginResult) {
    return test.expectLoginSuccess == loginResult.loggedIn && test.expectError == loginResult.error;
  }

  advance() {
    if (this.hasNextTest()) {
      this.setState((state) => {
        return {
          currentTest: state.currentTest + 1,
        };
      });
    }
  }

  hasNextTest() {
    return !!Tests.tests[this.state.currentTest + 1];
  }

  clearStorageData(currentTest: number) {
    if (this.state.storageDataCleared[currentTest]) {
      return;
    }

    session.fromPartition(SSO_TEST_PARTITION).clearStorageData();
    this.setState((state) => {
      let storageDataCleared = state.storageDataCleared;
      storageDataCleared[currentTest] = true;

      return { storageDataCleared };
    });
  }

  setResult(currentTest: number, testResult: TestResult) {
    this.setState((state) => {
      let testResults = state.testResults;
      testResults[currentTest] = testResult;

      const allTestsFinished = testResults.length === Tests.tests.length;
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
    const test = Tests.tests[currentTest];

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
        key={this.state.currentTest}
        loginUrl={this.props.loginUrl}
        username={this.props.username + (test.enterCorrectEmail ? "" : "WRONG")}
        password={this.props.password + (test.enterCorrectPassword ? "" : "WRONG")}
        speed={test.speedFactor}
        timeout={15 * SECOND}
        webviewId={this.state.currentTest}
        partition={SSO_TEST_PARTITION}
        takeScreenshot={this.props.takeScreenshot}
        setResult={(loginResult: LoginResult, screenshot: string) => {
          const testResult = {
            passed: this.isPassed(test, loginResult),
            timedOut: loginResult.timedOut,
            screenshot,
          };

          this.setResult(currentTest, testResult);
        }}
      />
    );
  }
}

export default UniversalLoginExecutorWrapper;
