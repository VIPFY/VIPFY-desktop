import * as React from "react";
import WebView from "react-electron-web-view";

interface Props {
  url: string;
  setResult(usernameField: string | null, passwordField: string | null, buttonField: string | null);
}

interface State {
  usernameField: string | null | undefined;
  passwordField: string | null | undefined;
  buttonField: string | null | undefined;
}

class UsernameFieldExtractor extends React.PureComponent<Props, State> {
  state = {
    usernameField: undefined,
    passwordField: undefined,
    buttonField: undefined
  };
  render() {
    return (
      <WebView
        preload="./ssoConfigPreload/findUsernameField.js"
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

export default UsernameFieldExtractor;
