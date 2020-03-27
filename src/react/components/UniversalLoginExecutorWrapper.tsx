import * as React from "react";
import UniversalLoginExecutor from "./UniversalLoginExecutor";
import { remote } from "electron";
const { session } = remote;

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  setResult: (testResults: boolean[], screenshot: string) => void;
}

interface Test {
  expectLoginSuccess: boolean;
  expectError: boolean;
  clearStorageData: boolean;
  speedFactor?: number;
  enterCorrectEmail?: boolean;
  enterCorrectPassword?: boolean;
}

const tests = [
  {
    expectLoginSuccess: false,
    expectError: true,
    clearStorageData: true,
    speedFactor: 1,
    enterCorrectEmail: false
  },
  {
    expectLoginSuccess: false,
    expectError: true,
    clearStorageData: true,
    speedFactor: 1,
    enterCorrectEmail: true,
    enterCorrectPassword: false
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    clearStorageData: true,
    speedFactor: 10,
    enterCorrectEmail: true,
    enterCorrectPassword: true
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    clearStorageData: true,
    speedFactor: 1,
    enterCorrectEmail: true,
    enterCorrectPassword: true
  },
  {
    expectLoginSuccess: true,
    expectError: false,
    clearStorageData: false
  }
];

const SSO_TEST_PARTITION = "ssotest";
const MINUTE = 60000;

class UniversalLoginExecutorWrapper extends React.Component<Props, State> {
  state = {
    currentTest: 0,
    testResults: [],
    screenshot: "" // how to deal with only 1 screenshot but 5 tests?
  };

  isPassed(test: Test, result) {
    return test.expectLoginSuccess == result.loggedin && test.expectError == result.errorin;
  }

  advance() {
    debugger;
    const nextTest = this.state.currentTest + 1;

    if (!tests[nextTest]) {
      return;
    }

    this.setState(state => {
      return { ...state, currentTest: nextTest };
    });
  }

  render() {
    debugger;
    const test = tests[this.state.currentTest];

    if (test.clearStorageData) {
      session.fromPartition(SSO_TEST_PARTITION).clearStorageData();
    }

    return (
      <UniversalLoginExecutor
        webviewId={this.state.currentTest}
        loginUrl={this.props.loginUrl}
        username={this.props.username + (test.enterCorrectEmail ? "" : "WRONG")}
        password={this.props.password + (test.enterCorrectPassword ? "" : "WRONG")}
        speed={test.speedFactor}
        timeout={MINUTE}
        partition={SSO_TEST_PARTITION}
        setResult={(result, screenshot) => {
          this.setState(state => {
            let testResults = [...state.testResults];
            testResults[state.currentTest] = this.isPassed(test, result);

            return {
              testResults,
              screenshot
            };
          });
          this.advance();
        }}
      />
    );
  }
}

export default UniversalLoginExecutorWrapper;
