import * as React from "react";
import UniversalLoginExecutor from "./UniversalLoginExecutor";
import { TestResult } from "../interfaces";
import { remote } from "electron";
const { session } = remote;

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  setResult: (testResults: TestResult[]) => void;
}

interface Test {
  expectLoginSuccess: boolean;
  expectError: boolean;
  reuseSession: boolean;
  speedFactor?: number;
  enterCorrectEmail?: boolean;
  enterCorrectPassword?: boolean;
}

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
    enterCorrectPassword: true
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    reuseSession: true
  }
];

const SSO_TEST_PARTITION = "ssotest";
const SECOND = 1000;

class UniversalLoginExecutorWrapper extends React.Component<Props, State> {
  state = {
    currentTest: 0,
    testResults: []
  };

  isPassed(test: Test, result) {
    return test.expectLoginSuccess == result.loggedIn && test.expectError == result.error;
  }

  advance() {
    if (this.hasNextTest()) {
      this.setState(state => {
        return { ...state, currentTest: this.state.currentTest + 1 };
      });
    } else {
      this.props.setResult(this.state.testResults);
    }
  }

  hasNextTest() {
    return !!tests[this.state.currentTest + 1];
  }

  existsReusableSession() {
    return this.isLoginSuccess(this.state.currentTest - 1);
  }

  isLoginSuccess(testNumber: number) {
    return (
      tests[testNumber] &&
      tests[testNumber].expectLoginSuccess &&
      this.state.testResults[testNumber]
    );
  }

  render() {
    const { currentTest, testResults } = this.state;
    const test = tests[currentTest];

    if (!test.reuseSession) {
      session.fromPartition(SSO_TEST_PARTITION).clearStorageData();
    } else if (!this.existsReusableSession()) {
      this.setState(() => {
        testResults[currentTest] = { skipped: true };
        return { testResults };
      });
      this.advance();
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
        //takeScreenshot={false}
        setResult={(result, screenshot) => {
          this.setState(state => {
            let testResults = [...state.testResults];
            let currentResult = testResults[state.currentTest] || {};

            currentResult.passed = this.isPassed(test, result);
            currentResult.timedOut = result.timedOut;
            currentResult.screenshot = screenshot;

            testResults[state.currentTest] = currentResult;

            return {
              testResults
            };
          });
          this.advance();
        }}
      />
    );
  }
}

export default UniversalLoginExecutorWrapper;
