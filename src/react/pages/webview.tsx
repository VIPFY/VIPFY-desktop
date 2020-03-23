import * as React from "react";
import { parse } from "url";
import { withApollo, graphql } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";

import LoadingDiv from "../components/LoadingDiv";
import UniversalLoginExecutor from "../components/UniversalLoginExecutor";
import HeaderNotificationContext from "../components/notifications/headerNotificationContext";
import { decryptLicenceKey } from "../common/passwords";
import PopupBase from "../popups/universalPopups/popupBase";
import UniversalButton from "../components/universalButtons/universalButton";

const LOG_SSO_ERROR = gql`
  mutation onLogSSOError($data: JSON!) {
    logSSOError(eventdata: $data)
  }
`;

const UPDATE_LICENCE_SPEED = gql`
  mutation updateLicenceSpeed($licenceid: ID!, $speed: Int!, $working: Boolean!) {
    updateLicenceSpeed(licenceid: $licenceid, speed: $speed, working: $working)
  }
`;

export type WebViewState = {
  setUrl: string;
  currentUrl: string;
  showLoadingScreen: boolean;
  t: number;
  licenceId: string;
  accountId: string;
  previousLicenceId: string;
  unitId: string;
  interactions: Date[];
  intervalId: Timer | null;
  intervalId2: Timer | null;
  timeSpent: number[];
  options: any;
  appid: number;
  error: string | null;
  errorshowed: boolean;
  progress?: number;
  loginspeed: number;
  errorScreen: boolean;
  oldspeed: number | undefined;
  key: any;
  errorRecheck: boolean;
};

export type WebViewProps = {
  app: number;
  licenceID: string;
  client: ApolloClient;
  chatOpen: boolean;
  sidebBarOpen: boolean;
  setViewTitle: Function;
  viewID: number;
  logError: Function;
  updateLicenceSpeed: Function;
  addWebview: Function;
  loggedIn: Boolean;
};

// TODO: webpreferences="contextIsolation" would be nice, see https://github.com/electron-userland/electron-compile/issues/292 for blocker
// TODO: move TODO page to web so webSecurity=no is no longer nessesary

export class Webview extends React.Component<WebViewProps, WebViewState> {
  static defaultProps = { app: -1 };

  state: WebViewState = {
    setUrl: "",
    currentUrl: "",
    showLoadingScreen: true,
    t: performance.now(),
    licenceId: this.props.licenceID,
    previousLicenceId: "",
    unitId: "",
    interactions: [],
    intervalId: null,
    intervalId2: null,
    timeSpent: [],
    options: {},
    appid: -1,
    error: null,
    errorshowed: false,
    progress: undefined,
    loginspeed: 10,
    errorScreen: false,
    oldspeed: undefined,
    key: null,
    errorRecheck: false,
    accountId: ""
  };

  static getDerivedStateFromProps(
    nextProps: WebViewProps,
    prevState: WebViewState
  ): WebViewState | null {
    if (nextProps.licenceID !== prevState.licenceId) {
      return {
        ...prevState,
        previousLicenceId: prevState.licenceId,
        licenceId: nextProps.licenceID,
        showLoadingScreen: true,
        progress: undefined
      };
    } else {
      return prevState;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props;
    let update = false;
    Object.keys(this.props).forEach(function(key) {
      if (props[key] == nextProps[key]) {
        //console.log("Same", key, props[key]);
      } else {
        //console.log("WEBVIEW DIFFERENT PROPS", key, props[key], nextProps[key]);
        update = true;
      }
    });
    const state = this.state;
    Object.keys(this.state).forEach(function(key) {
      if (state[key] == nextState[key]) {
        //console.log("Same", key, props[key]);
      } else {
        //console.log("WEBVIEW DIFFERENT STATE", key, state[key], nextState[key]);
        update = true;
      }
    });
    return update;
  }

  componentDidMount() {
    let intervalId = setInterval(() => this.timer1m(), 60000);
    let intervalId2 = setInterval(() => this.sendTimeSpent(), 600000);
    this.setState({ intervalId, intervalId2 });
    if (this.state.previousLicenceId !== this.state.licenceId) {
      this.setState({
        previousLicenceId: this.state.licenceId
      });
    }
    // see https://github.com/reactjs/rfcs/issues/26 for context why we wait until after mount
    this.switchApp();
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
    clearInterval(this.state.intervalId2);
    this.setState({ intervalId: null, intervalId2: null });
    this.sendTimeSpent();
  }

  async componentDidUpdate(prevProps: WebViewProps, prevState: WebViewState) {
    if (this.state.previousLicenceId !== this.state.licenceId) {
      await this.setState({
        previousLicenceId: this.state.licenceId
      });

      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      this.switchApp();
    }
  }
  timer1m = () => {
    const now = new Date();
    let timeSpent = this.state.timeSpent;
    for (let licenceId in this.state.interactions) {
      const lastInteraction = this.state.interactions[licenceId];
      if (now - lastInteraction < 1000 * 60 * 5) {
        if (!timeSpent[licenceId]) {
          timeSpent[licenceId] = 0;
        }
        timeSpent[licenceId] += 1;
      }
    }
    this.setState({ timeSpent });
  };

  sendTimeSpent = (newTimeSpent?: number[]) => {
    if (!newTimeSpent) {
      newTimeSpent = [];
    }
    let timeSpent = this.state.timeSpent;
    this.setState({ timeSpent: newTimeSpent });
    for (let licenceId in timeSpent) {
      const minutes = timeSpent[licenceId] + 1;
      // no need to await this, let apollo do this whenever
      this.props.client.mutate({
        mutation: gql`
          mutation trackMinutesSpent($licenceid: ID!, $minutes: Int!) {
            trackMinutesSpent(assignmentid: $licenceid, minutes: $minutes) {
              ok
            }
          }
        `,
        variables: { licenceid: this.state.licenceId, minutes: minutes }
      });
    }
  };

  private async switchApp(): Promise<void> {
    const timeSpent: number[] = [];
    timeSpent[this.state.licenceId] = 0;

    this.sendTimeSpent(timeSpent);
    let result = await this.props.client.query({
      query: gql`
      {
        fetchLicenceAssignment(assignmentid: "${this.state.licenceId}") {
          id
          agreed
          disabled
          key
          options
          accountid
          boughtPlan: boughtplanid {
            id
            key
            plan: planid {
              id
              app: appid {
                id,
                loginurl
                options
                name
              }
            }
          }
          unit: unitid {
            id
          }
        }
      }
      `,
      fetchPolicy: "network-only"
    });
    let licence = result.data.fetchLicenceAssignment;
    console.log("LICENCE", licence);
    if (!licence) {
      return;
    }
    if (licence && licence.disabled) {
      window.alert("This licence is disabled, you cannot use it");
    }

    let key = await decryptLicenceKey(this.props.client, licence);
    let loginurl = licence.boughtPlan.plan.app.loginurl;
    if (licence.boughtPlan.key && licence.boughtPlan.key.domain) {
      loginurl = licence.boughtPlan.key.domain;
    }
    if (key && key.loginurl) {
      loginurl = key.loginurl;
    }
    let optionsobject = Object.assign({}, licence.boughtPlan.plan.app.options);
    Object.assign(optionsobject, licence.options);
    this.setState({
      setUrl: loginurl,
      unitId: licence.unit.id,
      options: optionsobject,
      loginspeed: optionsobject.loginspeed
        ? !optionsobject.loginfailed || optionsobject.loginspeed + 1 < optionsobject.loginfailed
          ? optionsobject.loginspeed + 1
          : optionsobject.loginspeed
        : 10,
      appid: licence.boughtPlan.plan.app.id,
      key: { ...key, domain: licence.boughtPlan.key.domain },
      oldspeed: undefined,
      progress: undefined,
      accountId: licence.accountid
    });
  }

  hideLoadingScreen(): void {
    this.setState({ showLoadingScreen: false });
  }

  showErrorScreen(): void {
    this.setState({ errorScreen: true });
  }

  showLoadingScreen(): void {
    this.setState({
      showLoadingScreen: true,
      t: performance.now()
    });
  }

  onNewWindow(e): void {
    //if webview tries to open new window, open it in default browser
    //TODO: probably needs more fine grained control for cases where new window should stay logged in
    const protocol = parse(e.url).protocol;
    if (protocol === "http:" || protocol === "https:") {
      //  shell.openExternal(e.url);

      //TODO HISTORY
      //this.props.history.push(`/area/app/${this.props.licenceID}/${encodeURIComponent(e.url)}`);

      if (e.url.indexOf("wchat") == -1) {
        this.setState({ currentUrl: e.url });
      }
    }
  }

  waitforRecheck() {
    setTimeout(() => this.setState({ errorRecheck: true }), 5000);
  }
  render() {
    let cssClass = "marginLeft";
    if (this.props.chatOpen) {
      cssClass += " chat-open";
    }
    if (this.props.sidebarOpen) {
      cssClass += " sidebar-open";
    }
    let cssClassWeb = "newMainPosition";
    if (this.props.chatOpen) {
      cssClass += " chat-open";
    }
    if (this.props.sidebarOpen) {
      cssClass += " sidebar-open";
    }

    if (this.props.plain) {
      cssClass = "";
    }
    return (
      <HeaderNotificationContext.Consumer>
        {context => {
          return (
            <div className={cssClass} id={`webview-${this.props.viewID}`}>
              {this.state.showLoadingScreen && (
                <LoadingDiv
                  progress={this.state.progress}
                  style={
                    context.isActive
                      ? { height: "calc(100vh - 32px - 40px - 1px)" }
                      : { height: "calc(100vh - 32px - 1px)" }
                    //{ height: "100px" }
                  }
                />
              )}

              {this.state.options.type == "universalLogin" ||
              this.state.options.type == "execute" ? (
                <UniversalLoginExecutor
                  key={`${this.state.setUrl}-${this.state.loginspeed}`}
                  //keylog={`${this.state.setUrl}-${this.state.loginspeed}`}
                  loginUrl={this.props.url || this.state.setUrl}
                  username={this.state.key.email || this.state.key.username}
                  password={this.state.key.password}
                  domain={this.state.key.domain}
                  timeout={60000}
                  takeScreenshot={false}
                  partition={`service-${this.state.licenceId}`}
                  className={cssClassWeb}
                  showLoadingScreen={b => this.setState({ showLoadingScreen: b })}
                  setResult={async ({
                    loggedin,
                    errorin,
                    emailEntered,
                    passwordEntered,
                    direct
                  }) => {
                    if (loggedin && direct) {
                      this.hideLoadingScreen();
                    }
                    if (loggedin && emailEntered && passwordEntered) {
                      this.hideLoadingScreen();
                      await this.props.updateLicenceSpeed({
                        variables: {
                          licenceid: this.props.licenceID,
                          speed: this.state.loginspeed,
                          working: true
                        }
                      });
                    }
                    if (errorin) {
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
                            "Sorry, Login was not possible. Please go back to your Dashboard and retry or contact our support if the problem persists.",
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
                      /*} else if (!loggedin && !emailEntered && !passwordEntered) {
                      this.setState({
                        progress: 1,
                        error:
                          "Sorry, Login was not possible. Please go back to your Dashboard and retry or contact our support if the problem persists.",
                        errorshowed: true
                      });*/
                    }
                  }}
                  progress={progress => this.setState({ progress })}
                  speed={this.state.loginspeed || 1}
                  style={
                    context.isActive
                      ? { height: "calc(100vh - 32px - 40px)" }
                      : { height: "calc(100vh - 32px)" }
                  }
                  interactionHappenedCallback={() => {
                    let interactions = this.state.interactions;
                    interactions[this.state.planId] = new Date();
                    this.setState({ interactions });
                  }}
                  execute={this.state.options.execute}
                  noError={this.state.options.noError}
                  individualShow={this.state.options.individualShow}
                  noUrlCheck={this.state.options.noUrlCheck}
                  individualNotShow={this.state.options.individualNotShow}
                  addWebview={this.props.addWebview}
                  licenceID={this.props.licenceID}
                  setViewTitle={title =>
                    this.props.setViewTitle &&
                    this.props.setViewTitle(title, this.props.viewID, this.props.licenceID)
                  }
                  loggedIn={this.props.loggedIn}
                  deleteCookies={this.state.options.deleteCookies}
                />
              ) : (
                <div>Please Update VIPFY to use this service</div>
              )}
              {this.state.error && (
                <PopupBase small={true}>
                  <h2>Ooopps, sorry it seems that we can't log you in</h2>
                  <p style={{ marginTop: "24px" }}>
                    Please take a look and give us Feedback to improve our Login-System
                  </p>
                  <UniversalButton
                    type="high"
                    onClick={() => {
                      this.hideLoadingScreen();
                      this.waitforRecheck();
                      this.setState({ error: null });
                    }}
                    label="ok"
                  />
                </PopupBase>
              )}
              {this.state.errorRecheck && (
                <PopupBase small={true} buttonStyles={{ justifyContent: "flex-start" }}>
                  <h2>Please help us to improve</h2>
                  <p style={{ marginTop: "24px" }}>Have you found a reason for the failed login?</p>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <UniversalButton
                      type="high"
                      label="Account expired"
                      onClick={async () => {
                        try {
                          await this.props.logError({
                            variables: {
                              data: {
                                licenceId: this.state.licenceId,
                                accountId: this.state.accountId,
                                unitId: this.state.unitId,
                                options: this.state.options,
                                appid: this.state.appid,
                                error: this.state.error,
                                loginspeed: this.state.loginspeed,
                                label: "Account expired"
                              }
                            }
                          });
                        } catch (err) {
                          console.error(err);
                        }
                        this.setState({ errorRecheck: false });
                      }}
                      customStyles={{ marginBottom: "24px" }}
                    />
                    <UniversalButton
                      type="high"
                      label="Wrong credentials"
                      onClick={async () => {
                        try {
                          await this.props.logError({
                            variables: {
                              data: {
                                licenceId: this.state.licenceId,
                                accountId: this.state.accountId,
                                unitId: this.state.unitId,
                                options: this.state.options,
                                appid: this.state.appid,
                                error: this.state.error,
                                loginspeed: this.state.loginspeed,
                                label: "Wrong credentials"
                              }
                            }
                          });
                        } catch (err) {
                          console.error(err);
                        }
                        this.setState({ errorRecheck: false });
                      }}
                      customStyles={{ marginBottom: "24px" }}
                    />
                    <UniversalButton
                      type="high"
                      label="The login actually worked"
                      onClick={async () => {
                        try {
                          await this.props.logError({
                            variables: {
                              data: {
                                licenceId: this.state.licenceId,
                                accountId: this.state.accountId,
                                unitId: this.state.unitId,
                                options: this.state.options,
                                appid: this.state.appid,
                                error: this.state.error,
                                loginspeed: this.state.loginspeed,
                                label: "The login actually worked"
                              }
                            }
                          });
                        } catch (err) {
                          console.error(err);
                        }
                        this.setState({ errorRecheck: false });
                      }}
                      customStyles={{ marginBottom: "24px" }}
                    />
                    <UniversalButton
                      type="high"
                      label="Still on the LoginPage"
                      onClick={async () => {
                        try {
                          await this.props.logError({
                            variables: {
                              data: {
                                licenceId: this.state.licenceId,
                                accountId: this.state.accountId,
                                unitId: this.state.unitId,
                                options: this.state.options,
                                appid: this.state.appid,
                                error: this.state.error,
                                loginspeed: this.state.loginspeed,
                                label: "Still on the LoginPage"
                              }
                            }
                          });
                        } catch (err) {
                          console.error(err);
                        }
                        this.setState({ errorRecheck: false });
                      }}
                      customStyles={{ marginBottom: "24px" }}
                    />
                  </div>
                  <UniversalButton
                    type="low"
                    onClick={() => this.setState({ errorRecheck: false })}
                    label="cancel"
                  />
                </PopupBase>
              )}
            </div>
          );
        }}
      </HeaderNotificationContext.Consumer>
    );
  }
}

export default compose(
  withApollo,
  graphql(LOG_SSO_ERROR, { name: "logError" }),
  graphql(UPDATE_LICENCE_SPEED, { name: "updateLicenceSpeed" })
)(Webview);
