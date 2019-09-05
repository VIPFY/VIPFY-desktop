import * as React from "react";
import WebView = require("react-electron-web-view");
import { concatName } from "../../common/functions";
import UniversalButton from "../universalButtons/universalButton";
import { User } from "../../interfaces";

interface Props {
  id: string;
  unit: User;
  data: {
    email: string;
    external: string;
    loginurl: string;
    name: string;
    password: string;
    recaptcha: boolean;
    unloaded: boolean;
    emailEntered: boolean;
    passwordEntered: boolean;
    tries: number;
    company: number;
  };
}

interface State {
  show: boolean;
}

class Integration extends React.Component<Props, State> {
  state = { show: false };

  onIPCMessage = e => {
    this.webView = e.target;
  };

  render() {
    const { data, unit } = this.props;

    return (
      <React.Fragment>
        <tr className="failed-sso">
          <td>{concatName(unit)}</td>
          <td>{data.company}</td>
          <td>{data.name}</td>
          <td>{data.loginurl}</td>
          <td>
            <i className={`fal fa-${data.recaptcha ? "check" : "times"}`} />
          </td>
          <td>
            <i className={`fal fa-${data.unloaded ? "check" : "times"}`} />
          </td>
          <td>
            <i className={`fal fa-${data.emailEntered ? "check" : "times"}`} />
          </td>
          <td>
            <i className={`fal fa-${data.passwordEntered ? "check" : "times"}`} />
          </td>
          <td>{data.tries ? data.tries : 0}</td>
          <td>
            <UniversalButton
              onClick={() => this.setState(prevState => ({ show: !prevState.show }))}
              type="high"
              label={`${this.state.show ? "Hide" : "Check"}`}
            />
          </td>
        </tr>

        {this.state.show && (
          <tr>
            <td colSpan={9}>
              <WebView
                preload="./ssoConfigPreload/universalLogin.js"
                webpreferences="webSecurity=no"
                src={data.loginurl}
                useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
                onIpcMessage={this.onIPCMessage}
              />
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  }
}

export default Integration;
