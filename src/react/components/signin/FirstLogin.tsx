import * as React from "react";
import { withApollo } from "react-apollo";
import { me } from "../../queries/auth";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { agreeTos } from "../../mutations/auth";

interface FirstLoginProps {
  logMeOut: Function;
  client: ApolloClient<InMemoryCache>;
}

interface FirstLoginState {
  error: string | null;
  loading: boolean;
  agreed: boolean;
}

class FirstLogin extends React.Component<FirstLoginProps, FirstLoginState> {
  state: FirstLoginState = {
    error: null,
    loading: false,
    agreed: false
  };

  private async confirm(): Promise<void> {
    await this.setState({ error: null, loading: true });
    try {
      await this.props.client.mutate({
        mutation: agreeTos
      });
      await this.props.client.query({ query: me, fetchPolicy: "network-only" });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }
  private abort(): void {
    this.props.logMeOut();
  }

  render() {
    return (
      <div className="centralize backgroundLogo">
        <div className="presideHolder">
          <div className="lsrlHolder">
            <div className="partHolder">
              <div className="partHeading_Login">Welcome to VIPFY</div>

              <div className="partForm partForm_TOS">
                <div className="flowtext">
                  With VIPFY you can use many services. Your administrator decides which services
                  you can use. If you need access to additional services, simpy request them through
                  the marketplace or ask your administrator. <br />
                  Please be aware that your administrator could access any data you enter through
                  VIPFY.
                </div>
                <div className="agreementBox">
                  <input
                    type="checkbox"
                    className="cbx"
                    id="CheckBox"
                    style={{ display: "none" }}
                    onChange={e => {
                      const v = e.target.checked;
                      this.setState({ agreed: v });
                    }}
                  />
                  <label htmlFor="CheckBox" className="check">
                    <svg width="18px" height="18px" viewBox="0 0 18 18">
                      <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                      <polyline points="1 9 7 14 15 4" />
                    </svg>
                    <span className="agreementSentence" style={{ top: 0 }}>
                      I agree to the Terms of Service and Privacy Agreement of VIPFY.
                    </span>
                  </label>
                </div>
                {this.state.agreed ? (
                  <div className="partButton_ChangePassword" onClick={() => this.confirm()}>
                    {this.state.loading ? (
                      <div className="spinner loginspinner">
                        <div className="double-bounce1" />
                        <div className="double-bounce2" />
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </div>
                ) : (
                  <div className="partButton_ChangePassword buttonDisabled">Continue</div>
                )}
                <div
                  className="partButton"
                  onClick={() => this.abort()}
                  style={{ marginTop: "1em" }}>
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

export default withApollo(FirstLogin);
