import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import Store from "electron-store";
import PrintEmployeeSquare from "../manager/universal/squares/printEmployeeSquare";
import welcomeBack from "../../../images/welcome_back.png";

interface Props {
  type: string;
  email: string;
  continueFunction: Function;
  backFunction: Function;
  error?: string;
  changeUser: Function;
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
  }

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
      <div className="dataGeneralForm">
        <div className="holder">
          <div className="logo" />
          <img src={welcomeBack} className="illustration-login" />

          <div className="holder-right">
            <h1>{`Welcome ${user ? `back, ${user.name}` : ""}`}</h1>
            <div className="UniversalInputHolder">
              {this.state.changeEmail && this.props.email ? (
                <UniversalTextInput
                  id="email"
                  type="email"
                  width="312px"
                  onEnter={() => this.props.continueFunction(this.state.field2, this.state.email)}
                  startvalue={this.props.email}
                  label="Email"
                  livevalue={email => this.setState({ email })}
                />
              ) : (
                <div className="preloggedFullname">
                  <PrintEmployeeSquare employee={user} className="accountBullet" size={20} />
                  <button
                    title="Click to update your Email"
                    className="naked-button"
                    onClick={() => this.setState({ changeEmail: true })}>
                    {user ? user.fullname : this.props.email}
                  </button>
                </div>
              )}
              <button onClick={() => this.props.changeUser()} className="notperson">
                {user ? `Not ${user.name}?` : "Change User"}
              </button>
            </div>
            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="upw"
                width="312px"
                type="password"
                label="Password"
                livevalue={v => this.setState({ field2: v, changed: true, showError: false })}
                errorEvaluation={this.props.error && this.state.changed}
                errorhint={
                  this.props.error && this.state.changed && this.state.showError ? (
                    <React.Fragment>
                      <i className="fal fa-exclamation-circle" />
                      <span>{this.props.error}</span>
                    </React.Fragment>
                  ) : null
                }
                onEnter={() => this.props.continueFunction(this.state.field2, this.state.email)}
              />
            </div>

            <div className="login-buttons" style={{ justifyContent: "flex-end" }}>
              <UniversalButton
                label={this.state.submitting ? <i className="fal fa-spinner fa-spin" /> : "login"}
                type="high"
                disabled={this.state.field2 == "" || this.state.submitting}
                onClick={async () => {
                  await this.setState({ submitting: true });
                  const hasError = await this.props.continueFunction(
                    this.state.field2,
                    this.state.email
                  );

                  if (hasError) {
                    this.setState({ showError: true });
                    setTimeout(() => this.setState({ showError: false }), 2250);
                  }

                  await this.setState({ submitting: false });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
