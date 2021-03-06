import * as React from "react";
import gql from "graphql-tag";
import { Query } from "@apollo/client/react/components";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import { Checkbox } from "@vipfy-private/vipfy-ui-lib";

import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import UniversalLoginExecutor from "../../components/UniversalLoginExecutor";
import { LoginResult, SSO } from "../../interfaces";
import { CREATE_OWN_APP } from "../../mutations/products";
import LogoExtractor from "../../components/ssoconfig/LogoExtractor";
import fail_pic from "../../../images/sso_creation_fail.png";
import success_pic from "../../../images/sso_creation_success.png";
import loading_pic from "../../../images/sso_creation_loading.png";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import { fetchDepartmentsData } from "../../queries/departments";
import UniversalDropDownInput from "../../components/universalForms/universalDropdownInput";
import { concatName, getMyUnitId } from "../../common/functions";
import AddEmployeePersonalData from "../../components/manager/addEmployeePersonalData";
import EmployeePicture from "../../components/EmployeePicture";
import { createEncryptedLicenceKeyObject } from "../../common/licences";
import { FETCH_ALL_BOUGHTPLANS_LICENCES } from "../../queries/billing";

const FAILED_INTEGRATION = gql`
  mutation onFailedIntegration($data: SSOResult!) {
    failedIntegration(data: $data)
  }
`;

const CREATE_ORBIT = gql`
  mutation createOrbit($planid: ID!, $alias: String, $options: JSON!) {
    createOrbit(planid: $planid, alias: $alias, options: $options) {
      id
      alias
      plan: planid {
        id
        app: appid {
          id
        }
      }
    }
  }
`;

const CREATE_ACCOUNT = gql`
  mutation createAccount($orbitid: ID!, $alias: String, $logindata: JSON!) {
    createAccount(orbitid: $orbitid, alias: $alias, logindata: $logindata) {
      id
      alias
    }
  }
`;

const ASSIGN_ACCOUNT = gql`
  mutation assignAccount(
    $licenceid: ID!
    $userid: ID!
    $rights: LicenceRights
    $tags: [String]
    $starttime: Date
    $endtime: Date
    $keyfragment: JSON
  ) {
    assignAccount(
      licenceid: $licenceid
      userid: $userid
      rights: $rights
      tags: $tags
      starttime: $starttime
      endtime: $endtime
      keyfragment: $keyfragment
    )
  }
`;

const CHECK_EMPLOYEE_ORBIT = gql`
  mutation checkEmployeeOrbit($appid: ID!) {
    checkEmployeeOrbit(appid: $appid)
  }
`;

interface Props {
  closeFunction: Function;
  maxTime?: number;
  sso: SSO;
  fullmiddle?: boolean;
  userids?: number;
  inmanager?: boolean;
  failedIntegration: Function;
  createOwnApp: Function;
  createOrbit: Function;
  createAccount: Function;
  assignAccount: Function;
  client: any;
  isEmployee?: boolean;
  checkEmployeeOrbit: Function;
}

interface State {
  tooLong: boolean;
  saved: boolean;
  progress: number;
  success: boolean;
  error: string;
  ssoCheck: boolean;
  icon: File | null;
  color: string;
  receivedIcon: boolean;
  newid: number;
  orbit: string;
  alias: string;
  showAssign: boolean;
  showall: boolean;
  add: boolean;
  user: any;
  result: any;
  receivedData: boolean;
  private: boolean;
}

class SelfSaving extends React.Component<Props, State> {
  state = {
    tooLong: false,
    saved: false,
    progress: 0,
    success: false,
    error: "",
    ssoCheck: false,
    icon: null,
    color: "",
    receivedIcon: false,
    newid: 0,
    orbit: `${this.props.sso.name} (Integrated)` || "Integrated Account",
    alias: this.props.sso.email || "",
    showall: false,
    add: false,
    user: null,
    showAssign: true,
    result: null,
    receivedData: false,
    private: false
  };

  close(err = null) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.props.closeFunction(err);
  }

  saveAndMaybeAssign = async () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    const { sso } = this.props;
    sso.color = this.state.color;

    if (!sso.images && this.state.icon) {
      const [, a] = this.state.icon!.data.split(":");
      const [mime, b] = a.split(";");
      const [, iconDataEncoded] = b.split(",");

      // encoding is always base64. mime is assumed to be image/png, but other values
      // shouldn't be a problem

      // Node's Buffer behaves really weirdly. buf.buffer produces some string prefix
      // and buf.copy is only 3 bytes. So we use atob with some parsing instead
      const iconDataArray = new Uint8Array(
        atob(iconDataEncoded)
          .split("")
          .map(c => c.charCodeAt(0))
      );

      const iconFile = new File([iconDataArray], `${this.props.sso.name}-icon.png`, {
        type: mime
      });

      sso.images = [iconFile, iconFile];
    }

    try {
      const app = await this.props.createOwnApp({
        context: { hasUpload: true },
        variables: { ssoData: sso }
      });

      if (!this.props.isEmployee && this.state.showAssign) {
        try {
          const orbit = await this.props.createOrbit({
            variables: {
              planid: app.data.createOwnApp.planid,
              alias: this.state.orbit,
              options: { external: true, selfIntegrated: true }
            }
          });

          try {
            const logindata = await createEncryptedLicenceKeyObject(
              {
                username: this.props.sso.email,
                password: this.props.sso.password
              },
              null,
              this.props.client
            );

            const account = await this.props.createAccount({
              variables: {
                orbitid: orbit.data.createOrbit.id,
                alias: this.state.alias,
                logindata
              },
              refetchQueries: [
                {
                  query: FETCH_ALL_BOUGHTPLANS_LICENCES,
                  variables: {
                    appid: app.data.createOwnApp.appid
                  }
                }
              ]
            });

            try {
              await this.props.assignAccount({
                variables: {
                  licenceid: account.data.createAccount.id,
                  userid: this.state.user?.id,
                  rights: { view: true, use: true },
                  keyfragment: {}
                }
              });

              this.props.closeFunction({
                success: true,
                appid: app.data.createOwnApp.appid,
                planid: app.data.createOwnApp.planid,
                orbitid: orbit.data.createOrbit.id,
                accountid: account.data.createAccount.id
              });
            } catch (error) {
              console.error("ERROR Assigning Account", error);
              this.props.closeFunction(error);
            }
          } catch (error) {
            console.error("ERROR Creating Account", error);
            this.props.closeFunction(error);
          }
        } catch (error) {
          console.error("ERROR Creating Orbit", error);
          this.props.closeFunction(error);
        }
      }

      if (this.props.isEmployee) {
        try {
          const logindata = await createEncryptedLicenceKeyObject(
            {
              username: this.props.sso.email,
              password: this.props.sso.password
            },
            null,
            this.props.client
          );

          const employeeOrbit = await this.props.checkEmployeeOrbit({
            variables: {
              appid: app.data.createOwnApp.appid
            }
          });

          const options = { employeeIntegrated: true, private: true };

          const account = await this.props.createAccount({
            variables: {
              orbitid: employeeOrbit.data.checkEmployeeOrbit,
              alias: this.state.alias,
              logindata,
              options
            }
          });

          try {
            const userid = await getMyUnitId(this.props.client);

            await this.props.assignAccount({
              variables: {
                licenceid: account.data.createAccount.id,
                userid,
                rights: { view: true, use: true },
                keyfragment: {}
              }
            });

            this.props.closeFunction({
              success: true,
              appid: app.data.createOwnApp.appid,
              planid: app.data.createOwnApp.planid,
              orbitid: employeeOrbit.data.checkEmployeeOrbit,
              accountid: account.data.createAccount.id
            });
          } catch (error) {
            console.error("ERROR Assigning Account", error);
            this.props.closeFunction(error);
          }
        } catch (error) {
          console.error("ERROR EmployeeIntegrate", error);
          this.props.closeFunction(error);
        }
      }
    } catch (error) {
      console.error("ERROR", error);
      this.props.closeFunction(error);
    }
  };

  finishIntegration = async () => {
    if (this.state.receivedData && this.state.receivedIcon) {
      let squareImages = undefined;
      if (this.state.icon) {
        const [, a] = this.state.icon!.data.split(":");
        const [mime, b] = a.split(";");
        const [, iconDataEncoded] = b.split(",");

        // encoding is always base64. mime is assumed to be image/png, but other values
        // shouldn't be a problem

        // Node's Buffer behaves really weirdly. buf.buffer produces some string prefix
        // and buf.copy is only 3 bytes. So we use atob with some parsing instead
        const iconDataArray = new Uint8Array(
          atob(iconDataEncoded)
            .split("")
            .map(c => c.charCodeAt(0))
        );

        const iconFile = new File([iconDataArray], `${this.props.sso.name}-icon.png`, {
          type: mime
        });

        squareImages = [iconFile, iconFile];
      }
      if (
        this.state.result.loggedIn &&
        this.state.result.emailEntered &&
        this.state.result.passwordEntered
      ) {
        this.setState({ ssoCheck: true });
      } else {
        const moreInformation = this.state.showAssign
          ? {
              orbit: this.state.orbit,
              alias: this.state.alias,
              user: this.state.user?.id
            }
          : {};
        const res = await this.props.failedIntegration({
          context: { hasUpload: true },
          variables: {
            data: {
              ...this.props.sso,
              recaptcha: this.state.result.recaptcha,
              tries: this.state.result.tries,
              unloaded: this.state.result.unloaded,
              emailEntered: this.state.result.emailEntered,
              passwordEntered: this.state.result.passwordEntered,
              ...moreInformation,
              color: this.state.color || undefined,
              squareImages
            }
          }
        });
        const errorMessage =
          "Sorry, this seems to take additional time. Our support team will take a look.";

        this.setState({
          error: { error: errorMessage, appid: res.data.failedIntegration }
        });
      }
    }
  };

  render() {
    if (this.props.maxTime) {
      this.timeout = setTimeout(() => {
        if (!this.state.saved) {
          this.setState({ tooLong: true });
        }
      }, this.props.maxTime);
    }

    return (
      <PopupBase styles={{ maxWidth: "432px" }} nooutsideclose={true} fullmiddle={true}>
        <div className="popup-sso">
          {this.state.error || this.state.tooLong ? (
            <img className="status-pic" src={fail_pic} />
          ) : this.state.success ? (
            <img className="status-pic" src={success_pic} />
          ) : (
            <img className="status-pic" src={loading_pic} />
          )}
          {!this.props.isEmployee && (
            <div
              style={{
                marginTop: "24px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center"
              }}>
              <label className="switch">
                <input
                  onChange={() =>
                    this.setState(oldstate => {
                      return { ...oldstate, showAssign: !oldstate.showAssign };
                    })
                  }
                  checked={this.state.showAssign}
                  type="checkbox"
                />
                <span className="slider" />
              </label>
              <span style={{ marginLeft: "16px" }}>Directly assign the given account</span>
            </div>
          )}
          {!this.props.isEmployee && this.state.showAssign && (
            <>
              <span style={{ marginTop: "20px", marginBottom: "20px" }}>
                For this: We need some more information:
              </span>

              <UniversalTextInput
                width="100%"
                id="orbit"
                label="Orbit"
                startvalue={`${this.props.sso.name} (Integrated)`}
                livevalue={value => this.setState({ orbit: value })}
                style={{ marginTop: "24px" }}
              />

              <UniversalTextInput
                width="100%"
                id="alias"
                label="Account Alias"
                startvalue={this.props.sso.email}
                livevalue={value => this.setState({ alias: value })}
                style={{ marginTop: "24px" }}
              />

              <Query pollInterval={60 * 10 * 1000 + 1000} query={fetchDepartmentsData}>
                {({ loading, error = null, data }) => {
                  if (loading) {
                    return <div>Loading...</div>;
                  }

                  if (error) {
                    return <div>Error! {error.message}</div>;
                  }

                  const employees = data.fetchDepartmentsData[0].employees;

                  return (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "24px",
                          marginBottom: "24px",
                          position: "relative"
                        }}>
                        {this.state.user ? (
                          <div
                            style={{
                              width: "336px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between"
                            }}>
                            <div>
                              <EmployeePicture
                                employee={this.state.user}
                                size={24}
                                style={{
                                  lineHeight: "24px",
                                  fontSize: "13px",
                                  marginTop: "0px",
                                  marginLeft: "0px"
                                }}
                              />
                              <span style={{ lineHeight: "24px", marginLeft: "8px" }}>
                                {concatName(this.state.user)}
                              </span>
                            </div>
                            <i
                              className="fal fa-trash-alt editbutton"
                              onClick={() => this.setState({ user: null })}
                            />
                          </div>
                        ) : (
                          <UniversalDropDownInput
                            id={`employee-search-${this.state.time}`}
                            label="User"
                            width="336px"
                            options={employees}
                            resetPossible={true}
                            codeFunction={employee => employee.id}
                            nameFunction={employee => concatName(employee)}
                            renderOption={(possibleValues, i, click, value) => (
                              <div
                                key={`searchResult-${i}`}
                                className="searchResult"
                                onClick={() => click(possibleValues[i])}>
                                <span className="resultHighlight">
                                  {concatName(possibleValues[i]).substring(0, value.length)}
                                </span>
                                <span>{concatName(possibleValues[i]).substring(value.length)}</span>
                              </div>
                            )}
                            alternativeText={inputelement => (
                              <span
                                className="inputInsideButton"
                                style={{
                                  width: "auto",
                                  backgroundColor: "transparent",
                                  cursor: "text"
                                }}>
                                <span
                                  onClick={() => inputelement.focus()}
                                  style={{ marginRight: "4px", fontSize: "12px" }}>
                                  Start typing or
                                </span>

                                <UniversalButton
                                  type="low"
                                  tabIndex={-1}
                                  onClick={() => this.setState({ showall: true })}
                                  label="show all"
                                  customStyles={{ lineHeight: "24px" }}
                                />
                              </span>
                            )}
                            startvalue=""
                            livecode={c => this.setState({ user: employees.find(a => a.id == c) })}
                            fewResults={true}
                          />
                        )}
                      </div>
                      {this.state.showall && (
                        <PopupBase
                          nooutsideclose={true}
                          small={true}
                          close={() => this.setState({ showall: false })}
                          buttonStyles={{ justifyContent: "space-between" }}>
                          <h1 style={{ marginBottom: "16px" }}>All Employees</h1>

                          {employees.map(employee => (
                            <div className="listingDiv" key={employee.id}>
                              <UniversalButton
                                type="low"
                                label={concatName(employee)}
                                onClick={() => {
                                  this.setState({ showall: false });
                                  this.setState({ user: employee });
                                }}
                              />
                            </div>
                          ))}

                          <UniversalButton type="low" label="Cancel" closingPopup={true} />
                        </PopupBase>
                      )}
                      {this.state.add && (
                        <PopupBase
                          small={true}
                          close={() => this.setState({ add: false })}
                          nooutsideclose={true}
                          additionalclassName="formPopup deletePopup">
                          <AddEmployeePersonalData
                            continue={data => {
                              this.setState({ add: false, user: data.employee });
                            }}
                            close={() => {
                              this.setState({ add: false });
                            }}
                            addpersonal={{ name: this.state.value }}
                            isadmin={true}
                          />
                        </PopupBase>
                      )}
                    </>
                  );
                }}
              </Query>
            </>
          )}

          {this.state.tooLong ? (
            <>
              <div style={{ marginBottom: "24px" }}>
                This operation takes longer than expected. It will continue in the background and we
                will inform you when it has finished.
              </div>
              <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
            </>
          ) : this.state.error ? (
            <>
              <h3 style={{ marginBottom: "24px" }}>{this.state.error.error}</h3>
              <UniversalButton type="low" label="OK" onClick={() => this.close("error")} />
            </>
          ) : this.state.ssoCheck ? (
            <>
              <h3 style={{ marginBottom: "24px" }}>
                <span>Congratulations!</span>
                <span>The integration is possible.</span>
              </h3>

              {this.props.isEmployee && (
                <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                  <span
                    style={{ lineHeight: "24px", width: "84px" }}
                    title="An administator can neither edit nor access a private account from their account. It is still possible for them to reset your password and then log in to your account directly.">
                    Private:
                  </span>
                  <Checkbox
                    title="Mark as private"
                    name="checkbox_mark_account_private"
                    handleChange={e => this.setState({ private: e })}
                  />
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <UniversalButton type="low" label="Cancel" onClick={() => this.close()} />
                <UniversalButton
                  type="high"
                  label="Integrate"
                  disabled={
                    !this.props.isEmployee &&
                    (!this.state.orbit || !this.state.alias || !this.state.user)
                  }
                  onClick={() => this.saveAndMaybeAssign()}
                />
              </div>
            </>
          ) : (
            <>
              <div className="hide-sso-webview">
                {!this.state.receivedData && (
                  <UniversalLoginExecutor
                    loginUrl={this.props.sso.loginurl!}
                    username={this.props.sso!.email!}
                    password={this.props.sso.password!}
                    partition={`self-sso-${this.props.sso.name}`}
                    timeout={40000}
                    takeScreenshot={false}
                    setResult={async (result: LoginResult) => {
                      await this.setState(oldstate => {
                        if (!oldstate.receivedData) {
                          return { ...oldstate, result, receivedData: true };
                        } else {
                          return oldstate;
                        }
                      });
                      this.finishIntegration();
                    }}
                    progress={progress => {
                      if (progress < 1) {
                        this.setState({ progress: progress * 100 });
                      }
                    }}
                  />
                )}

                {!this.state.receivedIcon && (
                  <LogoExtractor
                    url={this.props.sso.loginurl!}
                    setResult={async (icon, color) => {
                      await this.setState(oldstate => {
                        if (!oldstate.receivedIcon) {
                          return { ...oldstate, receivedIcon: true, icon, color };
                        } else {
                          return oldstate;
                        }
                      });
                      this.finishIntegration();
                    }}
                  />
                )}
              </div>

              <h3 style={{ marginTop: "20px", marginBottom: "20px" }}>
                <span>Just a moment, please.</span>
                <span>We are verifying the implementation.</span>
              </h3>
              <progress max="100" value={this.state.progress} style={{ marginBottom: "24px" }} />
              <UniversalButton type="high" label="Cancel" onClick={() => this.close()} />
            </>
          )}
        </div>
      </PopupBase>
    );
  }
}

export default compose(
  graphql(FAILED_INTEGRATION, {
    name: "failedIntegration"
  }),
  graphql(CREATE_OWN_APP, { name: "createOwnApp" }),
  graphql(CREATE_ORBIT, { name: "createOrbit" }),
  graphql(CREATE_ACCOUNT, { name: "createAccount" }),
  graphql(ASSIGN_ACCOUNT, { name: "assignAccount" }),
  graphql(CHECK_EMPLOYEE_ORBIT, {
    name: "checkEmployeeOrbit"
  }),
  withApollo
)(SelfSaving);
