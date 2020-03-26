import * as React from "react";
import { Link } from "react-router-dom";
import Tooltip from "react-tooltip-lite";
import * as fs from "fs";
import UniversalLoginExecutorWrapper from "../UniversalLoginExecutorWrapper";
import * as Sites from "./sites";
import UniversalButton from "../universalButtons/universalButton";
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
    ignore: string;
    image?: string;
    emailEntered?: boolean;
    passwordEntered?: boolean;
    loggedIn?: boolean;
  }[];
  backgroundRunners: number[];
}

interface Test {
  testNumber: number;
  entersCorrectEmail?: boolean;
  entersCorrectPassword?: boolean;
  speedFactor?: number;
  preexistingSession: boolean;
}

const tests = [
  {
    testNumber: 1,
    entersCorrectEmail: false,
    speedFactor: 1,
    preexistingSession: false
  },
  {
    testNumber: 2,
    entersCorrectEmail: true,
    entersCorrectPassword: false,
    speedFactor: 1,
    preexistingSession: false
  },
  {
    testNumber: 3,
    entersCorrectEmail: true,
    entersCorrectPassword: true,
    speedFactor: 10,
    preexistingSession: false
  },
  {
    testNumber: 4,
    entersCorrectEmail: true,
    entersCorrectPassword: true,
    speedFactor: 1,
    preexistingSession: false
  },
  {
    testNumber: 5,
    preexistingSession: true
  }
];

class UniversalLoginTest extends React.Component<Props, State> {
  state = {
    currentTest: -1,
    running: false,
    sites: Sites.sites,
    backgroundRunners: []
  };

  componentDidUpdate() {
    fs.writeFileSync("ssotest.json", JSON.stringify(this.state.sites));

    if (this.state.backgroundRunners.length < 3) {
      for (let i = 0; i < this.state.sites.length; i++) {
        if (
          this.canTryLogin(this.state.sites[i]) &&
          !this.state.backgroundRunners.includes(i) &&
          this.state.sites[i].loggedIn === undefined &&
          this.state.sites[i].image === undefined
        ) {
          this.setState(state => ({ backgroundRunners: [...state.backgroundRunners, i] }));
          break;
        }
      }
    }
  }

  canTryLogin(site) {
    if (site) {
      return !(
        site.email == "" ||
        site.password == "" ||
        site.url == "" ||
        site.email == "-" ||
        site.password == "-" ||
        site.url == "-"
      );
    }
    return false;
  }

  renderTable(siteUnderTest) {
    return this.state.sites.map((site, i) => (
      <>
        <tr key={`${site.app}_${i}`}>
          <td>{site.app}</td>
          <td>{this.displayBool(site.errorin, this.state.currentTest == i)}</td>
          <td>{this.displayBool(site.errorin, this.state.currentTest == i)}</td>
          <td>{this.displayBool(site.loggedin, this.state.currentTest == i)}</td>
          <td>{this.displayBool(site.loggedin, this.state.currentTest == i)}</td>
          <td>{this.displayBool(site.loggedin, this.state.currentTest == i)}</td>
          <td>
            <Tooltip
              direction="left"
              content={
                <span>
                  <img
                    src={site.image}
                    /* TODO bug: site.image is currently unknown*/ style={{
                      width: "1024px",
                      objectFit: "cover"
                    }}
                  />
                </span>
              }>
              <span>Screenshot</span>
            </Tooltip>
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
                speed={1}
                timeout={60000}
                partition="ssotest"
                setResult={(result, image) => {
                  this.setState(prev => {
                    let sites = [...prev.sites];
                    sites[prev.currentTest] = { ...sites[prev.currentTest], ...result, image };
                    return { sites };
                  });
                  this.advance();
                }}
              />
            </td>
          </tr>
        )}
      </>
    ));
  }

  displayBool(a: boolean, b: boolean = false) {
    if (a === null || a === undefined) {
      if (b) {
        return <i className="fal fa-spinner fa-spin" />;
      }
      return " ";
    }
    return a ? <span style={{ color: "green" }}>✔</span> : <span style={{ color: "red" }}>×</span>;
  }

  advance() {
    if (!this.state.running) {
      return;
    }

    this.setState(state => {
      let nextTest = state.currentTest + 1;
      let nextSite = state.sites[nextTest];

      while (!this.canTryLogin(nextSite)) {
        nextTest++;
        nextSite = state.sites[nextTest];
      }

      return { ...state, currentTest: nextTest };
    });
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
