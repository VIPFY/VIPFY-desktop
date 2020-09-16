import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import UniversalTextInput from "../../../../components/universalForms/universalTextInput";
import UniversalCheckbox from "../../../../components/universalForms/universalCheckbox";
import { FETCH_ALL_BOUGHTPLANS_LICENCES } from "../../../../queries/billing";
import { AppContext } from "../../../../common/functions";
import { createEncryptedLicenceKeyObject } from "../../../../common/licences";

interface Props {
  orbit: any;
  close: Function;
  alias: string | null;
  createAccount: Function;
  client: any;
  checkEmployeeOrbit: Function;
}

interface State {
  email: string | null;
  password: string | null;
  alias: string | null;
  aliastouched: boolean;
  saving: boolean;
  saved: boolean;
  error: boolean;
  protocol: string | null;
  loginurl: string | null;
  changedl: boolean;
  selfhosting: boolean;
}

const CREATE_ACCOUNT = gql`
  mutation createAccount($orbitid: ID!, $alias: String, $logindata: JSON!, $options: JSON) {
    createAccount(orbitid: $orbitid, alias: $alias, logindata: $logindata, options: $options) {
      id
      alias
    }
  }
`;

const CHECK_EMPLOYEE_ORBIT = gql`
  mutation checkEmployeeOrbit($appid: ID!) {
    checkEmployeeOrbit(appid: $appid)
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
    error: false,
    protocol: null,
    loginurl: null,
    changedl: false,
    selfhosting: false
  };

  render() {
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

            {this.props.orbit.needssubdomain && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "24px",
                  marginTop: "28px",
                  position: "relative"
                }}>
                <span style={{ lineHeight: "24px", width: "84px" }}>
                  <span>Domain:</span>
                  {this.props.orbit.options.selfhosting && (
                    <div style={{ alignItems: "center", display: "flex" }}>
                      <UniversalCheckbox
                        name="Selfhosting"
                        startingvalue={false}
                        liveValue={e => this.setState({ selfhosting: e, changedl: true })}
                        style={{ float: "left" }}
                      />
                      <span style={{ fontSize: "10px", lineHeight: "18px", marginLeft: "4px" }}>
                        Selfhosting
                      </span>
                    </div>
                  )}
                </span>
                <UniversalTextInput
                  width="300px"
                  id="domain"
                  className="scrollable"
                  inputStyles={{ minWidth: "100px" }}
                  startvalue={this.state.loginurl}
                  livevalue={value => {
                    let domain = value;
                    let protocol = undefined;
                    if (value.startsWith("https://") || value.startsWith("http://")) {
                      protocol = value.substring(0, value.search(/:\/\/{1}/) + 3);
                      domain = value.substring(value.search(/:\/\/{1}/) + 3);
                    } else {
                      protocol = this.state.protocol;
                    }
                    if (value != this.state.loginurl && value != "") {
                      this.setState({ loginurl: domain, changedl: true, protocol });
                    } else {
                      this.setState({ loginurl: domain, changedl: false, protocol });
                    }
                  }}
                  modifyValue={value => {
                    let deletedPrefix = value;
                    if (value.startsWith("https://") || value.startsWith("http://")) {
                      deletedPrefix = value.substring(value.search(/:\/\/{1}/) + 3);
                    }
                    let deletedSuffix = deletedPrefix;
                    if (
                      this.props.orbit &&
                      this.props.orbit.options &&
                      this.props.orbit.options.afterdomain &&
                      deletedPrefix.endsWith(this.props.orbit.options.afterdomain)
                    ) {
                      deletedSuffix = deletedPrefix.substring(
                        0,
                        deletedPrefix.indexOf(this.props.orbit.options.afterdomain)
                      );
                    }
                    return deletedSuffix;
                  }}
                  prefix={
                    this.state.selfhosting ? (
                      <select
                        className="universalTextInput"
                        style={{ width: "75px" }}
                        value={this.state.protocol}
                        onChange={e => this.setState({ protocol: e.target.value, changedl: true })}>
                        <option value="http://" key="http://">
                          http://
                        </option>
                        <option value="https://" key="https://">
                          https://
                        </option>
                      </select>
                    ) : (
                        this.props.orbit.options.predomain
                      )
                  }
                  suffix={this.state.selfhosting ? undefined : this.props.orbit.options.afterdomain}
                />
              </div>
            )}

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

            {this.props.orbit.id == "employeeIntegrated" && (
              <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                <span
                  style={{ lineHeight: "24px", width: "84px" }}
                  title="An administator can't edit nor access a private account from his account. It is still possible for him to reset your password and than login in into your account directly.">
                  Private:
                </span>
                <UniversalCheckbox
                  name="private"
                  startingvalue={false}
                  liveValue={e => this.setState({ private: e })}
                />
              </div>
            )}
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
                disabled={
                  !(
                    this.state.email &&
                    this.state.password &&
                    this.state.alias &&
                    (!this.props.orbit.needssubdomain || this.state.changedl)
                  )
                }
                onClick={async () => {
                  this.setState({ saving: true });
                  try {
                    const unencryptedLoginData = {
                      username: this.state.email,
                      password: this.state.password
                    };
                    const logindata = await createEncryptedLicenceKeyObject(
                      unencryptedLoginData,
                      undefined,
                      this.props.client
                    );
                    const options = {};
                    let refetchQueries = {
                      refetchQueries: [
                        {
                          query: FETCH_ALL_BOUGHTPLANS_LICENCES,
                          variables: {
                            appid:
                              this.props.orbit.appid ||
                              (this.props.orbit.plan
                                ? this.props.orbit.plan.app.id
                                : this.props.orbit.planid.appid.id)
                          }
                        }
                      ]
                    };
                    if (this.props.orbit.needssubdomain) {
                      if (this.state.selfhosting) {
                        logindata.loginurl = `${this.state.protocol}${this.state.loginurl}`;

                        options.loginurl = `${this.state.protocol}${this.state.loginurl}`;
                        options.selfhosting = true;
                      } else {
                        logindata.loginurl = `${this.props.orbit.options.predomain || ""}${
                          this.state.loginurl
                          }${this.props.orbit.options.afterdomain || ""}`;

                        options.loginurl = `${this.props.orbit.options.predomain || ""}${
                          this.state.loginurl
                          }${this.props.orbit.options.afterdomain || ""}`;
                      }
                    }
                    let employeeOrbitid = undefined;
                    if (this.props.orbit.id == "employeeIntegrated") {
                      const employeeOrbit = await this.props.checkEmployeeOrbit({
                        variables: {
                          appid: this.props.orbit.appid
                        }
                      });
                      employeeOrbitid = employeeOrbit.data.checkEmployeeOrbit;
                      options.employeeIntegrated = true;
                      options.private = this.state.private || undefined;

                      refetchQueries = {};
                    }

                    const account = await this.props.createAccount({
                      variables: {
                        orbitid: employeeOrbitid || this.props.orbit.id,
                        alias: this.state.alias,
                        logindata,
                        options
                      },
                      ...refetchQueries
                    });
                    this.setState({ saved: true });
                    setTimeout(
                      () =>
                        this.props.close({
                          ...account.data.createAccount,
                          new: true,
                          unencryptedLoginData
                        }),
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
  graphql(CHECK_EMPLOYEE_ORBIT, {
    name: "checkEmployeeOrbit"
  }),
  withApollo
)(CreateAccount);
