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
    currentlySetting: Field.username
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
    switch (e.channel) {
      case "gotId":
        {
          let id = e.args[0];
          if (this.state.currentlySetting == Field.username) {
            this.setState({ usernamefield: id });
          }
          if (this.state.currentlySetting == Field.password) {
            this.setState({ passwordfield: id });
          }
          if (this.state.currentlySetting == Field.confirm) {
            this.setState({ confirmbutton: id });
          }
          //e.target.send("loginData", key);
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
  }
}

export default withApollo(SsoConfigurator);
