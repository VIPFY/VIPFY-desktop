import * as React from "react";
import { withApollo } from "@apollo/client/react/hoc";
import { me } from "../../queries/auth";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import { filterError } from "../../common/functions";
import { updatePassword } from "../../common/passwords";
import { ApolloClientType } from "../../interfaces";

interface PasswordChangeProps {
  logMeOut: Function;
  client: ApolloClientType;
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
      <div className="changePassword">
        <h1>
          {firstLogin ? "Password Reset Required by Administration" : "Please set your password"}
        </h1>
        <div>
          {firstLogin
            ? "Your company’s administration requests you reset your password."
            : "Your initial password was sent to you via email. Please choose a new one to continue."}
        </div>

        <div className="password-fields">
          <UniversalTextInput
            id="oldPassword"
            livevalue={e => this.oldPasswordChanged(e)}
            label="Initial Password"
            type="password"
            onEnter={() => document.querySelector("[name='password_input']").focus()}
          />
          <UniversalTextInput
            id="newPassword"
            label="New Password"
            type="password"
            checkPassword={passwordData => this.passwordChanged(passwordData, null)}
          />

          <UniversalTextInput
            id="repeat"
            livevalue={e => this.repeatPasswordChanged(e)}
            label="Repeat New Password"
            errorEvaluation={
              this.state.newPassword !== null &&
              this.state.repeatPassword !== null &&
              this.state.newPassword !== this.state.repeatPassword
            }
            errorhint="Passwords don't match"
            type="password"
            onEnter={() => this.confirm()}
          />
        </div>

        <UniversalButton
          disabled={this.state.loading || !this.canSubmit()}
          label="continue"
          type="high"
          onClick={() => this.confirm()}
          customButtonStyles={{ width: "100%", marginTop: "24px" }}
        />
        {this.state.error && <div className="error">{this.state.error}</div>}
      </div>
    );
  }
}

export default withApollo(PasswordChange);
