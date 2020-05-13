import * as React from "react";
import { withApollo } from "react-apollo";
import ReactPasswordStrength from "react-password-strength";
import { me } from "../../queries/auth";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import { filterError } from "../../common/functions";
import { PW_MIN_LENGTH } from "../../common/constants";
import { updatePassword } from "../../common/passwords";
import welcomeImage from "../../../images/forgot-password-new.png";

interface PasswordChangeProps {
  logMeOut: Function;
  client: ApolloClient<InMemoryCache>;
  firstLogin?: boolean;
  className?: string;
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

  componentDidMount() {
    document.addEventListener("keydown", this.handleEnter);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleEnter);
  }

  private handleEnter = (e): void => {
    const { oldPassword, newPasswordValid, repeatPassword } = this.state;

    if (e.key === "Enter" || e.keyCode === 13) {
      if (oldPassword && newPasswordValid && repeatPassword) {
        this.confirm();
      }
    }
  };

  private passwordChanged(
    { password, isValid }: { score: number; password: string; isValid: boolean },
    _feedback: any
  ): void {
    this.setState({ newPasswordValid: isValid, newPassword: password });
  }

  private repeatPasswordChanged(repeatPassword): void {
    this.setState({ repeatPassword });
  }

  private oldPasswordChanged(oldPassword): void {
    this.setState({ oldPassword });
  }

  private async confirm(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }
    await this.setState({ error: null, loading: true });
    try {
      if (this.state.newPassword != this.state.repeatPassword) {
        throw new Error("Passwords don't match");
      }
      await updatePassword(this.props.client, this.state.oldPassword, this.state.newPassword!);
      await this.props.client.query({ query: me, fetchPolicy: "network-only" });
    } catch (err) {
      this.setState({ error: filterError(err), loading: false });
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
    const { firstLogin, className } = this.props;

    return (
      <section className={`welcome ${className ? className : ""}`}>
        <div className="welcome-holder">
          <img src={welcomeImage} alt="Welcome" />
          <div className="welcome-text">
            <h1>{firstLogin ? "Admin forces Password Reset" : "Please set your password"}</h1>
            <div>
              {firstLogin
                ? "Your Admin forces you to reset your password."
                : "Your initial password has been sent to your email. Please replace it to continue."}
            </div>

            <div className="password-fields">
              <UniversalTextInput
                id="oldPassword"
                livevalue={e => this.oldPasswordChanged(e)}
                label="Initial Password"
                width="312px"
                type="password"
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
                      className: "cleanup universalTextInput"
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
                width="312px"
                type="password"
              />
            </div>
            <div className={`formError ${this.state.error === null ? "no" : "one"}Error`}>
              {this.state.error}
            </div>

            <div className="universal-buttons">
              <UniversalButton
                customStyles={{ width: "105px" }}
                label="Back"
                type="low"
                onClick={() => this.abort()}
              />

              <UniversalButton
                disabled={!this.canSubmit()}
                customStyles={{ width: "105px" }}
                label="continue"
                type="high"
                onClick={() => this.confirm()}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default withApollo(PasswordChange);
