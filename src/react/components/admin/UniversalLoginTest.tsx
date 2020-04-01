import * as React from "react";
import { Link } from "react-router-dom";
import Tooltip from "react-tooltip-lite";
import * as fs from "fs";
import UniversalLoginExecutorWrapper from "../UniversalLoginExecutorWrapper";
import * as Sites from "./sites";
import UniversalButton from "../universalButtons/universalButton";
import { TestResult } from "../../interfaces";
import { remote } from "electron";
const { session } = remote;

interface Props {}

interface State {
  currentTest: number | null;
  running: boolean;
  sites: {
    app: string;
    url: string;
    email: string;
    password: string;
    testResults?: TestResult[]; // not present in Sites imported from ./sites which causes typescript problems
  }[];
}

class UniversalLoginTest extends React.Component<Props, State> {
  state = {
    currentTest: -1,
    running: false,
    sites: Sites.sites
  };

  componentDidUpdate() {
    fs.writeFileSync("ssotest.json", JSON.stringify(this.state.sites));
  }

  advance() {
    if (!this.state.running) {
      return;
    }

    this.setState(state => {
      let nextTest = state.currentTest + 1;
      let nextSite = state.sites[nextTest];

      while (!this.loginDataAvailable(nextSite)) {
        nextTest++;
        nextSite = state.sites[nextTest];
      }

      return { ...state, currentTest: nextTest };
    });
  }

  loginDataAvailable(site) {
    if (!site) {
      return false;
    }

    return !(
      site.email == "" ||
      site.password == "" ||
      site.url == "" ||
      site.email == "-" ||
      site.password == "-" ||
      site.url == "-"
    );
  }

  renderTable(siteUnderTest) {
    return this.state.sites.map((site, i) => (
      <React.Fragment key={`${site.app}`}>
        <tr>
          <td>{site.app}</td>
          {Array.from({ length: 5 }, (_, k) => (
            <td key={`${site.app}_${i}_${k}`}>
              {this.renderTestStatus(k, site.testResults, this.state.currentTest == i)}
            </td>
          ))}
          <td>
            {/*
            <Tooltip
              direction="left"
              content={
                <span>
                  <img
                    src={site.testResults.screenshot}
                    style={{
                      width: "1024px",
                      objectFit: "cover"
                    }}
                  />
                </span>
              }>
              <span>Screenshot</span>
            </Tooltip>
            */}
          </td>
          <td>
            <span onClick={() => this.setState({ currentTest: i, running: false })}>
              <i className="fal fa-arrow-square-right" />
            </span>
          </td>
        </tr>

        {siteUnderTest === site && (
          <tr>
            <td colSpan={8}>
              <UniversalLoginExecutorWrapper
                loginUrl={site.url}
                username={site.email}
                password={site.password}
                setResult={testResults => {
                  this.setState(prev => {
                    let sites = [...prev.sites];
                    sites[prev.currentTest] = {
                      ...sites[prev.currentTest],
                      testResults
                    };
                    return { sites };
                  });
                  this.advance();
                }}
              />
            </td>
          </tr>
        )}
      </React.Fragment>
    ));
  }

  renderTestStatus(testIndex: number, results: TestResult[], isUnderTest: boolean = false) {
    if (this.hasResult(testIndex, results)) {
      return this.renderTestResult(results[testIndex]);
    } else {
      // test is either running or wasn't started yet
      return isUnderTest ? <i className="fal fa-spinner fa-spin" /> : " ";
    }
  }

  hasResult(testIndex: number, results: TestResult[]) {
    return results && results[testIndex];
  }

  renderTestResult(result: TestResult) {
    if (result.skipped) {
      return <span style={{ color: "yellow" }}>Skipped</span>;
    } else if (result.timedOut) {
      return <span style={{ color: "orange" }}>Timeout</span>;
    } else if (result.passed) {
      return <span style={{ color: "green" }}>✔</span>;
    } else {
      return <span style={{ color: "red" }}>×</span>;
    }
  }

  renderProportion(key) {
    let total = this.state.sites.filter(s => s[key] == true || s[key] === false).length;
    if (total == 0) {
      return <span>0/0</span>;
    }

    let t = this.state.sites.filter(s => s[key] == true).length;
    return (
      <span>
        {t}/{total} ({((t / total) * 100).toFixed(2)}%)
      </span>
    );
  }

  render() {
    const siteUnderTest =
      this.state.currentTest === null ? null : this.state.sites[this.state.currentTest];

    return (
      <section className="admin">
        <h1>Test Universal Login</h1>

        <UniversalButton
          onClick={() => session.fromPartition("ssotest").clearStorageData()}
          label="Clear ssoTest"
          type="high"
        />

        <div>
          {this.state.running ? (
            <span onClick={() => this.setState({ running: false })}>
              <i className="fal fa-pause" />
            </span>
          ) : (
            <span
              onClick={async () => {
                await this.setState({ running: true });
                this.advance();
              }}>
              <i className="fal fa-play" />
            </span>
          )}
        </div>
        <table className="simpletable">
          <thead>
            <tr>
              <th />
              <th>Test 1</th>
              <th>Test 2</th>
              <th>Test 3</th>
              <th>Test 4</th>
              <th>Test 5</th>
            </tr>
            <tr>
              <th>Given:</th>
              <th>Wrong Email</th>
              <th>Wrong Password</th>
              <th>Correct Credentials, Fast</th>
              <th>Correct Credentials, Slow</th>
              <th>Preexisting Session</th>
            </tr>
            <tr>
              <th>Expected:</th>
              <th>Error</th>
              <th>Error</th>
              <th>Login</th>
              <th>Login</th>
              <th>Login</th>
            </tr>
            <tr>
              <th>Tests Passed:</th>
              <th>{this.renderProportion("errorin")}</th>
              <th>{this.renderProportion("errorin")}</th>
              <th>{this.renderProportion("loggedin")}</th>
              <th>{this.renderProportion("loggedin")}</th>
              <th>{this.renderProportion("loggedin")}</th>
            </tr>
            <tr>
              <th>App</th>
            </tr>
          </thead>
          <tbody>{this.renderTable(siteUnderTest)}</tbody>
        </table>

        <button className="button-nav">
          <i className="fal fa-arrow-alt-from-right" />
          <Link to="/area/admin">Go Back</Link>
        </button>
      </section>
    );
  }
}

export default UniversalLoginTest;
