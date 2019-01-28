import * as React from "react";
import LogoExtractor from "./LogoExtractor";
import UsernameFieldExtractor from "./UsernameFieldExtractor";
import ErrorFieldExtractor from "./ErrorFieldExtractor";
import app from "../../app";

type Selector = string;
interface Image {
  width: number;
  height: number;
  data: string;
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
  type: 1 | 3 | 4 | null;
  error: Selector | null;
  hide: Selector | null;
  hidetype: 1 | 3 | null;
}

enum Stage {
  findUsername,
  type34,
  findError
}

interface Props {
  url: string;
  username: string;
}

interface State {
  receivedIcon: boolean;
  stage: Stage;
}

const initialApp: SsoState = {
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
  hidetype: null
};

class Manager extends React.PureComponent<Props, State> {
  state = {
    receivedIcon: false,
    stage: Stage.findUsername
  };

  app: SsoState = { ...initialApp };
  receivedIcon = false;

  async setAppElement(e: Partial<SsoState>) {
    console.log("setappelement", e, this.state);
    this.app = { ...app, ...e };
  }

  render() {
    return (
      <div>
        <LogoExtractor
          url={this.props.url}
          setResult={(icon, color) => {
            this.setAppElement({ icon: icon, color: color });
            this.receivedIcon = true;
          }}
        />
        {this.state.stage == Stage.findUsername && (
          <UsernameFieldExtractor
            url={this.props.url}
            setResult={(u, p, b) => this.finishStage1(u, p, b)}
          />
        )}
        {this.state.stage == Stage.findError && <ErrorFieldExtractor url={this.props.url} />}
      </div>
    );
  }

  finishStage1(usernameField, passwordField, button1) {
    if (this.state.stage !== Stage.findUsername) {
      throw new Error("unexpected stage");
    }
    // TODO: fallback to manual
    if (usernameField === null) {
      console.log("NO USERNAME FIELD FOUND");
      return;
    }
    if (button1 === null) {
      console.log("NO BUTTON FIELD FOUND");
      return;
    }

    if (passwordField !== null) {
      this.setAppElement({
        type: 1,
        email: usernameField,
        password: passwordField,
        button: button1,
        button1: undefined,
        button2: undefined
      });
      console.log("found Username and Password, initiating findError");
      this.setState({ stage: Stage.findError });
    } else {
      this.setAppElement({
        email: usernameField,
        button: undefined,
        button1: button1
      });
      this.setState({ stage: Stage.type34 });
    }
  }
}

export default Manager;
