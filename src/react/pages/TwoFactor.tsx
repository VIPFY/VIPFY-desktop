import * as React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import TwoFactorForm from "../common/TwoFactorForm";
import { ErrorComp } from "../common/functions";

const VALIDATE_2FA = gql`
  mutation onValidate2FA($userid: ID!, $type: TWOFA_TYPE!, $token: String!, $twoFAToken: String!) {
    validate2FA(userid: $userid, type: $type, token: $token, twoFAToken: $twoFAToken)
  }
`;

interface Props {
  unitid: string;
  twoFactor: string;
  moveTo: Function;
}

class TwoFactor extends React.Component<Props, State> {
  handleSubmit = (token, validateToken) => {
    const twoFAToken = localStorage.getItem("twoFAToken");

    validateToken({ variables: { userid: this.props.unitid, type: "totp", token, twoFAToken } });
  };

  handleToken = ({ validate2FA }) => {
    localStorage.setItem("token", validate2FA);
    localStorage.removeItem("twoFAToken");

    this.props.moveTo("dashboard");
  };

  render() {
    return (
      <Mutation mutation={VALIDATE_2FA} onCompleted={this.handleToken}>
        {(validateToken, { error, loading }) => (
          <section className="two-factor">
            <div className="dataGeneralForm">
              <div className="holder">
                <div className="logo" />
                <img
                  src={`${__dirname}/../../images/forgot_password.png`}
                  className="illustration-login"
                />

                <div className="holder-right">
                  <h1>Two Factor Authentication</h1>
                  {this.props.twoFactor.startsWith("otpauth://") ? (
                    <React.Fragment>
                      <p>Please enter the six-character digit code to authenticate yourself.</p>
                      <TwoFactorForm
                        handleSubmit={values => this.handleSubmit(values, validateToken)}
                        fieldNumber={6}
                        seperator={4}
                        disabled={loading}
                      />

                      <ErrorComp error={error} />
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div>Please authenticate with your Yubikey</div>
                      <ol type="1">
                        <li>Insert your Yubikey into an available USB port on your machine.</li>
                        <li>
                          Place the cursor in the empty field. Touch or tap your Yubikey. The empty
                          field will be filled by the Yubikey.
                        </li>
                      </ol>

                      <UniversalTextInput
                        width="312px"
                        livevalue={value => console.log(value)}
                        id="yubikey"
                        type="password"
                        label="Password"
                      />
                    </React.Fragment>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </Mutation>
    );
  }
}

export default TwoFactor;