import * as React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import TwoFactorForm from "../common/TwoFactorForm";
import { ErrorComp } from "../common/functions";
import { WorkAround } from "../interfaces";
import twoFAPic from "../../images/forgot_password.png";

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

export default (props: Props) => {
  const handleSubmit = (token, validateToken) => {
    const twoFAToken = localStorage.getItem("twoFAToken");

    validateToken({ variables: { userid: props.unitid, type: "totp", token, twoFAToken } });
  };

  const handleToken = ({ validate2FA }) => {
    localStorage.setItem("token", validate2FA);
    localStorage.removeItem("twoFAToken");

    props.moveTo("dashboard");
  };

  return (
    <Mutation<WorkAround, WorkAround> mutation={VALIDATE_2FA} onCompleted={handleToken}>
      {(validateToken, { error, loading }) => (
        <div className="twoFactor">
          <h1>Two Factor Authentication</h1>
          {props.twoFactor.startsWith("otpauth://") ? (
            <React.Fragment>
              <p>Please enter the six-character digit code to authenticate yourself.</p>
              <TwoFactorForm
                handleSubmit={values => handleSubmit(values, validateToken)}
                fieldNumber={6}
                seperator={4}
                disabled={loading}
                customButtonStyles={{ width: "100%", marginTop: "24px" }}
              />

              <ErrorComp error={error} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div>Please authenticate with your Yubikey</div>
              <ol type="1">
                <li>Insert your Yubikey into an available USB port on your machine.</li>
                <li>
                  Place the cursor in the empty field. Touch or tap your Yubikey. The empty field
                  will be filled by the Yubikey.
                </li>
              </ol>

              <UniversalTextInput
                livevalue={value => console.log(value)}
                id="yubikey"
                type="password"
                label="Password"
              />
            </React.Fragment>
          )}
        </div>
      )}
    </Mutation>
  );
};
