import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import { graphql, compose, withApollo } from "react-apollo";
import gql from "graphql-tag";
import UniversalTextInput from "../../../../components/universalForms/universalTextInput";
import { FETCH_ALL_BOUGHTPLANS_LICENCES } from "../../../../queries/billing";
import { AppContext } from "../../../../common/functions";
import { createEncryptedLicenceKeyObject } from "../../../../common/licences";

interface Props {
  orbit: any;
  close: Function;
  alias: string | null;
  createAccount: Function;
  client: any;
}

interface State {
  email: string | null;
  password: string | null;
  alias: string | null;
  aliastouched: boolean;
  saving: boolean;
  saved: boolean;
  error: boolean;
}

const CREATE_ACCOUNT = gql`
  mutation createAccount($orbitid: ID!, $alias: String, $logindata: JSON!) {
    createAccount(orbitid: $orbitid, alias: $alias, logindata: $logindata) {
      id
      alias
    }
  }
`;

class CreateAccount extends React.Component<Props, State> {
  state = {
    email: null,
    password: null,
    alias: this.props.alias,
    aliastouched: false,
    saving: false,
    saved: false,
    error: false
  };

  render() {
    console.log("PROPS ACCOUNT", this.props, this.state);
    return (
      <AppContext.Consumer>
        {({ addRenderElement }) => (
          <PopupBase
            innerRef={el => addRenderElement({ key: "saveAccountPopup", element: el })}
            small={true}
            nooutsideclose={true}
            close={() => this.props.close()}
            additionalclassName="assignNewAccountPopup"
            buttonStyles={{ justifyContent: "space-between" }}>
            <h1>Add Account</h1>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ lineHeight: "24px", width: "84px" }}>Email:</span>
              <UniversalTextInput
                width="300px"
                id="email"
                livevalue={v =>
                  this.props.alias || this.state.aliastouched
                    ? this.setState({ email: v })
                    : this.setState({ email: v, alias: v })
                }
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ lineHeight: "24px", width: "84px" }}>Password:</span>
              <UniversalTextInput
                width="300px"
                id="password"
                type="password"
                livevalue={v => this.setState({ password: v })}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ lineHeight: "24px", width: "84px" }}>Alias:</span>
              <UniversalTextInput
                width="300px"
                id="alias"
                livevalue={v => this.setState({ alias: v, aliastouched: true })}
                startvalue={
                  (!this.props.alias && this.state.email) || this.props.alias || undefined
                }
                update={!this.state.aliastouched}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
              <UniversalButton
                innerRef={el => addRenderElement({ key: "cancel", element: el })}
                type="low"
                label="Cancel"
                onClick={() => this.props.close()}
              />
              <UniversalButton
                innerRef={el => addRenderElement({ key: "saveAccount", element: el })}
                type="high"
                label="Save"
                disabled={!(this.state.email && this.state.password && this.state.alias)}
                onClick={async () => {
                  this.setState({ saving: true });
                  try {
                    const logindata = await createEncryptedLicenceKeyObject(
                      {
                        username: this.state.email,
                        password: this.state.password
                      },
                      false,
                      this.props.client
                    );
                    const account = await this.props.createAccount({
                      variables: {
                        orbitid: this.props.orbit.id,
                        alias: this.state.alias,
                        logindata
                      },
                      refetchQueries: [
                        {
                          query: FETCH_ALL_BOUGHTPLANS_LICENCES,
                          variables: {
                            appid: this.props.orbit.plan
                              ? this.props.orbit.plan.app.id
                              : this.props.orbit.planid.appid.id
                          }
                        }
                      ]
                    });
                    this.setState({ saved: true });
                    setTimeout(
                      () => this.props.close({ ...account.data.createAccount, new: true }),
                      1000
                    );
                  } catch (err) {
                    console.log("ERR", err);
                    this.setState({ error: true });
                  }
                }}
              />
            </div>
            {this.state.saving && (
              <>
                <div
                  className={`circeSave ${this.state.saved ? "loadComplete" : ""} ${
                    this.state.error ? "loadError" : ""
                  }`}>
                  <div
                    className={`circeSave inner ${this.state.saved ? "loadComplete" : ""} ${
                      this.state.error ? "loadError" : ""
                    }`}></div>
                </div>
                <div
                  className={`circeSave ${this.state.saved ? "loadComplete" : ""} ${
                    this.state.error ? "loadError" : ""
                  }`}>
                  <div
                    className={`circle-loader ${this.state.saved ? "load-complete" : ""} ${
                      this.state.error ? "load-error" : ""
                    }`}>
                    <div
                      className="checkmark draw"
                      style={this.state.saved ? { display: "block" } : {}}
                    />
                    <div
                      className="cross draw"
                      style={this.state.error ? { display: "block" } : {}}
                    />
                  </div>
                  <div
                    className="errorMessageHolder"
                    style={this.state.error ? { display: "block" } : {}}>
                    <div className="message">You found an error</div>
                    <button
                      className="cleanup"
                      onClick={() => this.setState({ error: false, saving: false, saved: false })}>
                      Try again
                    </button>
                  </div>
                </div>
              </>
            )}
          </PopupBase>
        )}
      </AppContext.Consumer>
    );
  }
}
export default compose(
  graphql(CREATE_ACCOUNT, {
    name: "createAccount"
  }),
  withApollo
)(CreateAccount);
