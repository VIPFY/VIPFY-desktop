import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import Store from "electron-store";
import EmployeePicture from "../EmployeePicture";
import welcomeBack from "../../../images/welcome_back.png";

interface Props {
  type: string;
  email: string;
  continueFunction: Function;
  error?: string;
  goToRecovery: Function;
}

interface State {
  field1: string;
  field2: string;
  changed: Boolean;
  email: string;
  changeEmail: boolean;
  submitting: boolean;
  showError: boolean;
}

class Login extends React.Component<Props, State> {
  state = {
    field1: "",
    field2: "",
    changed: false,
    email: "",
    changeEmail: false,
    prevEmail: "",
    submitting: false,
    showError: false
  };

  static getDerivedStateFromProps(props, state) {
    if (props.email != state.prevEmail) {
      return { ...state, email: props.email, prevEmail: props.email };
    }
    return state;
  }

  submit = async () => {
    this.setState({ submitting: true });
    const hasError = await this.props.continueFunction(this.state.email, this.state.field2);
    if (hasError) {
      this.setState({ showError: true, submitting: false });
    }
  };

  render() {
    const store = new Store();
    let user: {
      email: string;
      name: string;
      fullname: string;
      profilepicture: string;
    } | null = null;

    if (store.has("accounts")) {
      const machineuserarray = store.get("accounts");
      user = machineuserarray.find(u => u.email == this.props.email);
    }

    return (
      <div>
        <h1>Sign In</h1>
        <UniversalTextInput
          id="email"
          type="email"
          onEnter={() => document.querySelector("#upw").focus()}
          startvalue={this.props.email}
          label="Email"
          livevalue={email => this.setState({ email })}
        />
        <UniversalTextInput
          id="upw"
          type="password"
          label="Password"
          livevalue={v => this.setState({ field2: v, changed: true, showError: false })}
          onEnter={async () => await this.submit()}
        />

        <a onClick={() => !this.state.submitting && this.props.goToRecovery()}>Forgot password?</a>

        <UniversalButton
          label="login"
          type="high"
          disabled={this.state.field2 == "" || this.state.submitting}
          customButtonStyles={{ width: "100%", marginTop: "24px", marginBottom: "16px" }}
          onClick={async () => await this.submit()}
        />

        {this.state.showError && this.props.error && (
          <div className="loginError">
            <i className="fal fa-exclamation-circle" />
            <span>{this.props.error}</span>
          </div>
        )}
      </div>
    );
  }
}

export default Login;
