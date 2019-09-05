import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { PW_MIN_LENGTH } from "../../common/constants";
import ReactPasswordStrength from "react-password-strength";
import { ErrorComp } from "../../common/functions";
import UserName from "../../components/UserName";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";

const UPDATE_PASSWORD = gql`
  mutation onUpdateEmployeePassword($unitid: ID!, $password: String!, $logOut: Boolean) {
    updateEmployeePassword(unitid: $unitid, password: $password, logOut: $logOut) {
      id
      passwordlength
      passwordstrength
    }
  }
`;

interface Password {
  score: number;
  isValid: boolean;
  password: string;
}

interface Props {
  closeFunction: Function;
  unitid: number;
}

interface State {
  password: null | Password;
  passwordRepeat: null | Password;
}

class PasswordUpdate extends React.Component<Props, State> {
  state = { password: null, passwordRepeat: null };

  handlePasswordChange = (name, values) => this.setState({ [name]: values });

  render() {
    const { password, passwordRepeat } = this.state;
    const { unitid } = this.props;

    return (
      <Mutation mutation={UPDATE_PASSWORD}>
        {(updatePassword, { loading, error, data }) => (
          <PopupBase
            buttonStyles={{ justifyContent: "space-between" }}
            small={true}
            close={() => this.props.closeFunction()}>
            <div className="update-password">
              <h1>Update Password of</h1>
              <h1>
                <UserName unitid={unitid} />
              </h1>
              {data ? (
                <React.Fragment>
                  <div className="sub-header">Updating Password was successful</div>
                  <UniversalButton onClick={this.props.closeFunction} type="high" label="ok" />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div className="sub-header">You can enter a new password for the user here</div>

                  <ReactPasswordStrength
                    className="passwordStrength"
                    minLength={PW_MIN_LENGTH}
                    minScore={2}
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
                      placeholder: "Repeat Password",
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
            </div>

            {/* The Popup doesn't like Fragments, so every Button needs it's
                own check 
            */}

            {!data && (
              <UniversalButton
                type="low"
                onClick={this.props.closeFunction}
                closingPopup={true}
                label="Cancel"
              />
            )}
            {!data && (
              <UniversalButton
                type="low"
                disabled={
                  !password ||
                  !passwordRepeat ||
                  password.score < 2 ||
                  password.password != passwordRepeat.password ||
                  loading
                }
                onClick={() =>
                  updatePassword({ variables: { password: password.password, unitid } })
                }
                label="Update Password"
              />
            )}
          </PopupBase>
        )}
      </Mutation>
    );
  }
}

export default PasswordUpdate;
