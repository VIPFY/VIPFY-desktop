import * as React from "react";
import { graphql, Query, withApollo } from "react-apollo";
import WebView = require("react-electron-web-view");
import { sleep } from "../common/functions";

const { session } = require("electron").remote;

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

  tries = 0;

  componentDidMount() {
    session.fromPartition("ssoconfig").clearStorageData();
  }
  componentDidUpdate() {
    session.fromPartition("ssoconfig").clearStorageData();
  }
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
                  this.setState({ loginUrl, running: false });
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
                  this.setState({ username, running: false });
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
                  this.setState({ password, running: false });
                }}
                style={{ width: "500px" }}
              />
            </div>
            <br />
            {!this.state.running && (
              <button type="button" onClick={() => this.setState({ running: true })}>
                Start
              </button>
            )}
            <br />
            {this.state.running && (
              <div>
                <WebView
                  preload="./ssoConfigPreload/universalLogin.js"
                  webpreferences="webSecurity=no"
                  src={this.state.loginUrl}
                  partition="ssoconfig"
                  className="universallogin"
                  onIpcMessage={e => this.onIpcMessage(e)}
                />
                <i className="fas fa-spinner fa-pulse fa-3x" />
              </div>
            )}
            <br />
          </div>
        </div>
      </div>
    );
  }

  async onIpcMessage(e) {
    console.log("ipc", e);
    e.target.openDevTools();
    switch (e.channel) {
      case "fillFormField":
        {
          const w = e.target;
          for await (const c of e.args[0]) {
            const shift = c.toLowerCase() != c;
            const modifiers = shift ? ["shift"] : [];
            w.sendInputEvent({ type: "keyDown", modifiers, keyCode: c });
            w.sendInputEvent({ type: "char", modifiers, keyCode: c });
            await sleep(Math.random() * 20 + 10);
            w.sendInputEvent({ type: "keyUp", modifiers, keyCode: c });
            await sleep(Math.random() * 30 + 10);
          }
          w.send("formFieldFilled");
        }
        break;
      case "getLoginData":
        {
          if (
            !document.querySelector<HTMLIFrameElement>("webview")!.src.includes("login") &&
            this.state.loginUrl.includes("login")
          ) {
            return; //we are done with login
          }
          await sleep(50);
          e.target.send("loginData", {
            username: this.state.username,
            password: this.state.password
          });
          console.log("sentLoginData", {
            username: this.state.username,
            password: this.state.password
          });
        }
        break;
    }
  }
}

export default withApollo(UniversalLogin);
