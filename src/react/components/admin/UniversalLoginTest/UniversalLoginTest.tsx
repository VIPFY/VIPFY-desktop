import * as React from "react";
import { Link } from "react-router-dom";
import Tooltip from "react-tooltip-lite";
import * as fs from "fs";
import UniversalLoginExecutorWrapper from "./UniversalLoginExecutorWrapper";
import { sites, Site } from "./sites";
import UniversalButton from "../../universalButtons/universalButton";
import { TestResult } from "../../../interfaces";
import { remote } from "electron";
import { tests } from "./tests";
import { withApollo } from "@apollo/client/react/hoc";
import gql from "graphql-tag";

const { session, dialog } = remote;
const RESULTS_FILE_PATH = "ssotest.json";

interface Props {
  dbApps?: [];
  client: any;
}

interface State {
  siteIndexUnderTest: number | null;
  runningInBatchMode: boolean;
  sites: Site[];
  takeScreenshots: boolean;
  timeout: number;
}

class UniversalLoginTest extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    const sitesWithOptions = this.mapDbAppOptionsToSites(props);

    this.state = {
      sites: sitesWithOptions,
      siteIndexUnderTest: -1,
      runningInBatchMode: false,
      takeScreenshots: true,
      timeout: 60
    };
  }

  /** Adds the options found in the database's apps to the corresponding sites */
  mapDbAppOptionsToSites(props) {
    if (!props.dbApps) {
      return sites;
    }

    return sites.map(site => {
      const dbApp = props.dbApps.find(app => app.name.toUpperCase() === site.app.toUpperCase());

      if (dbApp) {
        site.options = dbApp.options;
      }

      return site;
    });
  }

  componentDidUpdate() {
    fs.writeFileSync(RESULTS_FILE_PATH, JSON.stringify(this.state.sites));
  }

  advance(allTestsFinishedForCurrentSite: boolean) {
    if (!allTestsFinishedForCurrentSite) {
      return;
    }

    this.setState((state: State) => {
      let runningInBatchMode = state.runningInBatchMode;
      let nextSiteIndexUnderTest = -1;
      let sites = state.sites;

      if (this.state.runningInBatchMode) {
        nextSiteIndexUnderTest = state.siteIndexUnderTest + 1;
        let nextSite = state.sites[nextSiteIndexUnderTest];

        if (nextSite) {
          while (!this.loginDataAvailable(nextSite)) {
            nextSiteIndexUnderTest++;
            nextSite = state.sites[nextSiteIndexUnderTest];
          }

          sites = this.resetResultsInSite(state, nextSiteIndexUnderTest);
        } else {
          runningInBatchMode = false;
        }
      }

      return { runningInBatchMode, sites, siteIndexUnderTest: nextSiteIndexUnderTest };
    });
  }

  loginDataAvailable(site: Site) {
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

  handleResult(siteIndexUnderTest: number, testResults: TestResult[], allTestsFinished: boolean) {
    this.setState(
      (prev: State) => {
        let sites = [...prev.sites];

        testResults = testResults.map(v => {
          if (this.state.runningInBatchMode && v.passed) {
            delete v.screenshot;
          }
          return v;
        });

        sites[prev.siteIndexUnderTest] = {
          ...sites[prev.siteIndexUnderTest],
          testResults,
          allTestsFinished
        };

        return { sites };
      },

      () => this.advance(this.state.sites[siteIndexUnderTest].allTestsFinished)
    );
  }

  resetResultsInSite(state: State, siteIndex: number) {
    let sites = state.sites;

    sites[siteIndex].testResults = [];
    sites[siteIndex].allTestsFinished = false;

    return sites;
  }

  async runTestOnSite(siteIndexUnderTest: number) {
    this.setState((state: State) => {
      const sites = this.resetResultsInSite(state, siteIndexUnderTest);
      return { sites, siteIndexUnderTest, runningInBatchMode: false };
    });
  }

  renderTable(siteUnderTest: Site) {
    return this.state.sites.map((site: Site, siteIndexUnderTest: number) => (
      <React.Fragment key={`${site.app}-${siteIndexUnderTest}`}>
        <tr>
          <td>{site.app}</td>
          <td>
            <span
              onClick={() => this.runTestOnSite(siteIndexUnderTest)}
              style={{ marginRight: "8px" }}>
              <i className="fal fa-play" />
            </span>
            <span
              onClick={async () => {
                await this.setState({
                  runningInBatchMode: true,
                  siteIndexUnderTest: siteIndexUnderTest - 1
                });
                this.advance(true);
              }}>
              <i className="fal fa-fast-forward" />
            </span>
          </td>
          {Array.from({ length: tests.length }, (_, testIndex: number) => (
            <td key={`${site.app}_${siteIndexUnderTest}_${testIndex}`}>
              {this.renderTestStatus(
                testIndex,
                site.testResults,
                this.state.siteIndexUnderTest == siteIndexUnderTest
              )}
            </td>
          ))}
        </tr>

        {siteUnderTest === site && !site.allTestsFinished && (
          <tr>
            <td colSpan={7}>
              <UniversalLoginExecutorWrapper
                loginUrl={site.url}
                username={site.email}
                password={site.password}
                takeScreenshot={!this.state.runningInBatchMode || this.state.takeScreenshots}
                setResult={(testResults: TestResult[], allTestsFinished: boolean) =>
                  this.handleResult(siteIndexUnderTest, testResults, allTestsFinished)
                }
                noUrlCheck={site.options && site.options.noUrlCheck}
                speed={site.options ? site.options.loginspeed : null}
                deleteCookies={site.options && site.options.deleteCookies}
                execute={site.options ? site.options.execute : null}
                noError={site.options && site.options.noError}
                individualShow={site.options ? site.options.individualShow : ""}
                individualNotShow={site.options ? site.options.individualNotShow : ""}
                timeout={this.state.timeout * 1000}
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
                    objectFit: "cover"
                  }}
                />
              </span>
            }>
            <span style={{ color: "grey" }}>{this.renderTestResultIcon("camera")}</span>
          </Tooltip>
        )}
      </React.Fragment>
    );
  }

  hasResult(testIndex: number, results: TestResult[]) {
    return results && results[testIndex];
  }

  renderTestResultIcon(iconName: string) {
    return <i className={"fal fa-" + iconName} style={{ paddingRight: "10px" }} />;
  }

  renderTestResult(result: TestResult) {
    const { screenshot, ...cleanedResult } = result;
    const rendering = (color: string, iconName: string) => (
      <span style={{ color }} title={JSON.stringify(cleanedResult)}>
        {this.renderTestResultIcon(iconName)}
      </span>
    );

    if (result.skipped) {
      return rendering("lightgrey", "step-forward");
    } else if (result.timedOut) {
      return rendering("orange", "alarm-exclamation");
    } else if (result.passed) {
      return rendering("green", "check-square");
    } else {
      return rendering("red", "bolt");
    }
  }

  renderProportion(testIndex: number) {
    const sitesWithResult = this.state.sites.filter(
      (site: Site) =>
        !!site.testResults && site.testResults[testIndex] && !site.testResults[testIndex].skipped
    );

    const totalSitesWithResult = sitesWithResult.length;

    if (totalSitesWithResult == 0) {
      return <span>0/0 (100.00%)</span>;
    }

    const totalSitesWithPassedTestResult = sitesWithResult.filter(
      (site: Site) => site.testResults[testIndex].passed
    ).length;

    const percentage = (totalSitesWithPassedTestResult / totalSitesWithResult) * 100;

    return (
      <span>
        {totalSitesWithPassedTestResult}/{totalSitesWithResult} ({percentage.toFixed(2)}%)
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
              <i className="fal fa-pause fa-2x" style={{ padding: "8px" }}></i>
            </span>
          ) : (
              <span
                onClick={async () => {
                  await this.setState({ runningInBatchMode: true, siteIndexUnderTest: -1 });
                  this.advance(true);
                }}>
                <i
                  className="fal fa-fast-forward fa-2x"
                  style={{ padding: "8px" }}
                  id="startBatchRunIcon"
                />
              </span>
            )}
          {this.state.takeScreenshots ? (
            <span onClick={() => this.setState({ takeScreenshots: false })}>
              <span className="fa-stack" style={{ verticalAlign: "top", padding: "8px" }}>
                <i className="fal fa-camera fa-stack-1x"></i>
                <i className="fal fa-ban fa-stack-2x"></i>
              </span>
            </span>
          ) : (
              <span
                onClick={async () => {
                  await this.setState({ takeScreenshots: true });
                }}>
                <i className="fal fa-camera fa-2x" style={{ padding: "8px" }} />
              </span>
            )}
          <span
            onClick={async () => {
              const res = await dialog.showOpenDialog({
                filters: [
                  { name: "JSON", extensions: ["json"] },
                  { name: "All Files", extensions: ["*"] }
                ]
              });
              if (res.canceled) {
                return;
              }
              const sites = JSON.parse(fs.readFileSync(res.filePaths[0], { encoding: "utf8" }));
              await this.setState({ sites });
            }}
            title="Load from file">
            <i className="fal fa-folder-open fa-2x" style={{ padding: "8px" }} />
          </span>
          <span
            onClick={async () => {
              const res = await dialog.showSaveDialog({
                defaultPath: RESULTS_FILE_PATH,
                filters: [
                  { name: "JSON", extensions: ["json"] },
                  { name: "All Files", extensions: ["*"] }
                ]
              });
              if (res.canceled) {
                return;
              }
              fs.writeFileSync(res.filePath, JSON.stringify(this.state.sites));
            }}
            title="Save results to file">
            <i className="fal fa-save fa-2x" style={{ padding: "8px" }} />
          </span>
          <span
            onClick={async () => {
              this.setState({ sites });
            }}
            title="Load Local Test Config"
            style={{ marginLeft: "30px" }}>
            <i className="fal fa-globe-europe fa-2x" style={{ padding: "8px" }} />
          </span>
          <span
            onClick={async () => {
              let data = await this.props.client.query({
                query: gql`
                  query {
                    testing_fetchSSOTestConfig
                  }
                `,
                fetchPolicy: "network-only"
              });
              let sites = data.data.testing_fetchSSOTestConfig;
              this.setState({ sites });
            }}
            title="Load Remote Test Config">
            <i className="fal fa-moon fa-2x" style={{ padding: "8px" }} />
          </span>
          <span
            onClick={async () => {
              let data = await this.props.client.query({
                query: gql`
                  query {
                    testing_fetchSSOTestConfig
                  }
                `,
                fetchPolicy: "network-only"
              });
              let sites = data.data.testing_fetchSSOTestConfig.map(site => ({
                ...site,
                options: null
              }));
              this.setState({ sites });
            }}
            title="Load Remote Test Config (no options)">
            <i className="fal fa-rocket fa-2x" style={{ padding: "8px" }} />
          </span>
          <span style={{ display: "inline-block", marginLeft: "30px" }}>
            <label>
              Timeout:
              <br />
              <input
                type="number"
                id="timeoutInput"
                style={{ width: "45px", textAlign: "right" }}
                value={this.state.timeout}
                onChange={e => {
                  const timeout = parseInt(e.target.value);
                  this.setState({ timeout });
                }}
                min={1}
                max={3600}
              />{" "}
              s
            </label>
          </span>
        </div>

        <table className="simpletable">
          <thead>
            <tr>
              <th colSpan={2} />
              {Array.from({ length: tests.length }, (_, testIndex: number) => (
                <th key={testIndex}>Test {testIndex + 1}</th>
              ))}
            </tr>
            <tr>
              <th colSpan={2}>Given:</th>
              {Array.from({ length: tests.length }, (_, testIndex: number) => (
                <th key={testIndex}>{tests[testIndex].setup}</th>
              ))}
            </tr>
            <tr>
              <th colSpan={2}>Expected:</th>
              {Array.from({ length: tests.length }, (_, testIndex: number) => (
                <th key={testIndex}>{tests[testIndex].expectLoginSuccess ? "Login" : "Error"}</th>
              ))}
            </tr>
            <tr id="statistics">
              <th colSpan={2}>Tests Passed:</th>
              {Array.from({ length: tests.length }, (_, testIndex: number) => (
                <th key={testIndex}>{this.renderProportion(testIndex)}</th>
              ))}
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

export default withApollo(UniversalLoginTest);
