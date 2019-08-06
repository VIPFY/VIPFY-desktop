import * as React from "react";
import ReactPasswordStrength from "react-password-strength";
import { Mutation } from "react-apollo";
import { CHANGE_PASSWORD, forgotPassword } from "../../mutations/auth";
import { PW_MIN_LENGTH } from "../../common/constants";
import UniversalButton from "../../components/universalButtons/universalButton";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import PopupBase from "./popupBase";
import { me as ME } from "../../queries/auth";

interface PasswordChangeProps {
  email: string;
}

interface PasswordChangeState {
  oldPassword: string;
  newPassword: string | null;
  newPasswordValid: boolean;
  repeatPassword: string | null;
  showForgotSuccess: boolean;
  showError: boolean;
}

class ForcedPasswordChange extends React.Component<PasswordChangeProps, PasswordChangeState> {
  state = {
    oldPassword: "",
    newPassword: null,
    newPasswordValid: false,
    repeatPassword: null,
    showForgotSuccess: false,
    showError: false
  };

  private passwordChanged(
    { _score, password, isValid }: { score: number; password: string; isValid: boolean },
    _feedback: any
  ): void {
    this.setState({ newPasswordValid: isValid, newPassword: password });
  }

  private repeatPasswordChanged = (repeatPassword): void => this.setState({ repeatPassword });

  private oldPasswordChanged = (oldPassword): void => this.setState({ oldPassword });

  canSubmit = (): boolean =>
    (this.state.oldPassword &&
      this.state.newPasswordValid &&
      this.state.newPassword == this.state.repeatPassword) === true;

  render() {
    return (
      <Mutation
        update={cache => {
          const { me } = cache.readQuery({ query: ME });

          cache.writeQuery({ query: ME, data: { me: { ...me, needspasswordchange: false } } });
        }}
        mutation={CHANGE_PASSWORD}
        onError={() => this.setState({ showError: true })}>
        {(updatePassword, { loading }) => (
          <PopupBase
            additionalclassName="formPopup"
            small={true}
            closeable={false}
            nooutsideclose={true}>
            <section className="force-password-change">
              <h1>Password Reset</h1>
              <h2>Your Admin forces you to reset your Password</h2>

              <UniversalTextInput
                id="oldPassword"
                livevalue={e => this.oldPasswordChanged(e)}
                label="Current Password"
                width="384px"
                type="password"
                style={{ marginTop: "10px" }}
              />
              <div style={{ marginBottom: "1.5rem" }}>
                <label>
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
                      className: "cleanup universalTextInput",
                      style: { width: "384px" }
                    }}
                    changeCallback={(state, feedback) => this.passwordChanged(state, feedback)}
                  />
                </label>
              </div>

              <UniversalTextInput
                id="repeat"
                livevalue={e => this.repeatPasswordChanged(e)}
                label="Repeat"
                errorEvaluation={
                  this.state.newPassword !== null &&
                  this.state.repeatPassword !== null &&
                  this.state.newPassword !== this.state.repeatPassword
                }
                errorhint="Passwords don't match"
                width="384px"
                style={{ marginTop: "40px" }}
                type="password"
              />

              <Mutation
                mutation={forgotPassword}
                onCompleted={() => this.setState({ showForgotSuccess: true })}
                onError={() => this.setState({ showError: true })}>
                {(forgotPassword, { loading: l2, error: e2 }) => (
                  <div className="buttonsPopup" style={{ justifyContent: "space-between" }}>
                    <UniversalButton
                      customStyles={{ width: "154px" }}
                      disabled={loading || l2}
                      label="forgot password"
                      type="low"
                      onClick={() => forgotPassword({ variables: { email: this.props.email } })}
                    />

                    <UniversalButton
                      disabled={!this.canSubmit() || loading}
                      customStyles={{ width: "96px" }}
                      label="save"
                      type="high"
                      onClick={() => {
                        updatePassword({
                          variables: {
                            pw: this.state.oldPassword,
                            newPw: this.state.newPassword,
                            confirmPw: this.state.repeatPassword
                          }
                        });
                      }}
                    />
                  </div>
                )}
              </Mutation>
            </section>

            {this.state.showForgotSuccess && (
              <PopupBase
                additionalclassName="formPopup"
                close={() => this.setState({ showForgotSuccess: false })}
                small={true}>
                <div>
                  <h1>Forgot Password successful</h1>
                  <div>{`A new Password was sent to ${this.props.email}`}</div>
                </div>

                <UniversalButton closingPopup={true} label="ok" type="high" />
              </PopupBase>
            )}

            {this.state.showError && (
              <PopupBase
                additionalclassName="formPopup"
                close={() => this.setState({ showError: false })}
                small={true}>
                <div>
                  <h1>Error</h1>
                  <div>Sorry, something went wrong. Please retry or contact support.</div>
                </div>

                <UniversalButton closingPopup={true} label="ok" type="high" />
              </PopupBase>
            )}
          </PopupBase>
        )}
      </Mutation>
    );
  }
}

export default ForcedPasswordChange;
