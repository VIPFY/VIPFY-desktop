import * as React from "react";
import UniversalLoginExecutor from "../UniversalLoginExecutor";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import {
  createEncryptedLicenceKeyObject,
  createLicenceKeyFragmentForUser
} from "../../common/licences";
import { FETCH_ALL_BOUGHTPLANS_LICENCES } from "../../queries/billing";
import { fetchUserLicences } from "../../queries/departments";
import { getMyUnitId } from "../../common/functions";

interface Props {
  confirmIntegration: Function;
  checkEmployeeOrbit: Function;
  createAccount: Function;
  client: any;
  assignAccount: Function;
  close: Function;
  moveTo: Function;
  data: any;
  createOrbit: Function;
  isadmin: boolean;
  sendFailedIntegrationRequest: Function;
}
interface State {
  step: number;
  tryuniversal: boolean;
  finishedOnce: boolean;
  noError: boolean;
}

const CONFIRM_INTEGRATION = gql`
  mutation confirmIntegration($data: JSON!) {
    confirmIntegration(data: $data)
  }
`;

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

const SEND_FAILED_INTEGRATION_REQUEST = gql`
  mutation sendFailedIntegrationRequest($appid: ID!) {
    sendFailedIntegrationRequest(appid: $appid)
  }
`;

const CREATE_ORBIT = gql`
  mutation createOrbit($planid: ID!, $alias: String, $options: JSON!) {
    createOrbit(planid: $planid, alias: $alias, options: $options) {
      id
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
class RequestedIntegrationNotification extends React.Component<Props, State> {
  state = { step: 0, tryuniversal: true, finishedOnce: false, noError: false };

  finishIntegration = async universal => {
    const script = [];
    let loginValues: Object = {};
    let loginFields = [];
    let username = null;
    let lastSecurity = false;
    this.props.data.trackedPlan.forEach(i => {
      let fillkey = undefined;
      if (i.operation == "waitandfill") {
        fillkey = i.args.fillkey == "text" ? "username" : i.args.fillkey;
        loginValues[fillkey] = i.args.value;
        loginFields.push({
          fillkey,
          isPassword: fillkey == "password" ? true : undefined
        });
        if (i.args.fillkey == "username" || i.args.fillkey == "email" || i.args.fillkey == "text") {
          username = i.args.value;
        }
      }

      script.push({
        operation: i.operation,
        args: {
          fillkey,
          selector: i.args.selector,
          isSecurity: lastSecurity || i.args.isSecurity ? true : undefined
        }
      });

      if (i.args.isSecurity) {
        script[script.length - 2].args.isSecurity = true;
        lastSecurity = true;
      } else {
        lastSecurity = false;
      }
    });

    if (universal) {
      await this.props.confirmIntegration({
        variables: {
          data: {
            loginUrl: this.props.data.startUrl,
            options: { type: "universalLogin", noError: true, deleteCookies: true, loginFields },
            appId: this.props.data.appId,
            manager: this.props.data.manager,
            login: loginValues
          }
        }
      });
    } else {
      await this.props.confirmIntegration({
        variables: {
          data: {
            loginUrl: this.props.data.startUrl,
            internalData: { execute: [{ key: "Login", script }] },
            options: {
              execute: script,
              type: "execute",
              deleteCookies: true,
              continueExecute: true,
              loginFields
            },
            appId: this.props.data.appId,
            manager: this.props.data.manager,
            login: loginValues
          }
        }
      });
    }
    const logindata = await createEncryptedLicenceKeyObject(
      loginValues,
      undefined,
      this.props.client
    );
    const options = {};

    let refetchQueries = {};

    if (this.props.isadmin) {
      refetchQueries = {
        refetchQueries: [
          {
            query: FETCH_ALL_BOUGHTPLANS_LICENCES,
            variables: {
              appid: this.props.data.appId
            }
          }
        ]
      };
    }

    let orbitid = undefined;
    if (this.props.data.manager) {
      const employeeOrbit = await this.props.checkEmployeeOrbit({
        variables: {
          appid: this.props.data.appId
        }
      });
      orbitid = employeeOrbit.data.checkEmployeeOrbit;
      options.employeeIntegrated = true;
      options.private = true;
    } else {
      //create normal Orbit
      const normalOrbit = await this.props.createOrbit({
        variables: {
          planid: this.props.data.planId,
          alias: `${this.props.data.serviceName} (Integrated)`,
          options: {}
        }
      });
      orbitid = normalOrbit.data.createOrbit.id;
    }

    const account = await this.props.createAccount({
      variables: {
        orbitid: orbitid,
        alias: username || `${this.props.data.serviceName} Account 1`,
        logindata,
        options
      },
      ...refetchQueries
    });

    const unitid = await getMyUnitId(this.props.client);

    const keyfragment = await createLicenceKeyFragmentForUser(
      account.data.createAccount.id,
      unitid,
      this.props.client
    );
    await this.props.assignAccount({
      variables: {
        licenceid: account.data.createAccount.id,
        userid: unitid,
        rights: { view: true, use: true },
        keyfragment
      },
      refetchQueries: [
        {
          query: fetchUserLicences,
          variables: { unitid }
        }
      ]
    });

    if (this.props.isadmin) {
      this.setState({
        step: 1
      });
    } else {
      this.props.close();
    }
  };
  render() {
    if (this.state.step == 0 && this.props.data.trackedPlan) {
      let domain = undefined;
      let username = undefined;
      let password = undefined;
      this.props.data.trackedPlan.forEach(p => {
        if (p.operation == "waitandfill" && !p.args.isSecurity) {
          if (p.args.fillkey == "password") {
            password = p.args.value;
          } else if (p.args.fillkey == "domain") {
            domain = p.args.value;
          } else if (p.args.value) {
            username = p.args.value;
          } else {
            p.operation = "click";
          }
        }
      });

      return (
        <div>
          <div>We are verifing your Integration of {this.props.data.serviceName}</div>
          <div style={{ fontSize: "16px", textAlign: "center", marginTop: "8px" }}>
            <i className="fal fa-spin fa-spinner"></i>
          </div>
          {this.state.needSecurityCode && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <div>
                  Please provide the new {this.state.needSecurityCode} sent to you by the service
                  provider.
                </div>
                <span style={{ lineHeight: "24px", width: "100%" }}>
                  <UniversalTextInput
                    id={`account-${this.state.needSecurityCode}`}
                    width="100%"
                    livevalue={v => this.setState({ securityCode: v })}
                    smallTextField={true}
                  />
                </span>
              </div>
              <UniversalButton
                label="continue"
                type="high"
                onClick={() => this.setState({ needSecurityCode: null })}
              />
            </div>
          )}
          <div
            style={{
              height: "1px",
              width: "1px",
              overflow: "hidden"
            }}>
            <UniversalLoginExecutor
              key={`RequestedIntegration-${this.props.notificationId}-${this.state.tryuniversal}`}
              loginUrl={this.props.data.startUrl}
              username={username}
              password={password}
              domain={domain}
              timeout={20000}
              takeScreenshot={false}
              partition={`RequestedIntegration-${this.props.notificationId}-${this.state.tryuniversal}`}
              //className={cssClassWeb}
              showLoadingScreen={b => this.setState({ showLoadingScreen: b })}
              setResult={async ({
                loggedIn,
                error,
                direct,
                emailEntered,
                passwordEntered,
                executeEnd,
                currentUrl,
                timedOut
              }) => {
                if (executeEnd) {
                  setTimeout(
                    async () => await this.finishIntegration(this.state.tryuniversal),
                    5000
                  );
                }
                if (!this.state.tryuniversal && timedOut) {
                  //Forward to support
                  await this.props.sendFailedIntegrationRequest({
                    variables: { appid: this.props.data.appId }
                  });
                  this.setState({ step: 2 });
                }
                if (this.state.tryuniversal && timedOut) {
                  this.setState({ tryuniversal: false });
                }
                if (
                  this.state.tryuniversal &&
                  !this.state.finishedOnce &&
                  loggedIn &&
                  !error &&
                  emailEntered &&
                  passwordEntered
                ) {
                  this.setState({ finishedOnce: true });
                  setTimeout(async () => await this.finishIntegration(true), 5000);
                }
                /*if (loggedIn) {
                this.hideLoadingScreen();

                if (emailEntered && passwordEntered && !direct) {
                  await this.props.updateLicenceSpeed({
                    variables: {
                      licenceid: this.props.licenceID,
                      speed: this.state.loginspeed,
                      working: true
                    }
                  });
                }
              }

              if (error) {
                if (this.state.loginspeed == 1) {
                  this.showErrorScreen();
                  await this.props.updateLicenceSpeed({
                    variables: {
                      licenceid: this.props.licenceID,
                      speed: this.state.loginspeed,
                      oldspeed: this.state.oldspeed,
                      working: false
                    }
                  });
                  this.setState({
                    progress: 1,
                    error:
                      "Sorry, login was not possible. Please go back to the Dashboard and retry. Contact support if the problem persists.",
                    errorshowed: true
                  });
                } else {
                  await this.props.updateLicenceSpeed({
                    variables: {
                      licenceid: this.props.licenceID,
                      speed: this.state.loginspeed,
                      working: false
                    }
                  });
                  this.setState(s => {
                    return { loginspeed: 1, oldspeed: s.loginspeed };
                  });
                }
              }*/
                // console.log("PROPS", this.props, currentUrl, timedOut);
                // console.log(loggedIn, error, direct, emailEntered, passwordEntered);
              }}
              //progress={progress => this.setState({ progress })}
              //speed={this.state.loginspeed || 1}
              /*style={
              context.isActive
                ? { height: "calc(100vh - 32px - 40px)" }
                : { height: "calc(100vh - 32px)" }
            }*/
              /*interactionHappenedCallback={() => {
              let interactions = this.state.interactions;
              interactions[this.state.planId] = new Date();
              this.setState({ interactions });
            }}*/
              execute={!this.state.tryuniversal ? this.props.data.trackedPlan : undefined}
              noError={true}
              //individualShow={this.state.options.individualShow}
              //noUrlCheck={this.state.options.noUrlCheck}
              //individualNotShow={this.state.options.individualNotShow}
              //addWebview={this.props.addWebview}
              //licenceID={this.props.licenceID}
              //setViewTitle={title =>
              //  this.props.setViewTitle &&
              //  this.props.setViewTitle(title, this.props.viewID, this.props.licenceID)
              //}
              //loggedIn={this.props.loggedIn}
              //deleteCookies={this.state.options.deleteCookies}
              continueExecute={!this.state.tryuniversal}
              needSecurityCode={async type => {
                await this.setState({ needSecurityCode: type });
                let checkforCode = null;
                const codeProvided = new Promise((resolve, reject) => {
                  checkforCode = setInterval(() => {
                    if (this.state.needSecurityCode === null) {
                      resolve();
                    }
                  }, 100);
                });
                await codeProvided;
                if (checkforCode) {
                  clearInterval(checkforCode);
                }
                return this.state.securityCode;
              }}
            />
          </div>
        </div>
      );
    } else if (this.state.step == 1) {
      console.log("NOT STEP = 0", this.state);
      return (
        <div>
          <div style={{ textAlign: "center", marginBottom: "8px", marginTop: "8px" }}>
            <i className="fal fa-smile"></i>
            <div>Integration successful!</div>
          </div>
          <UniversalButton
            type="high"
            label="Manage Service"
            onClick={() => {
              this.props.moveTo(`lmanager/${this.props.data.appId}`);
              this.props.close();
            }}
          />
        </div>
      );
    } else {
      return (
        <div>
          <div style={{ textAlign: "center", marginBottom: "8px", marginTop: "8px" }}>
            <i className="fal fa-frown"></i>
            <div>Sorry that didn't work.</div>
            <div>We already informed our support.</div>
          </div>
          <UniversalButton
            type="high"
            label="Ok"
            onClick={() => {
              this.props.close();
            }}
          />
        </div>
      );
    }
  }
}
export default compose(
  graphql(CONFIRM_INTEGRATION, { name: "confirmIntegration" }),
  graphql(CREATE_ACCOUNT, {
    name: "createAccount"
  }),
  graphql(CHECK_EMPLOYEE_ORBIT, {
    name: "checkEmployeeOrbit"
  }),
  graphql(ASSIGN_ACCOUNT, {
    name: "assignAccount"
  }),
  graphql(CREATE_ORBIT, {
    name: "createOrbit"
  }),
  graphql(SEND_FAILED_INTEGRATION_REQUEST, {
    name: "sendFailedIntegrationRequest"
  }),
  withApollo
)(RequestedIntegrationNotification);
