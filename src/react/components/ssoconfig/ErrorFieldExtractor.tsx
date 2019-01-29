import * as React from "react";
import WebView = require("react-electron-web-view");

interface Props {
  url: string;
  username: string;
  usernameField: string;
  passwordField: string;
  button: string | null;
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

  triedLogin = false;
  domUsername = {};
  domError = {};

  onIpcMessage(e) {
    console.log("ipc", e);
    switch (e.channel) {
      case "domMap":
        {
          if (!this.triedLogin) {
            this.triedLogin = true;
            this.domUsername = e.args[0];
            e.target.send("loginData", {
              username: this.props.username,
              password: "E7RRFEpYykZctVnW",
              usernameField: this.props.usernameField,
              passwordField: this.props.passwordField,
              button: this.props.button
            }); //password is randomly chosen to get incorrect password
          } else {
            this.domError = e.args[0];
            console.log(
              "SUCCESS",
              Object.keys(this.domUsername).length,
              Object.keys(this.domError).length
            );
            findDifference({ ...this.domUsername }, { ...this.domError });
          }
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
  }
}

Object.defineProperty(String.prototype, "includesAny", {
  value: function(searches) {
    for (const search of searches) {
      if (this.indexOf(search) !== -1) {
        return true;
      }
    }
    return false;
  }
});

function findDifference(a, b) {
  const a2 = {};
  const b2 = {};
  for (const key in a) {
    if (!(key in b)) {
      a2[key] = a[key];
    }
  }
  for (const key in b) {
    if (!(key in a)) {
      b2[key] = b[key];
    }
  }
  console.log("a", a2);
  console.log("b", b2);
  const c = Object.values(b2).find(a =>
    Object.values(a.attr).some(b => b.includesAny(["error", "alert"]))
  );
  console.log("candidate Error", c);
}

export default ErrorFieldExtractor;
