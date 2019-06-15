import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import gql from "graphql-tag";
import { Query, graphql, compose, withApollo } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { me } from "../../queries/auth";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";

interface Props {
  setupFinished: Function;
  client: ApolloClient<InMemoryCache>;
  moveTo: Function;
}

interface State {
  name: string;
  register: Boolean;
  error: string;
}

export const SETUP_FINISHED = gql`
  mutation setupFinished(
    $country: String
    $vatoption: Int
    $vatnumber: String
    $placeId: String
    $ownAdress: String
    $username: String
  ) {
    setupFinished(
      country: $country
      vatoption: $vatoption
      vatnumber: $vatnumber
      placeId: $placeId
      ownAdress: $ownAdress
      username: $username
    ) {
      ok
    }
  }
`;

class DataNameForm extends React.Component<Props, State> {
  state = {
    name: "",
    register: false,
    error: ""
  };

  continue = async () => {
    this.setState({ register: true });
    try {
      await this.props.setupFinished({
        variables: {
          country: "",
          vatoption: 0,
          vatnumber: "",
          placeId: "",
          ownAdress: "",
          username: this.state.name
        }
      });
      await this.props.client.query({ query: me, fetchPolicy: "network-only" });
      this.props.moveTo("dashboard");
    } catch (err) {
      console.log(err);
      this.setState({ error: "Could not set your name. Please try again." });
    }
  };

  render() {
    return (
      <div className="dataGeneralForm">
        <div className="holder">
          <div className="logo" />
          <img
            src={`${__dirname}/../../../images/welcome_back.png`}
            className="illustration-login"
          />

          <div className="holder-right">
            <h1>Welcome to VIPFY</h1>
            <p style={{ display: "flex", flexFlow: "column", alignItems: "start" }}>
              <span>Now that you signed up, let's personalize your experience.</span> <br />
              <span>First of all, what's your Name?</span>
            </p>

            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="AddUser"
                width="312px"
                label="My name is"
                livevalue={v => this.setState({ name: v })}
                onEnter={() => this.continue()}
              />
            </div>

            <div className="login-buttons">
              <UniversalButton
                label="Continue"
                type="high"
                disabled={this.state.name == ""}
                onClick={() => this.continue()}
              />
            </div>

            {this.state.register && (
              <PopupBase
                close={() => this.setState({ register: false, error: "" })}
                small={true}
                closeable={false}
                nosidebar={true}>
                {this.state.error != "" ? (
                  <React.Fragment>
                    <div>{this.state.error}</div>
                    <UniversalButton
                      type="high"
                      closingPopup={true}
                      label="Ok"
                      closingAllPopups={true}
                    />
                  </React.Fragment>
                ) : (
                  <div>
                    <div style={{ fontSize: "32px", textAlign: "center" }}>
                      <i className="fal fa-spinner fa-spin" />
                      <div style={{ marginTop: "32px", fontSize: "16px" }}>
                        Setting up your company
                      </div>
                    </div>
                  </div>
                )}
              </PopupBase>
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default compose(
  graphql(SETUP_FINISHED, { name: "setupFinished" }),
  withApollo
)(DataNameForm);
