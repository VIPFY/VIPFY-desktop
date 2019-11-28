import * as React from "react";
import { withApollo } from "react-apollo";
import ReactPasswordStrength from "react-password-strength";
import { PW_MIN_LENGTH } from "../../common/constants";
import { ErrorComp } from "../../common/functions";
import UserName from "../../components/UserName";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { UserContext } from "../../common/context";
import { MutationLike } from "../../common/mutationlike";
import { updatePassword } from "../../common/passwords";
import { updateEmployeePassword } from "../../common/passwords";

interface Password {
  score: number;
  isValid: boolean;
  password: string;
}

interface Props {
  closeFunction: Function;
  unitid: number;
  client: any;
}

interface State {
  password: null | Password;
  passwordRepeat: null | Password;
  currentPassword: null | Password;
}

class PasswordUpdate extends React.Component<Props, State> {
  state = { password: null, passwordRepeat: null, currentPassword: null };

  handlePasswordChange = (name, values) => this.setState({ [name]: values });

  render() {
    const { password, passwordRepeat, currentPassword } = this.state;
    const { unitid } = this.props;

    return (
      <UserContext.Consumer>
        {({ userid }) => (
          <MutationLike
            client={this.props.client}
            mutation={unitid == userid ? updatePassword : updateEmployeePassword}>
            {(updatePassword, { loading, error, data }) => (
              <PopupBase
                buttonStyles={{ justifyContent: "space-between" }}
                small={true}
                close={() => this.props.closeFunction()}>
                <div className="update-password">
                  <h1>Update Password of</h1>
                  <h1>{userid == unitid ? "Yourself" : <UserName unitid={unitid} />}</h1>
                  {data ? (
                    <React.Fragment>
                      <div className="sub-header">Updating Password was successful</div>
                      <UniversalButton onClick={this.props.closeFunction} type="high" label="ok" />
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div className="sub-header">
                        {`You can enter a new password for ${
                          userid == unitid ? "yourself" : "the user"
                        } here`}
                      </div>

                      {userid == unitid && (
                        <ReactPasswordStrength
                          className="passwordStrength not-show-bar"
                          minLength={0}
                          minScore={0}
                          scoreWords={[]}
                          tooShortWord={""}
                          inputProps={{
                            name: "password_input_current",
                            autoComplete: "off",
                            placeholder: "Current Password",
                            className: "cleanup universalTextInput"
                          }}
                          changeCallback={state =>
                            this.handlePasswordChange("currentPassword", state)
                          }
                        />
                      )}

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
                        className="passwordStrength not-show-bar"
                        minLength={PW_MIN_LENGTH}
                        minScore={2}
                        scoreWords={[]}
                        tooShortWord=""
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
                            password.password.length >= PW_MIN_LENGTH &&
                            password.password != passwordRepeat.password
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
                    type="high"
                    disabled={
                      unitid == userid
                        ? !currentPassword || !currentPassword.password
                        : false ||
                          !password ||
                          !passwordRepeat ||
                          password.score < 2 ||
                          password.password != passwordRepeat.password ||
                          loading
                    }
                    onClick={() => {
                      if (unitid == userid) {
                        if (password.password !== passwordRepeat.password) {
                          return null;
                        }
                        return updatePassword(this.props.client, pw, newPw);
                      }
                      return updatePassword(this.props.client, unitid, password.password);
                    }}
                    label="Update Password"
                  />
                )}
              </PopupBase>
            )}
          </MutationLike>
        )}
      </UserContext.Consumer>
    );
  }
}

export default withApollo(PasswordUpdate);
