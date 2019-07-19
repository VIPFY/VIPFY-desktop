import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";

interface Props {
  closeFunction: Function;
}

interface State {
  showPasswordReset: boolean;
}

class SecurityPopup extends React.Component<Props, State> {
  state = { showPasswordReset: false };

  render() {
    return (
      <section className="security-settings">
        <h1>Security Settings</h1>
        <ul>
          <li onClick={() => this.setState({ showPasswordReset: true })}>
            <i className="fal fa-key start" />
            <h3>Reset Password</h3>
            <p className="settings-info">
              Protect your account using a strong and unique login password that you don’t use for
              anything else
            </p>
            <p className="settings-message" />
            <i className="fal fa-pen end" />
          </li>

          <li>
            <i className="fal fa-key start" />
            <h3>Two-Factor Authentication</h3>
            <p className="settings-info">Authentificator App or Yubikey is recommended</p>
            <p className="settings-message" />
            <i className="fal fa-pen end" />
          </li>
        </ul>

        <UniversalButton type="low" label="back" onClick={this.props.closeFunction} />
      </section>
    );
  }
}
export default SecurityPopup;
