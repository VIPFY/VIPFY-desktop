import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import ResetPassword from "../../popups/universalPopups/resetPassword";
import Yubikey from "../../popups/universalPopups/Yubikey";
import GoogleAuth from "../../popups/universalPopups/GoogleAuth";
import PopupBase from "../../popups/universalPopups/popupBase";

interface Props {
  closeFunction: Function;
  user: any;
}

interface State {
  showPasswordReset: boolean;
  show2FA: boolean;
  showYubikey: boolean;
  showGoogleAuth: boolean;
}

class SecurityPopup extends React.Component<Props, State> {
  state = { showPasswordReset: false, show2FA: false, showYubikey: false, showGoogleAuth: false };

  backFunction = () => {
    if (this.state.show2FA) {
      this.setState({ show2FA: false });
    } else {
      this.props.closeFunction();
    }
  };

  render() {
    return (
      <PopupBase
        styles={{ maxWidth: "656px" }}
        small={true}
        close={this.props.closeFunction}
        closeable={true}>
        <section className="security-settings">
          <h1>{this.state.show2FA ? "Two-Factor Authentication" : "Security Settings"}</h1>
          {this.state.show2FA ? (
            <ul>
              <li style={{ cursor: "unset" }}>
                <i className="fal fa-key start" />
                <h3>Google Authenticator</h3>
                <p className="settings-info">
                  A mobile App that generates a dynamic 6 digit one time password
                </p>
                <p className="settings-message" />
                <UniversalButton
                  type="high"
                  label="set it up"
                  className="button-end"
                  onClick={() => this.setState({ showGoogleAuth: true })}
                />
              </li>

              <li style={{ cursor: "unset" }}>
                <i className="fal fa-lock-alt start" />
                <h3>Yubikey</h3>
                <p className="settings-info">
                  A hardware authentication device that emits one time passwords when tapped or
                  touched
                </p>
                <p className="settings-message" />
                <UniversalButton
                  type="high"
                  label="set it up"
                  className="button-end"
                  onClick={() => this.setState({ showYubikey: true })}
                />
              </li>
            </ul>
          ) : (
            <ul>
              <li onClick={() => this.setState({ showPasswordReset: true })}>
                <i className="fal fa-key start" />
                <h3>Reset Password</h3>
                <p className="settings-info">
                  Protect your account using a strong and unique login password that you don’t use
                  for anything else
                </p>
                <p className="settings-message" />
                <i className="fal fa-pen end" />
              </li>

              <li onClick={() => this.setState({ show2FA: true })}>
                <i className="fal fa-lock-alt start" />
                <h3>Two-Factor Authentication</h3>
                <p className="settings-info">Authenticator App or Yubikey is recommended</p>
                <p className="settings-message" />
                <i className="fal fa-pen end" />
              </li>
            </ul>
          )}

          {this.state.showPasswordReset && (
            <ResetPassword
              user={this.props.user}
              close={() => this.setState({ showPasswordReset: false })}
            />
          )}

          {this.state.showYubikey && <Yubikey />}
          {this.state.showGoogleAuth && (
            <GoogleAuth
              user={this.props.user}
              close={() => this.setState({ showGoogleAuth: false })}
            />
          )}
        </section>

        <UniversalButton type="low" label="back" onClick={this.backFunction} />
      </PopupBase>
    );
  }
}
export default SecurityPopup;
