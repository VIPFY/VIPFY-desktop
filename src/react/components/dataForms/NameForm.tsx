import * as React from "react";
import gql from "graphql-tag";
import { graphql, withApollo, Mutation } from "react-apollo";
import compose from "lodash.flowright";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { me } from "../../queries/auth";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import { filterError } from "../../common/functions";
import { ADD_PROMOCODE } from "../../mutations/auth";
import welcomeBack from "../../../images/welcome_back.png";
import { WorkAround } from "../../interfaces";

interface Props {
  setupFinished: Function;
  client: ApolloClient<InMemoryCache>;
  moveTo: Function;
  globalMeRefetch: Function;
}

interface State {
  name: string;
  register: Boolean;
  error: string;
  showPromoInput: boolean;
  promocode: string;
}

export const SETUP_FINISHED = gql`
  mutation setupFinished($username: String, $phoneNumber: String) {
    setupFinished(username: $username, phoneNumber: $phoneNumber) {
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
    promocode: "",
    phoneNumber: ""
  };

  continue = async () => {
    try {
      await this.props.setupFinished({
        variables: {
          username: this.state.name,
          phoneNumber: this.state.phoneNumber
        }
      });
      await this.props.globalMeRefetch();
    } catch (err) {
      console.error(err);
      this.setState({ error: "Could not set your name. Please try again." });
    }
  };

  render() {
    const { showPromoInput, promocode } = this.state;

    return (
      <PopupBase small={true}>
        <div className="nameFormPopup">
          <h1>Welcome to VIPFY</h1>
          <p>Let's personalize your experience.</p>

          <div className="UniversalInputHolder">
            <UniversalTextInput
              id="name"
              label="Full Name"
              livevalue={v => this.setState({ name: v })}
              onEnter={() =>
                document.querySelector("#lastname") && document.querySelector("#lastname").focus()
              }
            />
            <UniversalTextInput
              id="phone"
              label="Phone"
              livevalue={v => this.setState({ phoneNumber: v })}
              onEnter={() => this.continue()}
            />
          </div>

          <Mutation<WorkAround, WorkAround>
            mutation={ADD_PROMOCODE}
            onCompleted={() => {
              this.setState({ newError: true });
            }}>
            {(mutate, { data, loading, error }) => (
              <React.Fragment>
                <div className="promoCode">
                  <button
                    disabled={data}
                    className="naked-button"
                    onClick={() =>
                      this.setState(prevState => ({
                        ...prevState,
                        showPromoInput: !prevState.showPromoInput
                      }))
                    }>
                    {`${showPromoInput ? "No promo code?" : "Do you have a promo code?"}`}{" "}
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
                        label="Promo Code"
                        disabled={loading}
                        livevalue={v =>
                          this.setState({ promocode: v != "" ? v : undefined, newError: false })
                        }
                        errorEvaluation={error}
                        errorhint={error && this.state.newError && filterError(error)}
                      />
                    )
                  ) : (
                    ""
                  )}
                </div>

                <UniversalButton
                  label="Finish Setup"
                  type="high"
                  disabled={this.state.register || !this.state.name || this.state.name.trim() == ""}
                  onClick={async () => {
                    this.setState({ register: true });
                    if (showPromoInput && !data) {
                      try {
                        if (promocode || promocode != "" || promocode.trim().length > 0) {
                          await mutate({ variables: { promocode } });
                        }
                        await this.continue();
                      } catch (err) {
                        this.setState({ register: false });
                        console.log("Error-Promocode", err);
                      }
                    } else {
                      await this.continue();
                    }
                  }}
                  customButtonStyles={{ width: "100%", marginTop: "24px" }}
                />
              </React.Fragment>
            )}
          </Mutation>

          {this.state.error != "" && (
            <PopupBase
              close={() => this.setState({ register: false, error: "" })}
              small={true}
              closeable={false}
              fullMiddle={true}
              noSidebar={true}>
              <div>{this.state.error}</div>
              <UniversalButton type="high" closingPopup={true} label="Ok" closingAllPopups={true} />
            </PopupBase>
          )}
        </div>
      </PopupBase>
    );
  }
}
export default compose(
  graphql(SETUP_FINISHED, { name: "setupFinished" }),
  withApollo
)(DataNameForm);
