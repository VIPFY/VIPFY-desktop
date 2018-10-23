import * as React from "react";
import { withApollo } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { CHANGE_PASSWORD } from "../../mutations/auth";

interface PasswordResetProps {
  logMeOut: Function;
  client: ApolloClient<InMemoryCache>;
  history: any;
}

interface PasswordResetState {
  email: string;
  error: string | null;
  loading: boolean;
  message: string;
}

const emailregex = /^.+\@.+\..+$/;

class PasswordReset extends React.Component<PasswordResetProps, PasswordResetState> {
  state: PasswordResetState = {
    email: "",
    error: null,
    loading: false,
    message: ""
  };

  private emailChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    const v = e.target.value;
    this.setState({ email: v });
  }

  private async confirm(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }
    await this.setState({ error: null, loading: true, message: "" });
    try {
      await this.props.client.mutate({
        mutation: CHANGE_PASSWORD,
        variables: {
          email: this.state.email
        }
      });
      this.setState({ message: "An email with password reset instructions has been sent" });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  private abort(): void {
    this.props.history.goBack();
  }

  private canSubmit(): boolean {
    return (this.state.email && emailregex.test(this.state.email)) === true;
  }

  render() {
    return (
      <div className="centralize backgroundLogo">
        <div className="presideHolder">
          <div className="lsrlHolder">
            <div className="partHolder">
              <div className="partHeading_Login">Password Reset</div>

              <div className="partForm partForm_ChangePassword" style={{ width: "22em" }}>
                <div className="Heading" style={{ marginBottom: "1.5rem" }}>
                  Enter your email and we'll send you instructions on how to reset your password
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label>
                    Email:
                    <input
                      className="newInputField"
                      placeholder="me@example.com"
                      autoFocus
                      type="email"
                      name="email"
                      onChange={e => this.emailChanged(e)}
                    />
                  </label>
                </div>
                <div style={{ color: "darkgreen", minHeight: "2.5em" }}>{this.state.message}</div>
                {this.canSubmit() ? (
                  <div className="partButton_ChangePassword" onClick={() => this.confirm()}>
                    {this.state.loading ? (
                      <div className="spinner loginspinner">
                        <div className="double-bounce1" />
                        <div className="double-bounce2" />
                      </div>
                    ) : (
                      "Send Email"
                    )}
                  </div>
                ) : (
                  <div className="partButton_ChangePassword buttonDisabled">Send Email</div>
                )}
                <div
                  className="partButton"
                  onClick={() => this.abort()}
                  style={{ marginTop: "2em" }}>
                  Back
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

export default withApollo(PasswordReset);
