import * as React from "react";
import WebView = require("react-electron-web-view");

interface Props {
  url: string;
  username: string;
  setResult(errorField);
}

interface State {
  errorField: string | null | undefined;
}

class ErrorFieldExtractor extends React.PureComponent<Props, State> {
  state = {
    errorField: undefined
  };
  render() {
    console.log("render find error");
    return (
      <WebView
        preload="./ssoConfigPreload/findErrorField.js"
        webpreferences="webSecurity=no"
        src={this.props.url || ""}
        partition="ssoconfig"
        className="invisibleWebview"
        onIpcMessage={e => this.onIpcMessage(e)}
      />
    );
  }

  onIpcMessage(e) {
    console.log("ipc", e);
    switch (e.channel) {
      case "emailobject":
        {
          const [querystring] = e.args;
          this.setState({ usernameField: querystring });
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
    if (
      this.state.usernameField !== undefined &&
      this.state.passwordField !== undefined &&
      this.state.buttonField !== undefined
    ) {
      this.props.setResult(
        this.state.usernameField!,
        this.state.passwordField!,
        this.state.buttonField!
      );
    }
  }
}

export default ErrorFieldExtractor;
