import * as React from "react";
import ReactPasswordStrength from "react-password-strength";
import { withApollo } from "react-apollo";
import { PW_MIN_LENGTH } from "../../common/constants";
import UniversalButton from "../../components/universalButtons/universalButton";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import PopupBase from "./popupBase";
import { me as ME } from "../../queries/auth";
import { updatePassword as UPDATE_PASSWORD } from "../../common/passwords";
import { MutationLike } from "../../common/mutationlike";

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
      <MutationLike
        client={this.props.client}
        update={cache => {
          const { me } = cache.readQuery({ query: ME });

          cache.writeQuery({ query: ME, data: { me: { ...me, needspasswordchange: false } } });
        }}
        mutation={UPDATE_PASSWORD}
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
              <div className="buttonsPopup" style={{ justifyContent: "flex-end" }}>
                <UniversalButton
                  disabled={!this.canSubmit() || loading}
                  customStyles={{ width: "96px" }}
                  label="save"
                  type="high"
                  onClick={() => {
                    if (this.state.newPassword == this.state.repeatPassword) {
                      updatePassword(
                        this.props.client,
                        this.state.oldPassword,
                        this.state.newPassword
                      );
                    }
                  }}
                />
              </div>
            </section>

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
      </MutationLike>
    );
  }
}

export default withApollo(ForcedPasswordChange);
