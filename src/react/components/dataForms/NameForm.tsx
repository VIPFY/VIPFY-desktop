import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose, withApollo, Mutation } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { me } from "../../queries/auth";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import { filterError } from "../../common/functions";
import { ADD_PROMOCODE } from "../../mutations/auth";

interface Props {
  setupFinished: Function;
  client: ApolloClient<InMemoryCache>;
  moveTo: Function;
}

interface State {
  name: string;
  register: Boolean;
  error: string;
  showPromoInput: boolean;
  promocode: string;
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
    error: "",
    showPromoInput: false,
    promocode: ""
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
    const { showPromoInput, promocode } = this.state;

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
              <span>Let's personalize your experience.</span> <br />
              <span>First of all, what's your name?</span>
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

            <Mutation
              mutation={ADD_PROMOCODE}
              onCompleted={() => {
                if (this.state.name) {
                  setTimeout(() => this.continue(), 1000);
                }
              }}>
              {(mutate, { data, loading, error }) => (
                <React.Fragment>
                  <div className="promocode-holder">
                    <button
                      disabled={data}
                      className="naked-button"
                      onClick={() =>
                        this.setState(prevState => ({
                          ...prevState,
                          showPromoInput: !prevState.showPromoInput
                        }))
                      }>
                      {`${showPromoInput ? "Hide promocode" : "Do you have a promocode?"}`}{" "}
                      <span>Click here</span>
                    </button>

                    {showPromoInput ? (
                      data ? (
                        <div className="promo-success">
                          <i className="fal fa-check" />
                          <span>{`${this.state.promocode} successfully applied.`}</span>
                        </div>
                      ) : (
                        <UniversalTextInput
                          id="promocode"
                          width="312px"
                          className="float-in-left"
                          label="Promocode"
                          disabled={loading}
                          livevalue={v => this.setState({ promocode: v })}
                          errorEvaluation={error}
                          errorhint={error && filterError(error)}
                          onEnter={() => mutate({ variables: { promocode } })}
                        />
                      )
                    ) : (
                      ""
                    )}
                  </div>

                  {!showPromoInput || data ? (
                    <div className="login-buttons">
                      <UniversalButton
                        label="Continue"
                        type="high"
                        disabled={this.state.name == ""}
                        onClick={() => this.continue()}
                      />
                    </div>
                  ) : (
                    <div className="login-buttons">
                      <UniversalButton
                        label="Add Code"
                        type="high"
                        disabled={loading || data || !promocode}
                        onClick={() => mutate({ variables: { promocode } })}
                      />
                    </div>
                  )}
                </React.Fragment>
              )}
            </Mutation>

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
