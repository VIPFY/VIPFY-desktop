import * as React from "react";
import { withApollo } from "react-apollo";
import { PW_MIN_LENGTH, PW_MIN_STRENGTH } from "../../common/constants";
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
  repeatPassword: string | null;
  showError: boolean;
  passwordData: any;
}

class ForcedPasswordChange extends React.Component<PasswordChangeProps, PasswordChangeState> {
  state = {
    oldPassword: "",
    newPassword: null,
    repeatPassword: null,
    showError: false,
    passwordData: null
  };

  render() {
    return (
      <MutationLike
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
                type="password"
                label="Current Password"
                livevalue={oldPassword => this.setState({ oldPassword })}
                onEnter={async () => document.querySelector("#newPassword").focus()}
                holderStyles={{ width: "300px" }}
              />
              <UniversalTextInput
                id="newPassword"
                label="New Password"
                type="password"
                livevalue={v => this.setState({ newPassword: v })}
                checkPassword={passwordData => this.setState({ passwordData })}
                additionalPasswordChecks={[this.state.oldPassword]}
                errorhint={
                  this.state.newPassword &&
                  this.state.newPassword != "" &&
                  this.state.oldPassword == this.state.newPassword &&
                  "You can't use the same password again"
                }
                errorEvaluation={
                  this.state.newPassword &&
                  this.state.newPassword != "" &&
                  this.state.oldPassword == this.state.newPassword
                }
                onEnter={async () => document.querySelector("#repeatNewPassword").focus()}
                holderStyles={{ width: "300px" }}
              />

              <UniversalTextInput
                id="repeatNewPassword"
                label="Repeat New Password"
                type="password"
                livevalue={v => this.setState({ repeatPassword: v })}
                holderStyles={{ width: "300px" }}
                errorhint={
                  this.state.repeatPassword &&
                  this.state.newPassword != this.state.repeatPassword &&
                  "Passwords don't match"
                }
                errorEvaluation={
                  this.state.repeatPassword && this.state.newPassword != this.state.repeatPassword
                }
              />

              <div className="buttonsPopup" style={{ justifyContent: "flex-end" }}>
                <UniversalButton
                  customStyles={{ width: "96px" }}
                  label="save"
                  type="high"
                  disabled={
                    !this.state.repeatPassword ||
                    this.state.newPassword != this.state.repeatPassword ||
                    !this.state.passwordData ||
                    (this.state.passwordData && this.state.passwordData.score < PW_MIN_STRENGTH) ||
                    (this.state.passwordData &&
                      this.state.passwordData.password.length < PW_MIN_LENGTH) ||
                    !this.state.oldPassword ||
                    loading
                  }
                  onClick={() => {
                    return updatePassword(
                      this.props.client,
                      this.state.oldPassword,
                      this.state.passwordData.password
                    );
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
