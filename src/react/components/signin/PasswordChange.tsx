import * as React from "react";
import { withApollo } from "react-apollo";
import ReactPasswordStrength from "react-password-strength";
import { me } from "../../queries/auth";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { CHANGE_PASSWORD } from "../../mutations/auth";

interface PasswordChangeProps {
  logMeOut: Function;
  client: ApolloClient<InMemoryCache>;
}

interface PasswordChangeState {
  oldPassword: string;
  newPassword: string | null;
  newPasswordValid: boolean;
  repeatPassword: string | null;
  error: string | null;
  loading: boolean;
}

class PasswordChange extends React.Component<PasswordChangeProps, PasswordChangeState> {
  state: PasswordChangeState = {
    oldPassword: "",
    newPassword: null,
    newPasswordValid: false,
    repeatPassword: null,
    error: null,
    loading: false
  };

  private passwordChanged(
    { score, password, isValid }: { score: number; password: string; isValid: boolean },
    feedback: any
  ): void {
    this.setState({ newPasswordValid: isValid, newPassword: password });
  }

  private repeatPasswordChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    const v = e.target.value;
    this.setState({ repeatPassword: v });
  }

  private oldPasswordChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    const v = e.target.value;
    this.setState({ oldPassword: v });
  }

  private async confirm(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }
    await this.setState({ error: null, loading: true });
    try {
      await this.props.client.mutate({
        mutation: CHANGE_PASSWORD,
        variables: {
          pw: this.state.oldPassword,
          newPw: this.state.newPassword,
          confirmPw: this.state.repeatPassword
        }
      });
      await this.props.client.query({ query: me, fetchPolicy: "network-only" });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  private abort(): void {
    this.props.logMeOut();
  }

  private canSubmit(): boolean {
    return (
      (this.state.oldPassword &&
        this.state.newPasswordValid &&
        this.state.newPassword == this.state.repeatPassword) === true
    );
  }

  render() {
    return (
      <div className="centralize backgroundLogo">
        <div className="presideHolder">
          <div className="lsrlHolder">
            <div className="partHolder">
              <div className="partHeading_Login">Welcome to VIPFY</div>

              <div className="partForm partForm_ChangePassword">
                <div className="Heading" style={{ marginBottom: "1.5rem" }}>
                  Your initial password has been sent to your email.
                  <br />
                  Please replace it to continue.
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label>
                    Initial Password:
                    <input
                      className="newInputField"
                      style={{ right: "0", position: "absolute" }}
                      placeholder="Your Old Password"
                      autoFocus
                      autoComplete="off"
                      type="password"
                      onChange={e => this.oldPasswordChanged(e)}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label>
                    New Password:
                    <ReactPasswordStrength
                      className="passwordStrength"
                      minLength={8}
                      minScore={2}
                      scoreWords={["too weak", "still too weak", "okay", "good", "strong"]}
                      tooShortWord={"too short"}
                      inputProps={{
                        name: "password_input",
                        autoComplete: "off",
                        placeholder: "Your Future Password",
                        className: "newInputField"
                      }}
                      changeCallback={(state, feedback) => this.passwordChanged(state, feedback)}
                    />
                  </label>
                </div>
                <div style={{ position: "relative" }}>
                  <label>
                    Repeat:
                    <input
                      className="newInputField"
                      style={{ right: "0", position: "absolute" }}
                      placeholder="Your Future Password"
                      type="password"
                      autoComplete="off"
                      onChange={e => this.repeatPasswordChanged(e)}
                    />
                  </label>
                  {this.state.newPassword !== null &&
                  this.state.repeatPassword !== null &&
                  this.state.newPassword !== this.state.repeatPassword ? (
                    <span className="inputError">Doesn't match</span>
                  ) : (
                    <span />
                  )}
                </div>
                {this.canSubmit() ? (
                  <div className="partButton_ChangePassword" onClick={() => this.confirm()}>
                    {this.state.loading ? (
                      <div className="spinner loginspinner">
                        <div className="double-bounce1" />
                        <div className="double-bounce2" />
                      </div>
                    ) : (
                      "Change Password"
                    )}
                  </div>
                ) : (
                  <div className="partButton_ChangePassword buttonDisabled">Change Password</div>
                )}
                <div
                  className="partButton"
                  onClick={() => this.abort()}
                  style={{ marginTop: "2em" }}>
                  Logout
                </div>
              </div>
            </div>
            <div className="seperatorHolder" />
            <div className="logoSeperator" />
            <div className={this.state.error === null ? "formError noError" : "formError oneError"}>
              {this.state.error}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withApollo(PasswordChange);
