import * as React from "react";
import { withApollo } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { agreeTos } from "../../mutations/auth";
import UniversalButton from "../universalButtons/universalButton";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import welcomeImage from "../../../images/onboarding.png";

interface FirstLoginProps {
  logMeOut: Function;
  client: ApolloClient<InMemoryCache>;
  setFirstLogin: Function;
}

interface FirstLoginState {
  error: string | null;
  loading: boolean;
  tos: boolean;
  privacy: boolean;
}

class FirstLogin extends React.Component<FirstLoginProps, FirstLoginState> {
  state: FirstLoginState = {
    error: null,
    loading: false,
    tos: false,
    privacy: false
  };

  private async confirm(): Promise<void> {
    if (this.state.tos && this.state.privacy) {
      await this.setState({ error: null, loading: true });
      try {
        await this.props.client.mutate({
          mutation: agreeTos
        });

        this.props.setFirstLogin();
      } catch (err) {
        this.setState({ error: err.message, loading: false });
      }
    }
  }

  render() {
    return (
      <div className="firstLogin">
        <h1>Welcome to VIPFY!</h1>
        <p>
          With VIPFY you can use the services you need in one secure enviroment with just one login.
        </p>
        <p>
          Please be aware that your administrator could access any data you enter through VIPFY.
        </p>

        <div
          className="agreementBox"
          style={{
            marginTop: "16px",
            display: "flex",
            flexFlow: "column",
            alignItems: "unset",
            justifyContent: "space-around",
            height: "92px"
          }}>
          <UniversalCheckbox name="tos" liveValue={v => this.setState({ tos: v })}>
            <div className="agreementText">
              By registering I agree to the
              <a onClick={() => shell.openExternal("https://vipfy.store/tos")}>
                VIPFY Terms of Service
              </a>
            </div>
          </UniversalCheckbox>

          <UniversalCheckbox name="privacy" liveValue={v => this.setState({ privacy: v })}>
            <div className="agreementText">
              By registering I agree to the
              <a onClick={() => shell.openExternal("https://vipfy.store/privacy")}>
                VIPFY Privacy Agreement
              </a>
            </div>
          </UniversalCheckbox>
        </div>

        <UniversalButton
          disabled={!this.state.privacy || !this.state.tos}
          label="continue"
          type="high"
          onClick={() => this.confirm()}
          customButtonStyles={{ width: "100%", marginTop: "24px" }}
        />

        <div className={this.state.error === null ? "formError noError" : "formError oneError"}>
          {this.state.error}
        </div>
      </div>
    );
  }
}

export default withApollo(FirstLogin);
