import * as React from "react";
import LogoExtractor from "./LogoExtractor";
import UsernameFieldExtractor from "./UsernameFieldExtractor";
import ErrorFieldExtractor from "./ErrorFieldExtractor";
import PassowrdFieldExtractor from "./PasswordFieldExtractor";
import { remote } from "electron";
const { session } = remote;

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
  colors: string[] | null;
  emailobject: Selector | null;
  passwordobject: Selector | null;
  button1object: Selector | null;
  button2object: Selector | null;
  buttonobject: Selector | null;
  type: 1 | 3 | 4 | 5 | null;
  errorobject: Selector | null;
  hideobject: Selector | null;
  waituntil: Selector | null;
}

enum Stage {
  findUsername,
  type34,
  findError,
  done
}

interface Props {
  url: string;
  username: string;
  password: string;
  setResult(app: SsoState);
}

interface State {
  stage: Stage;
}

const initialApp: SsoState = {
  logo: null,
  icon: null,
  color: null,
  colors: null,
  emailobject: null,
  passwordobject: null,
  button1object: null,
  button2object: null,
  buttonobject: null,
  type: null,
  errorobject: null,
  hideobject: null,
  waituntil: null
};

class Manager extends React.PureComponent<Props, State> {
  state = {
    stage: Stage.findUsername
  };

  app: SsoState;
  receivedIcon = false;
  receivedAllFields = false;

  constructor(props: Props, context?: any) {
    super(props, context);
    this.reset();
  }

  reset() {
    session.fromPartition("ssoconfig").clearStorageData();
    this.app = { ...initialApp };
    this.receivedIcon = false;
    this.receivedAllFields = false;
    this.setState({ stage: Stage.findUsername });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props != prevProps) {
      this.reset();
    }
  }

  async setAppElement(e: Partial<SsoState>) {
    this.app = { ...this.app, ...e };
  }

  render() {
    return (
      <div>
        <LogoExtractor
          url={this.props.url}
          setResult={(icon, color, colors) => {
            this.setAppElement({ icon: icon, color: color, colors: colors });
            this.receivedIcon = true;
            this.done();
          }}
        />
        {this.state.stage == Stage.findUsername && (
          <UsernameFieldExtractor
            url={this.props.url}
            setResult={(u, p, b) => this.finishStage1(u, p, b)}
          />
        )}
        {this.state.stage == Stage.type34 && (
          <PassowrdFieldExtractor
            url={this.props.url}
            setResult={(p, b) => this.finishStage3(p, b)}
            username={this.props.username}
            usernameField={this.app.emailobject}
            button1={this.app.button1object}
          />
        )}
        {this.state.stage == Stage.findError && (
          <ErrorFieldExtractor
            url={this.props.url}
            username={this.props.username}
            password={this.props.password}
            usernameField={this.app.emailobject!}
            passwordField={this.app.passwordobject!}
            button={this.app.buttonobject}
            button1={this.app.button1object}
            button2={this.app.button2object}
            setResult={(e, h) => this.finishErrorHide(e, h)}
          />
        )}
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
        emailobject: usernameField,
        passwordobject: passwordField,
        buttonobject: button1,
        button1object: undefined,
        button2object: undefined,
        waituntil: usernameField
      });
      this.setState({ stage: Stage.findError });
    } else {
      this.setAppElement({
        emailobject: usernameField,
        buttonobject: undefined,
        button1object: button1
      });
      this.setState({ stage: Stage.type34 });
    }
  }

  finishStage3(passwordField, button2) {
    if (this.state.stage !== Stage.type34) {
      throw new Error("unexpected stage");
    }
    // TODO: fallback to manual
    if (passwordField === null) {
      console.log("NO USERNAME FIELD FOUND");
      return;
    }
    if (button2 === null) {
      console.log("NO BUTTON FIELD FOUND");
      return;
    }
    this.setAppElement({
      passwordobject: passwordField,
      button2object: button2,
      type: 3,
      waituntil: `${this.app.emailobject}, ${passwordField}`
    });
    this.setState({ stage: Stage.findError });
  }

  finishErrorHide(errorObject: string, hideObject: string) {
    if (errorObject === null && hideObject === null) {
      console.log(
        "Neither error Object nor password object found, are you sure credentials are correct?"
      );
    }
    this.setAppElement({ errorobject: errorObject, hideobject: hideObject });
    this.receivedAllFields = true;
    this.done();
  }

  done() {
    if (!this.receivedAllFields || !this.receivedIcon) {
      return;
    }
    this.props.setResult(this.app);
  }
}

export default Manager;
