import * as React from "react";
import { withApollo } from "react-apollo";
import { me } from "../../queries/auth";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { agreeTos } from "../../mutations/auth";
import UniversalButton from "../universalButtons/universalButton";
import CoolCheckbox from "../CoolCheckbox";
import UniversalCheckbox from "../universalForms/universalCheckbox";

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
      <section className="welcome">
        <div className="welcome-holder">
          <img src={`${__dirname}/../../../images/onboarding.png`} alt="Welcome" />
          <div className="welcome-text">
            <h1>Welcome to VIPFY!</h1>
            <div>
              With VIPFY you can use many services. Your administrator decides which services you
              can use. If you need access to additional services, simply request them through the
              marketplace or ask your administrator. <br />
              Please be aware that your administrator could access any data you enter through VIPFY.
            </div>

            <div className="checkboxes">
              <UniversalCheckbox name="tos" liveValue={value => this.setState({ tos: value })}>
                <span style={{ lineHeight: "18px" }}>
                  I agree to the Terms of Service of VIPFY.
                </span>
              </UniversalCheckbox>
              <div style={{ height: "8px" }}></div>
              <UniversalCheckbox
                name="privacy"
                liveValue={value => this.setState({ privacy: value })}>
                <span style={{ lineHeight: "18px" }}>
                  I agree to the Privacy Agreement of VIPFY.
                </span>
              </UniversalCheckbox>
            </div>

            <UniversalButton
              disabled={!this.state.privacy || !this.state.tos}
              customStyles={{ width: "105px" }}
              label="continue"
              type="high"
              onClick={() => this.confirm()}
            />

            <div className={this.state.error === null ? "formError noError" : "formError oneError"}>
              {this.state.error}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default withApollo(FirstLogin);
