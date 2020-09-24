import * as React from "react";
import { withApollo } from "@apollo/client/react/hoc";
import WebView from "react-electron-web-view";

import * as TestData from "../../../ssoTestData.json";
import { getPreloadScriptPath } from "../common/functions";

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
  ipcHandler: Function;
  preloadscript?: string;
}

class SsoTester extends React.PureComponent<Props, State> {
  state = {
    error: "",
    showBoughtplans: true,
    loginurl: "",
    message: "",
    usernamefield: "",
    passwordfield: "",
    confirmbutton: "",
    currentlySetting: Field.username,
    ipcHandler: this.onIpcMessage
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
            />
            <span>SSO Configurator</span>
          </div>
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <button type="button" onClick={() => this.findLoginFields()}>
              Test Login Field Detection
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
              preload={getPreloadScriptPath("findForm.js")}
              webpreferences="webSecurity=no"
              src={this.state.loginurl}
              partition="ssoconfig"
              className="ssoWebview"
              onIpcMessage={e => this.dispatchIPC(e)}
            />
            Username Field: {this.state.usernamefield}
            <br />
            Password Field: {this.state.passwordfield}
            <br />
            Confirm Button Field: {this.state.confirmbutton}
            <br />
            <pre>{this.state.message}</pre>
          </div>
        </div>
      </div>
    );
  }

  dispatchIPC(e) {
    console.log("dispatch", e);
    this.state.ipcHandler.bind(this)(e);
  }

  async findLoginFields() {
    await this.setState({ preloadscript: "./findForm.js", ipcHandler: this.iterFindLoginFields });
    this.loginFieldIndex = -1;
    this.iterFindLoginFields(null);
  }

  loginFieldIndex = 0;
  iterFindLoginFields(e) {
    if (e != null) {
      if (e.channel == "debug") {
        return -1;
      }
      this.setState({
        message:
          this.state.message +
          "\n" +
          e.args[0] +
          "  ;  " +
          TestData.websites[this.loginFieldIndex].buttonobject +
          "  ;  " +
          TestData.websites[this.loginFieldIndex].loginurl
      });
    }
    this.loginFieldIndex++;
    if (this.loginFieldIndex >= TestData.websites.length) {
      return 0;
    }
    console.log("NewUrl", TestData.websites[this.loginFieldIndex].loginurl);
    this.setState({ loginurl: TestData.websites[this.loginFieldIndex].loginurl });
    return 1;
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
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
  }
}

export default withApollo(SsoTester);
