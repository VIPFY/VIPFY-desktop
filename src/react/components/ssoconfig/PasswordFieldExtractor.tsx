import * as React from "react";
import WebView from "react-electron-web-view";
import { getPreloadScriptPath } from "../../common/functions";

interface Props {
  url: string;
  setResult(passwordField: string | null, buttonField: string | null);
  username: string;
  usernameField: string;
  button1: string;
}

interface State {
  passwordField: string | null | undefined;
  buttonField: string | null | undefined;
}

class PassowrdFieldExtractor extends React.PureComponent<Props, State> {
  state = {
    passwordField: undefined,
    buttonField: undefined
  };
  render() {
    return (
      <WebView
        preload={getPreloadScriptPath("findPasswordField.js")}
        webpreferences="webSecurity=no"
        src={this.props.url || ""}
        partition="ssoconfig"
        className="invisibleWebview"
        onIpcMessage={e => this.onIpcMessage(e)}
      />
    );
  }

  onIpcMessage(e) {
    switch (e.channel) {
      case "getLoginDetails":
        {
          const { username, usernameField, button1 } = this.props;
          e.target.send("loginData", { username, usernameField, button1 });
        }
        break;
      case "passwordobject":
        {
          const [querystring] = e.args;
          this.setState({ passwordField: querystring });
        }
        break;
      case "confirmbutton":
        {
          const [querystring] = e.args;
          this.setState({ buttonField: querystring });
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
  }

  componentDidUpdate() {
    if (this.state.passwordField !== undefined && this.state.buttonField !== undefined) {
      this.props.setResult(this.state.passwordField!, this.state.buttonField!);
    }
  }
}

export default PassowrdFieldExtractor;
