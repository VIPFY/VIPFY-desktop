import * as React from "react";
import { graphql, Query, withApollo } from "react-apollo";
import WebView = require("react-electron-web-view");
import gql from "graphql-tag";

import BoughtplanUsagePerUser from "../components/usage/BoughtplanUsagePerUser";

interface Props {
  company: any;
  showPopup: Function;
}

enum Field {
  username,
  password,
  confirm
}

interface State {
  error: string;
  showBoughtplans: Boolean;
  loginurl: string;
  message: string;
  usernamefield: string;
  passwordfield: string;
  confirmbutton: string;
  currentlySetting: Field;
  logo: string;
  icon: string;
  logoW: number | null;
  logoH: number | null;
}

class SsoConfigurator extends React.PureComponent<Props, State> {
  state = {
    error: "",
    showBoughtplans: true,
    loginurl: "",
    message: "",
    usernamefield: "",
    passwordfield: "",
    confirmbutton: "",
    currentlySetting: Field.username,
    logo: "",
    icon: "",
    logoW: null,
    logoH: null
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
            <h3>Step 1: Enter Login URL</h3>
            <div className="field" style={{ width: "20em" }}>
              <div className="label">Login URL</div>
              <input
                className="inputBoxField inputBoxUnderline"
                placeholder="The URL of the login form"
                onChange={e => {
                  const loginurl = e.target.value;
                  this.setState({ loginurl });
                }}
                autoFocus={true}
                style={{ width: "500px" }}
              />
            </div>
            <h3>Step 2: </h3>
            <button
              type="button"
              onClick={() => this.setState({ currentlySetting: Field.username })}>
              Select Username Field
            </button>
            <button
              type="button"
              onClick={() => this.setState({ currentlySetting: Field.password })}>
              Select Password Field
            </button>
            <button
              type="button"
              onClick={() => this.setState({ currentlySetting: Field.confirm })}>
              Select Confirm Button
            </button>
            <WebView
              preload="./getid.js"
              webpreferences="webSecurity=no"
              src={this.state.loginurl}
              partition="ssoconfig"
              className="ssoWebview"
              onIpcMessage={e => this.onIpcMessage(e)}
            />
            Username Field: {this.state.usernamefield}
            <br />
            Password Field: {this.state.passwordfield}
            <br />
            Confirm Button Field: {this.state.confirmbutton}
            <br />
            Logo:{" "}
            <img
              src={this.state.logo}
              className="checkeredBackground"
              style={{ maxHeight: "2em", maxWidth: "32em", objectFit: "contain" }}
              onLoad={e => {
                let t = e.target;
                this.setState({ logoW: t.naturalWidth, logoH: t.naturalHeight });
              }}
            />{" "}
            ({this.state.logoW}x{this.state.logoH})
            <br />
            Icon:{" "}
            <img
              src={this.state.icon}
              className="checkeredBackground"
              style={{ maxHeight: "2em", maxWidth: "32em", objectFit: "contain" }}
              onLoad={e => {
                let t = e.target;
                this.setState({ iconW: t.naturalWidth, iconH: t.naturalHeight });
              }}
            />{" "}
            ({this.state.iconW}x{this.state.iconH})
            <br />
            {this.state.message}
            <h3>Step 4: Select Error Message</h3>
            TODO
            <h3>Step 5: Enter Test Credentials</h3>
            TODO
            <h3>Step 6: Find login type</h3>
            TODO
          </div>
        </div>
      </div>
    );
  }

  onIpcMessage(e) {
    console.log("ipc", e);
    let id = e.args[0];
    switch (e.channel) {
      case "emailobject":
        {
          this.setState({ usernamefield: id });
        }
        break;
      case "passwordobject":
        {
          this.setState({ passwordfield: id });
        }
        break;
      case "confirmbutton":
        {
          this.setState({ confirmbutton: id });
        }
        break;
      case "logo":
        {
          this.setState({ logo: id });
        }
        break;
      case "icon":
        {
          this.setState({ icon: id });
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
  }
}

export default withApollo(SsoConfigurator);
