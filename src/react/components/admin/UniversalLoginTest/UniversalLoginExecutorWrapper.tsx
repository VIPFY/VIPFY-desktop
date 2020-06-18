import * as React from "react";
import UniversalLoginExecutor from "../../UniversalLoginExecutor";
import { LoginResult, TestResult } from "../../../interfaces";
import { tests, Test } from "./tests";

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  takeScreenshot: boolean;
  setResult: (testResults: TestResult[], allTestsFinished: boolean) => void;
  noUrlCheck?: boolean;
  speed?: number;
  deleteCookies?: boolean;
  execute?: [];
  noError?: boolean;
  individualShow?: string;
  individualNotShow?: string;
}

interface State {
  currentTestIndex: number;
  testResults: TestResult[];
}

const SSO_TEST_PARTITION = "ssotest";
const SECOND = 1000;

class UniversalLoginExecutorWrapper extends React.PureComponent<Props, State> {
  state = {
    currentTestIndex: 0,
    testResults: []
  };

  isPassed(test: Test, loginResult: LoginResult) {
    return (
      test.expectLoginSuccess == loginResult.loggedIn &&
      test.expectLoginSuccess != loginResult.error &&
      (test.expectPasswordEntered === undefined ||
        test.expectPasswordEntered == loginResult.passwordEntered)
    );
  }

  advance(testIndex?: number) {
    if (this.hasNextTest(testIndex)) {
      this.setState(state => {
        return {
          currentTestIndex: (testIndex ?? state.currentTestIndex) + 1
        };
      });
    }
  }

  hasNextTest(testIndex?: number) {
    return !!tests[(testIndex ?? this.state.currentTestIndex) + 1];
  }

  setResult(currentTestIndex: number, testResult: TestResult) {
    this.setState(state => {
      let testResults = state.testResults;
      testResults[currentTestIndex] = testResult;

      const allTestsFinished = testResults.length === tests.length;
      this.props.setResult(testResults, allTestsFinished);

      return { testResults };
    });

    this.advance(currentTestIndex);
  }

  skipTest(currentTestIndex: number) {
    const testResult = { skipped: true };
    this.setResult(currentTestIndex, testResult);
  }

  render() {
    const { currentTestIndex, testResults } = this.state;
    const { loginUrl, username, password, takeScreenshot } = this.props;

    const test = tests[currentTestIndex];
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
        speed={this.props.speed || test.speedFactor}
        timeout={test.timeout ?? 15 * SECOND}
        takeScreenshot={takeScreenshot}
        webviewId={currentTestIndex}
        partition={SSO_TEST_PARTITION}
        deleteCookies={this.props.deleteCookies || test.deleteCookies}
        setResult={(loginResult: LoginResult, screenshot: string) => {
          const testResult = {
            passed: this.isPassed(test, loginResult),
            timedOut: loginResult.timedOut,
            screenshot
          };
          this.setResult(currentTestIndex, testResult);
        }}
        noUrlCheck={this.props.noUrlCheck}
        execute={this.props.execute}
        noError={this.props.noUrlCheck}
        individualShow={this.props.individualShow}
        individualNotShow={this.props.individualNotShow}
      />
    );
  }
}

export default UniversalLoginExecutorWrapper;
