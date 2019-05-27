import * as React from "react";
import { Link } from "react-router-dom";
import Tooltip from "react-tooltip-lite";
import * as fs from "fs";
import UniversalLoginExecutorWrapper from "../UniversalLoginExecutorWrapper";
import * as Sites from "./sites";

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

function average(arr: number[]) {
  return arr.reduce((p, c) => p + c, 0) / arr.length;
}

class UniversalLoginTest extends React.Component<Props, State> {
  state = {
    currentTest: 0,
    running: false,
    sites: Sites.sites,
    backgroundRunners: []
  };

  componentDidUpdate() {
    fs.writeFileSync("ssotest.json", JSON.stringify(this.state.sites));
    console.log(this.state.backgroundRunners);

    if (this.state.backgroundRunners.length < 6) {
      for (let i = 0; i < this.state.sites.length; i++) {
        if (
          this.canTryLogin(this.state.sites[i]) &&
          !this.state.backgroundRunners.includes(i) &&
          this.state.sites[i].loggedIn === undefined &&
          this.state.sites[i].image === undefined
        ) {
          this.setState(prev => ({ backgroundRunners: [...prev.backgroundRunners, i] }));
          break;
        }
      }
    }
  }

  canTryLogin(s) {
    return !(
      s.email == "" ||
      s.password == "" ||
      s.url == "" ||
      s.email == "-" ||
      s.password == "-" ||
      s.url == "-"
    );
  }

  renderTable() {
    return this.state.sites.map((site, i) => (
      <tr key={`${site.app}_${i}`}>
        <td>{site.app}</td>
        <td>{this.displayBool(site.loggedin, this.state.currentTest == i)}</td>
        <td>{this.displayBool(site.recaptcha, this.state.currentTest == i)}</td>
        <td>{this.displayBool(site.emailEntered, this.state.currentTest == i)}</td>
        <td>{this.displayBool(site.passwordEntered, this.state.currentTest == i)}</td>
        <td>{site.speed && site.speed.toFixed(1)}</td>
        <td>
          <Tooltip
            direction="left"
            content={
              <span>
                <img src={site.image} style={{ width: "1024px", objectFit: "cover" }} />
              </span>
            }>
            <span>Details</span>
          </Tooltip>
        </td>
        <td>
          <span onClick={() => this.setState({ currentTest: i, running: false })}>
            <i className="fal fa-arrow-square-right" />
          </span>
        </td>
      </tr>
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
    let c = this.state.currentTest + 1;
    let s = this.state.sites[c];
    while (!this.canTryLogin(s)) {
      c++;
      s = this.state.sites[c];
    }
    this.setState({ currentTest: c });
  }

  renderProportion(key) {
    let t = this.state.sites.filter(s => s[key] == true).length;
    let total = this.state.sites.filter(s => s[key] == true || s[key] === false).length;
    if (total == 0) {
      return <span>0/0</span>;
    }
    return (
      <span>
        {t}/{total} ({((t / total) * 100).toFixed(2)}%)
      </span>
    );
  }

  render() {
    const currentTest =
      this.state.currentTest === null ? null : this.state.sites[this.state.currentTest];
    return (
      <section className="admin">
        <h1>This is just a heading</h1>
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
              <th>App</th>
              <th>Logged In</th>
              <th>Recaptcha</th>
              <th>Email</th>
              <th>Password</th>
              <th>Speed</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td />
              <td>{this.renderProportion("loggedin")}</td>
              <td>{this.renderProportion("recaptcha")}</td>
              <td>{this.renderProportion("emailEntered")}</td>
              <td>{this.renderProportion("passwordEntered")}</td>
              <td>{average(this.state.sites.map(s => s.speed).filter(s => !!s)).toFixed(1)}</td>
              <td />
              <td />
            </tr>
            {this.renderTable()}
          </tbody>
        </table>
        {currentTest !== null && (
          <UniversalLoginExecutorWrapper
            loginUrl={currentTest.url}
            username={currentTest.email}
            password={currentTest.password}
            timeout={60000}
            partition="ssotest"
            setResult={(result, image) => {
              const ct = this.state.currentTest;
              this.setState(prev => {
                let sites = [...prev.sites];
                sites[ct] = { ...sites[ct], ...result, image };
                return { sites };
              });
              this.advance();
            }}
          />
        )}
        <div>
          {this.state.backgroundRunners.map(r => (
            <UniversalLoginExecutorWrapper
              key={`bgrunner_${r}`}
              loginUrl={this.state.sites[r].url}
              username={this.state.sites[r].email}
              password={this.state.sites[r].password}
              timeout={60000}
              partition={`ssotest_${r}`}
              setResult={(result, image) => {
                console.log("result", r, result);
                this.setState(prev => {
                  let sites = [...prev.sites];
                  sites[r] = { ...sites[r], ...result, image };
                  let backgroundRunners = prev.backgroundRunners.filter(b => b !== r);

                  return { sites, backgroundRunners };
                });
              }}
            />
          ))}
        </div>
        <button className="button-nav">
          <i className="fal fa-arrow-alt-from-right" />
          <Link to="/area/admin">Go Back</Link>
        </button>
      </section>
    );
  }
}

export default UniversalLoginTest;
