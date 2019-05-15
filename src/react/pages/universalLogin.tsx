import * as React from "react";
import { graphql, Query, withApollo } from "react-apollo";
import WebView = require("react-electron-web-view");
import Manager from "../components/ssoconfig/manager";

interface Props {
  company: any;
  showPopup: Function;
}

interface State {
  error: string;
  showBoughtplans: Boolean;

  loginUrl: string;
  username: string;
  password: string;
  running: boolean;
  result: SsoState | null;
}

interface SsoState {
  logo: Image | null;
  icon: Image | null;
  color: string | null;
  emailobject: Selector | null;
  passwordobject: Selector | null;
  button1object: Selector | null;
  button2object: Selector | null;
  buttonobject: Selector | null;
  type: 1 | 3 | 4 | 5 | null;
  errorobject: Selector | null;
  hideobject: Selector | null;
  waituntil: Selector | null;
}

type Selector = string;

interface Image {
  width: number | null;
  height: number | null;
  data: string;
}

function getSizeColor(image: Image | null, threshold1, threshold2) {
  if (image === null) {
    return "#000";
  }
  if (image.width === null || image.height === null) {
    return "#000";
  }
  if (image.width < threshold1 || image.height < threshold1) {
    return "crimson";
  }
  if (image.width < threshold2 || image.height < threshold2) {
    return "gold";
  }
  return "green";
}

class UniversalLogin extends React.PureComponent<Props, State> {
  state = {
    error: "",
    showBoughtplans: true,

    loginUrl: "",
    username: "",
    password: "",
    running: false,
    result: null
  };

  toggleShowBoughtplans = (): void =>
    this.setState(prevState => ({ showBoughtplans: !prevState.showBoughtplans }));

  render() {
    return (
      <div>
        <div className="genericHolder">
          <div
            className="header"
            onClick={() => this.toggleShowBoughtplans()}
            style={{ backgroundColor: "#e4e6e8" }}>
            <i
              className={`button-hide fas ${
                this.state.showBoughtplans ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>SSO Configurator</span>
          </div>
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <div className="field" style={{ width: "20em" }}>
              <div className="label">Login URL</div>
              <input
                className="inputBoxField inputBoxUnderline"
                placeholder="The URL of the login form"
                onChange={e => {
                  const loginUrl = e.target.value;
                  this.setState({ loginUrl, running: false, result: null });
                }}
                autoFocus={true}
                style={{ width: "500px" }}
              />
            </div>
            <br />
            <div className="field" style={{ width: "20em" }}>
              <div className="label">Username</div>
              <input
                className="inputBoxField inputBoxUnderline"
                onChange={e => {
                  const username = e.target.value;
                  this.setState({ username, running: false, result: null });
                }}
                style={{ width: "500px" }}
              />
            </div>
            <br />
            <div className="field" style={{ width: "20em" }}>
              <div className="label">Password</div>
              <input
                className="inputBoxField inputBoxUnderline"
                type="password"
                onChange={e => {
                  const password = e.target.value;
                  this.setState({ password, running: false, result: null });
                }}
                style={{ width: "500px" }}
              />
            </div>
            <br />
            {!this.state.running && (
              <button type="button" onClick={() => this.setState({ running: true, result: null })}>
                Start
              </button>
            )}
            <br />
            {this.state.running && (
              <div>
                <Manager
                  url={this.state.loginUrl}
                  username={this.state.username}
                  password={this.state.password}
                  setResult={r => this.setState({ result: r, running: false })}
                />
                <i className="fas fa-spinner fa-pulse fa-3x" />
              </div>
            )}
            {this.state.result && this.renderResult()}
            <br />
          </div>
        </div>
      </div>
    );
  }

  renderResult() {
    let r = { ...this.state.result };
    r.icon = undefined;
    r.logo = undefined;
    r.color = undefined;
    return (
      <div>
        Icon:{" "}
        <img
          src={(this.state.result!.icon && this.state.result!.icon!.data) || undefined}
          className="checkeredBackground"
          style={{ maxHeight: "2em", maxWidth: "32em", objectFit: "contain" }}
        />{" "}
        <span
          style={{
            visibility: this.state.result!.icon !== null ? "visible" : "hidden",
            color: getSizeColor(this.state.result!.icon, 64, 130)
          }}>
          ({this.state.result!.icon && this.state.result!.icon!.width}x
          {this.state.result!.icon && this.state.result!.icon!.height})
        </span>
        <br />
        Color:{" "}
        <div
          style={{
            height: "1.2em",
            width: "4em",
            backgroundColor: this.state.result!.color || "#fff",
            display: "inline-block"
          }}>
          &nbsp;
        </div>
        {this.state.result!.color}
        <br />
        Options:
        <br />
        <pre>{JSON.stringify(r, null, 2)}</pre>
      </div>
    );
  }
}

export default withApollo(UniversalLogin);
