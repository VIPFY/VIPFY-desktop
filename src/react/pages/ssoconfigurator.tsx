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

  app: SsoState;
}

type Selector = string;

enum DiscoveryState {
  "Initial",
  "FindPw"
}

interface SsoState {
  logo: Image | null;
  icon: Image | null;
  color: string | null;
  loginurl: string | null;
  email: Selector | null;
  password: Selector | null;
  button1: Selector | null;
  button2: Selector | null;
  button: Selector | null;
  type: 1 | 3 | 4 | -3 | null; // -3 == 3|4
  error: Selector | null;
  hide: Selector | null;
  hidetype: 1 | 3 | null;
  state: DiscoveryState;
}

const initialApp = {
  logo: null,
  icon: null,
  color: null,
  loginurl: null,
  email: null,
  password: null,
  button1: null,
  button2: null,
  button: null,
  type: null,
  error: null,
  hide: null,
  hidetype: null,
  state: DiscoveryState.Initial
};

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

class SsoConfigurator extends React.PureComponent<Props, State> {
  state = {
    error: "",
    showBoughtplans: true,

    app: { ...initialApp }
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
          <Manager url={this.state.app.loginurl || ""} />
          <div className={`inside ${this.state.showBoughtplans ? "in" : "out"}`}>
            <h3>Step 1: Enter Login URL</h3>
            <div className="field" style={{ width: "20em" }}>
              <div className="label">Login URL</div>
              <input
                className="inputBoxField inputBoxUnderline"
                placeholder="The URL of the login form"
                onChange={e => {
                  const loginurl = e.target.value;
                  this.setState({ app: { ...initialApp, loginurl } });
                }}
                autoFocus={true}
                style={{ width: "500px" }}
              />
            </div>
            {/*<WebView
              preload="./getid.js"
              webpreferences="webSecurity=no"
              src={this.state.app.loginurl || ""}
              partition="ssoconfig"
              className="ssoWebview"
              onIpcMessage={e => this.onIpcMessage(e)}
            />*/}
            Username Field: {this.state.app.email}
            <br />
            Password Field: {this.state.app.password}
            <br />
            Confirm Button Field: {this.state.app.button} | {this.state.app.button1} |{" "}
            {this.state.app.button2}
            <br />
            Logo:{" "}
            <img
              src={(this.state.app.logo && this.state.app.logo!.data) || undefined}
              className="checkeredBackground"
              style={{ maxHeight: "2em", maxWidth: "32em", objectFit: "contain" }}
              onLoad={e => {
                let t = e.target;
                this.setState(prev => {
                  const n = { ...prev };
                  n.app.logo!.width = t.naturalWidth;
                  n.app.logo!.height = t.naturalHeight;
                  return n;
                });
              }}
            />{" "}
            ({this.state.app.logo && this.state.app.logo!.width}x
            {this.state.app.logo && this.state.app.logo!.height})
            <br />
            Icon:{" "}
            <img
              src={(this.state.app.icon && this.state.app.icon!.data) || undefined}
              className="checkeredBackground"
              style={{ maxHeight: "2em", maxWidth: "32em", objectFit: "contain" }}
              onLoad={e => {
                let t = e.target;
                this.setState(prev => {
                  const n = { ...prev };
                  n.app.icon!.width = t.naturalWidth;
                  n.app.icon!.height = t.naturalHeight;
                  return n;
                });
              }}
            />{" "}
            <span
              style={{
                visibility: this.state.app.icon !== null ? "visible" : "hidden",
                color: getSizeColor(this.state.app.icon, 64, 130)
              }}>
              ({this.state.app.icon && this.state.app.icon!.width}x
              {this.state.app.icon && this.state.app.icon!.height})
            </span>
            <br />
            Color:{" "}
            <div
              style={{
                height: "1.2em",
                width: "4em",
                backgroundColor: this.state.app.color || "#fff",
                display: "inline-block"
              }}>
              &nbsp;
            </div>
            <br />
          </div>
        </div>
      </div>
    );
  }

  async setAppElement(e: Partial<SsoState>) {
    console.log("setappelement", e, this.state);
    return this.setState(prev => {
      return { ...prev, app: { ...prev.app, ...e } };
    });
  }

  onIpcMessage(e) {
    console.log("ipc", e);
    const a = this.state.app;
    let id = e.args[0];
    switch (e.channel) {
      case "emailobject":
        {
          this.setAppElement({ email: id });
        }
        break;
      case "passwordobject":
        {
          this.setAppElement({ password: id });
        }
        break;
      case "nopasswordobject":
        {
          if (a.state == DiscoveryState.Initial) {
          }
          if (a.type === null) {
            this.setAppElement({ type: -3 });
          }
        }
        break;
      case "confirmbutton":
        {
          this.setAppElement({ button: id });
        }
        break;
      case "logo":
        {
          this.setAppElement({ logo: { data: id, width: null, height: null } });
        }
        break;
      case "icon":
        {
          this.setAppElement({ icon: { data: id, width: null, height: null } });
        }
        break;
      case "color":
        {
          this.setAppElement({ color: id });
        }
        break;
      default:
        console.log("No case applied", e.channel);
    }
    if (a.type === null) {
      if (a.email && a.password) {
        this.setAppElement({ type: 1 });
      }
    }
  }
}

export default withApollo(SsoConfigurator);
