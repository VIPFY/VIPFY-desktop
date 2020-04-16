import * as React from "react";
import UniversalLoginExecutor from "../../UniversalLoginExecutor";
import { LoginResult, TestResult } from "../../../interfaces";
import * as Tests from "./tests";

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
    currentTestIndex: 0,
    testResults: [],
  };

  isPassed(test: Test, loginResult: LoginResult) {
    return test.expectLoginSuccess == loginResult.loggedIn && test.expectError == loginResult.error;
  }

  advance() {
    if (this.hasNextTest()) {
      this.setState((state) => {
        return {
          currentTestIndex: state.currentTestIndex + 1,
        };
      });
    }
  }

  hasNextTest() {
    return !!Tests.tests[this.state.currentTestIndex + 1];
  }

  setResult(currentTestIndex: number, testResult: TestResult) {
    this.setState((state) => {
      let testResults = state.testResults;
      testResults[currentTestIndex] = testResult;

      const allTestsFinished = testResults.length === Tests.tests.length;
      this.props.setResult(testResults, allTestsFinished);

      return { testResults };
    });

    this.advance();
  }

  skipTest(currentTestIndex: number) {
    const testResult = { skipped: true };
    this.setResult(currentTestIndex, testResult);
  }

  render() {
    const { currentTestIndex, testResults } = this.state;
    const { loginUrl, username, password, takeScreenshot } = this.props;

    const test = Tests.tests[currentTestIndex];
    const condition = test.skipCondition;

    const skipConditionFulfilled =
      condition &&
      testResults[condition.testDependency] &&
      testResults[condition.testDependency].passed === condition.skipIfPassedEquals;

    if (skipConditionFulfilled) {
      this.skipTest(currentTestIndex);
      return null;
    }

    return (
      <UniversalLoginExecutor
        key={currentTestIndex}
        loginUrl={loginUrl}
        username={username + (test.enterCorrectEmail ? "" : "NO")}
        password={password + (test.enterCorrectPassword ? "" : "NO")}
        speed={test.speedFactor}
        timeout={15 * SECOND}
        webviewId={currentTestIndex}
        partition={SSO_TEST_PARTITION}
        deleteCookies={!test.reuseSession}
        takeScreenshot={takeScreenshot}
        setResult={(loginResult: LoginResult, screenshot: string) => {
          const testResult = {
            passed: this.isPassed(test, loginResult),
            timedOut: loginResult.timedOut,
            screenshot,
          };
          this.setResult(currentTestIndex, testResult);
        }}
      />
    );
  }
}

export default UniversalLoginExecutorWrapper;
