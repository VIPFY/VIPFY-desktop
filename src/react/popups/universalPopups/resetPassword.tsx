import * as React from "react";
import ReactPasswordStrength from "react-password-strength";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import UserName from "../../components/UserName";
import UniversalButton from "../../components/universalButtons/universalButton";
import { PW_MIN_LENGTH } from "../../common/constants";
import { ErrorComp } from "../../common/functions";

const UPDATE_PASSWORD = gql`
  mutation onUpdateEmployeePassword($unitid: ID!, $password: String!, $logOut: Boolean) {
    updateEmployeePassword(unitid: $unitid, password: $password, logOut: $logOut) {
      id
      passwordlength
      passwordstrength
    }
  }
`;

interface Props {
  close: Function;
  user: any;
}

interface Password {
  score: number;
  isValid: boolean;
  password: string;
}

interface State {
  password: null | Password;
  passwordRepeat: null | Password;
}

class ResetPassword extends React.Component<Props, State> {
  state = { password: null, passwordRepeat: null };

  handlePasswordChange = (name, values) => this.setState({ [name]: values });

  render() {
    const { password, passwordRepeat } = this.state;

    return (
      <Mutation mutation={UPDATE_PASSWORD}>
        {(updatePassword, { loading, error, data }) => (
          <PopupBase
            buttonStyles={{ marginTop: 0, justifyContent: data ? "center" : "space-between" }}
            small={true}
            close={this.props.close}>
            <section className="update-password">
              <h1>Reset Password</h1>
              {loading ? (
                <i className="fal fa-spinner fa-spin" />
              ) : data ? (
                <div className="sub-header">Reset password was successful</div>
              ) : (
                <React.Fragment>
                  <div className="instruction">
                    Reset the password for <UserName unitid={this.props.user.id} />
                  </div>
                  <ReactPasswordStrength
                    className="passwordStrength"
                    minLength={PW_MIN_LENGTH}
                    minScore={2}
                    style={{ marginBottom: "40px" }}
                    scoreWords={["too weak", "still too weak", "okay", "good", "strong"]}
                    tooShortWord={"too short"}
                    inputProps={{
                      name: "password_input",
                      autoComplete: "off",
                      placeholder: "New Password",
                      className: "cleanup universalTextInput"
                    }}
                    changeCallback={state => this.handlePasswordChange("password", state)}
                  />
                  <ReactPasswordStrength
                    className="passwordStrength"
                    minLength={PW_MIN_LENGTH}
                    minScore={2}
                    scoreWords={["too weak", "still too weak", "okay", "good", "strong"]}
                    tooShortWord={"too short"}
                    inputProps={{
                      name: "password_input_repeat",
                      autoComplete: "off",
                      placeholder: "Repeat new Password",
                      className: "cleanup universalTextInput"
                    }}
                    changeCallback={state => this.handlePasswordChange("passwordRepeat", state)}
                  />
                  {error && <ErrorComp error={error} />}
                  <div
                    style={{
                      opacity:
                        password &&
                        passwordRepeat &&
                        passwordRepeat.password.length >= PW_MIN_LENGTH &&
                        password.password.length != passwordRepeat.password.length
                          ? 1
                          : 0
                    }}
                    className="error-field">
                    Passwords don't match
                  </div>
                </React.Fragment>
              )}
            </section>

            <UniversalButton
              type={data ? "high" : "low"}
              closingPopup={true}
              label={data ? "ok" : "cancel"}
            />
            {!data && (
              <UniversalButton
                disabled={
                  !password ||
                  !passwordRepeat ||
                  password.score < 2 ||
                  password.password != passwordRepeat.password ||
                  loading
                }
                onClick={() =>
                  updatePassword({
                    variables: { password: password.password, unitid: this.props.user.id }
                  })
                }
                type="high"
                label="Confirm"
              />
            )}
          </PopupBase>
        )}
      </Mutation>
    );
  }
}

export default ResetPassword;
