import * as React from "react";
import { Link } from "react-router-dom";
import Tooltip from "react-tooltip-lite";
import * as fs from "fs";
import UniversalLoginExecutorWrapper from "./UniversalLoginExecutorWrapper";
import * as Sites from "./sites";
import UniversalButton from "../../universalButtons/universalButton";
import { TestResult } from "../../../interfaces";
import { remote } from "electron";
const { session } = remote;

interface Props {}

interface State {
  siteIndexUnderTest: number | null;
  runningInBatchMode: boolean;
  sites: {
    app: string;
    url: string;
    email: string;
    password: string;
    testResults?: TestResult[]; // not present in Sites imported from ./sites which causes typescript problems
    allTestsFinished?: boolean;
  }[];
}

class UniversalLoginTest extends React.PureComponent<Props, State> {
  state = {
    siteIndexUnderTest: -1,
    runningInBatchMode: false,
    sites: Sites.sites,
  };

  componentDidUpdate() {
    fs.writeFileSync("ssotest.json", JSON.stringify(this.state.sites));
  }

  advance(allTestsFinishedForCurrentSite: boolean) {
    if (!allTestsFinishedForCurrentSite) {
      return;
    }

    this.setState((state) => {
      let nextSiteIndexUnderTest = -1;

      if (this.state.runningInBatchMode) {
        nextSiteIndexUnderTest = state.siteIndexUnderTest + 1;
        let nextSite = state.sites[nextSiteIndexUnderTest];

        while (!this.loginDataAvailable(nextSite)) {
          nextSiteIndexUnderTest++;
          nextSite = state.sites[nextSiteIndexUnderTest];
        }
      }

      return { siteIndexUnderTest: nextSiteIndexUnderTest };
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

  handleResult(siteIndexUnderTest, testResults, allTestsFinished) {
    this.setState(
      (prev) => {
        let sites = [...prev.sites];
        sites[prev.siteIndexUnderTest] = {
          ...sites[prev.siteIndexUnderTest],
          testResults,
          allTestsFinished,
        };

        return { sites };
      },

      () => this.advance(this.state.sites[siteIndexUnderTest].allTestsFinished)
    );
  }

  renderTable(siteUnderTest) {
    return this.state.sites.map((site, siteIndexUnderTest) => (
      <React.Fragment key={`${site.app}`}>
        <tr>
          <td>{site.app}</td>
          {Array.from({ length: 5 }, (_, testIndex) => (
            <td key={`${site.app}_${siteIndexUnderTest}_${testIndex}`}>
              {this.renderTestStatus(
                testIndex,
                site.testResults,
                this.state.siteIndexUnderTest == siteIndexUnderTest
              )}
            </td>
          ))}
          <td>
            <span onClick={() => this.setState({ siteIndexUnderTest, runningInBatchMode: false })}>
              <i className="fal fa-arrow-square-right" />
            </span>
          </td>
        </tr>

        {siteUnderTest === site && !site.allTestsFinished && (
          <tr>
            <td colSpan={7}>
              <UniversalLoginExecutorWrapper
                loginUrl={site.url}
                username={site.email}
                password={site.password}
                takeScreenshot={!this.state.runningInBatchMode}
                setResult={(testResults, allTestsFinished) =>
                  this.handleResult(siteIndexUnderTest, testResults, allTestsFinished)
                }
              />
            </td>
          </tr>
        )}
      </React.Fragment>
    ));
  }

  renderTestStatus(testIndex: number, results: TestResult[], isUnderTest: boolean = false) {
    if (!this.hasResult(testIndex, results)) {
      // test is either running or wasn't started yet
      return isUnderTest ? <i className="fal fa-spinner fa-spin" /> : " ";
    }

    return (
      <React.Fragment>
        {this.renderTestResult(results[testIndex])}
        {results[testIndex].screenshot && (
          <Tooltip
            tagName="span"
            content={
              <span>
                <img
                  src={results[testIndex].screenshot}
                  style={{
                    width: "1024px",
                    objectFit: "cover",
                  }}
                />
              </span>
            }>
            <span style={{ color: "grey" }}>{this.renderFAIcon("camera")}</span>
          </Tooltip>
        )}
      </React.Fragment>
    );
  }

  hasResult(testIndex: number, results: TestResult[]) {
    return results && results[testIndex];
  }

  renderFAIcon(iconName: string) {
    return <i className={"fas fa-" + iconName} style={{ paddingRight: "10px" }} />;
  }

  renderTestResult(result: TestResult) {
    const rendering = (color: string, iconName: string) => (
      <span style={{ color }}>{this.renderFAIcon(iconName)}</span>
    );

    if (result.skipped) {
      return rendering("lightgrey", "fast-forward");
    } else if (result.timedOut) {
      return rendering("orange", "alarm-exclamation");
    } else if (result.passed) {
      return rendering("green", "check-square");
    } else {
      return rendering("red", "bolt");
    }
  }

  renderProportion(key) {
    let total = this.state.sites.filter((s) => s[key] == true || s[key] === false).length;
    if (total == 0) {
      return <span>0/0</span>;
    }

    let t = this.state.sites.filter((s) => s[key] == true).length;
    return (
      <span>
        {t}/{total} ({((t / total) * 100).toFixed(2)}%)
      </span>
    );
  }

  render() {
    const siteUnderTest =
      this.state.siteIndexUnderTest === null
        ? null
        : this.state.sites[this.state.siteIndexUnderTest];

    return (
      <section className="admin">
        <h1>Test Universal SSO Login</h1>

        <UniversalButton
          onClick={() => session.fromPartition("ssotest").clearStorageData()}
          label="Clear all SSO Test Sessions"
          type="high"
        />

        <div>
          {this.state.runningInBatchMode ? (
            <span onClick={() => this.setState({ runningInBatchMode: false })}>
              <i className="fal fa-pause" />
            </span>
          ) : (
            <span
              onClick={async () => {
                await this.setState({ runningInBatchMode: true });
                this.advance(true);
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
