import * as React from "react";
import { withApollo } from "@apollo/client/react/hoc";
import ReactPasswordStrength from "react-password-strength";
import { PW_MIN_LENGTH, PW_MIN_STRENGTH } from "../../common/constants";
import { ErrorComp } from "../../common/functions";
import UserName from "../../components/UserName";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { UserContext } from "../../common/context";
import { MutationLike } from "../../common/mutationlike";
import { updatePassword } from "../../common/passwords";
import { updateEmployeePassword } from "../../common/passwords";
import IconButton from "../../common/IconButton";
import { WorkAround } from "../../interfaces";
import UniversalTextInput from "../../components/universalForms/universalTextInput";

interface Password {
  score: number;
  isValid: boolean;
  password: string;
}

interface Props {
  closeFunction: Function;
  unitid: string;
  client: any; // from withApollo
}

interface State {
  currentPassword: null | String;
  newPassword: null | String;
  repeatNewPassword: null | String;
  passwordData: null | Password;
}

class PasswordUpdate extends React.Component<Props, State> {
  state = {
    currentPassword: null,
    newPassword: null,
    repeatNewPassword: null,
    passwordData: null
  };

  handlePasswordChange = (name, values) => this.setState({ [name]: values });

  render() {
    const { currentPassword } = this.state;
    const { unitid, client } = this.props;

    return (
      <UserContext.Consumer>
        {({ userid }) => (
          <MutationLike mutation={unitid == userid ? updatePassword : updateEmployeePassword}>
            {(updatePassword, { loading, error, data }) => (
              <PopupBase
                buttonStyles={{ justifyContent: "space-between" }}
                small={true}
                close={() => this.props.closeFunction()}>
                <div className="update-password">
                  <h1>
                    <span>Update Password</span>
                  </h1>
                  {userid != unitid && (
                    <h2>
                      of <UserName unitid={unitid} />
                    </h2>
                  )}
                  {data ? (
                    <React.Fragment>
                      <div className="sub-header">Updating Password was successful</div>
                      <UniversalButton onClick={this.props.closeFunction} type="high" label="ok" />
                    </React.Fragment>
                  ) : (
                      <React.Fragment>
                        {userid == unitid && (
                          <UniversalTextInput
                            id="currentPW"
                            type="password"
                            label="Current Password"
                            livevalue={v => this.setState({ currentPassword: v })}
                            onEnter={async () => document.querySelector("#newPassword").focus()}
                            holderStyles={{ width: "300px" }}
                          />
                        )}
                        <UniversalTextInput
                          id="newPassword"
                          label="New Password"
                          type="password"
                          livevalue={v => this.setState({ newPassword: v })}
                          checkPassword={passwordData => this.setState({ passwordData })}
                          additionalPasswordChecks={[this.state.currentPassword]}
                          errorhint={
                            this.state.newPassword &&
                            this.state.newPassword != "" &&
                            this.state.currentPassword == this.state.newPassword &&
                            "You can't use the same password again"
                          }
                          errorEvaluation={
                            this.state.newPassword &&
                            this.state.newPassword != "" &&
                            this.state.currentPassword == this.state.newPassword
                          }
                          onEnter={async () => document.querySelector("#repeatNewPassword").focus()}
                          holderStyles={{ width: "300px" }}
                        />
                        <UniversalTextInput
                          id="repeatNewPassword"
                          label="Repeat New Password"
                          type="password"
                          livevalue={v => this.setState({ repeatNewPassword: v })}
                          holderStyles={{ width: "300px" }}
                          errorhint={
                            this.state.repeatNewPassword &&
                            this.state.newPassword != this.state.repeatNewPassword &&
                            "Passwords don't match"
                          }
                          errorEvaluation={
                            this.state.repeatNewPassword &&
                            this.state.newPassword != this.state.repeatNewPassword
                          }
                        />
                        {error && <ErrorComp error={error} />}
                      </React.Fragment>
                    )}
                </div>

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
                      !this.state.repeatNewPassword ||
                      this.state.newPassword != this.state.repeatNewPassword ||
                      !this.state.passwordData ||
                      (this.state.passwordData &&
                        this.state.passwordData.score < PW_MIN_STRENGTH) ||
                      (this.state.passwordData &&
                        this.state.passwordData.password.length < PW_MIN_LENGTH) ||
                      (unitid == userid && !this.state.currentPassword) ||
                      loading
                    }
                    onClick={() => {
                      if (unitid == userid) {
                        return updatePassword(
                          client,
                          currentPassword,
                          this.state.passwordData.password
                        );
                      }
                      return updatePassword(client, unitid, this.state.passwordData.password);
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
