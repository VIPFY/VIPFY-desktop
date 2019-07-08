import * as React from "react";
import { graphql } from "react-apollo";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupBase from "../../popups/universalPopups/popupBase";
import { forgotPassword } from "../../mutations/auth";
import { emailRegex } from "../../common/constants";

interface Props {
  type: string;
  preloggedin?: { email: string; name: string; fullname: string };
  continueFunction?: Function;
  backFunction?: Function;
  passwordReset: Function;
}

interface State {
  email: string;
  confirm: Boolean;
  error: string;
  finished: Boolean;
}

class PWReset extends React.Component<Props, State> {
  state = {
    email: "",
    confirm: false,
    error: "",
    finished: false,
    touched: false
  };

  sendMail = async () => {
    try {
      await this.props.passwordReset({
        variables: { email: this.state.email }
      });

      await this.setState({ confirm: true });
    } catch (err) {
      await this.setState({ error: "Something went wrong", confirm: false, finished: false });
    }
  };

  render() {
    return (
      <div className="dataGeneralForm">
        <div className="holder">
          <div className="logo" />
          <img
            src={`${__dirname}/../../../images/forgot_password.png`}
            className="illustration-login"
          />

          <div className="holder-right">
            <h1>Password Reset</h1>
            <div className="textHolder">
              Enter your email and we’ll send you instructions on how to reset your password
            </div>
            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="resetEmail"
                width="312px"
                label="Email"
                livevalue={v => this.setState({ email: v })}
                errorEvaluation={this.state.email != "" || !this.state.email.match(emailRegex)}
                errorhint={this.state.error || "A valid Email looks like this john@vipfy.com"}
                onEnter={this.sendMail}
                focus={true}
              />
            </div>

            <div className="login-buttons">
              <UniversalButton
                label="Back to Login"
                type="low"
                onClick={() => this.props.backFunction!()}
              />
              <UniversalButton
                label="Send"
                type="high"
                disabled={this.state.email == "" || !this.state.email.match(emailRegex)}
                onClick={this.sendMail}
              />
            </div>

            {this.state.confirm && (
              <PopupBase small={true} nosidebar={true} closeable={false}>
                <p>If we find your email-address in our database, we will send you a reset-link.</p>
                <UniversalButton
                  type="low"
                  closingAllPopups={true}
                  label="Ok"
                  onClick={() => this.props.continueFunction!(this.state.email)}
                />
              </PopupBase>
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default graphql(forgotPassword, { name: "passwordReset" })(PWReset);
