import * as React from "react";
import { withApollo } from "@apollo/client/react/hoc";
import { shell } from "electron";
import { Checkbox, Link } from "@vipfy-private/vipfy-ui-lib";

import { ApolloClientType } from "../../interfaces";
import { agreeTos } from "../../mutations/auth";
import UniversalButton from "../universalButtons/universalButton";

interface FirstLoginProps {
  logMeOut: Function;
  client: ApolloClientType;
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              title="Terms of service agreement"
              name="tos"
              handleChange={v => this.setState({ tos: v })}>
              <span className="agreementText">By registering I agree to the</span>
            </Checkbox>
            <Link
              label="VIPFY Terms of Service"
              className="cta agreementText"
              style={{ marginLeft: "4px" }}
              onClick={() => shell.openExternal("https://vipfy.store/tos")}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              title="Privacy agreement"
              name="privacy"
              handleChange={v => this.setState({ privacy: v })}>
              <span className="agreementText">By registering I agree to the</span>
            </Checkbox>
            <Link
              label="VIPFY Privacy Agreement"
              className="cta agreementText"
              style={{ marginLeft: "4px" }}
              onClick={() => shell.openExternal("https://vipfy.store/privacy")}
            />
          </div>
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
