import * as React from "react";
import { parse } from "url";
import WebView from "react-electron-web-view";
import { remote } from "electron";
const { session } = remote;
import { withApollo, compose, graphql } from "react-apollo";
import gql from "graphql-tag";

import LoadingDiv from "../components/LoadingDiv";
import Popup from "../components/Popup";
import AcceptLicence from "../popups/acceptLicence";
import ErrorPopup from "../popups/errorPopup";
import UniversalLoginExecutor from "../components/UniversalLoginExecutor";
import HeaderNotificationContext from "../components/notifications/headerNotificationContext";
import { getPreloadScriptPath } from "../common/functions";
import { decryptLicenceKey } from "../common/passwords";

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
  licenceId: number;
  previousLicenceId: number;
  unitId: number;
  popup: any;
  interactions: Date[];
  intervalId: Timer | null;
  intervalId2: Timer | null;
  timeSpent: number[];
  options: any;
  appid: number;
  error: string | null;
  loggedIn: boolean;
  errorshowed: boolean;
  progress?: number;
  loginspeed: number;
  errorScreen: boolean;
  oldspeed: number;
  key: any;
};

export type WebViewProps = {
  app: number;
  licenceID: number;
  client: ApolloClient;
  chatOpen: boolean;
  sidebBarOpen: boolean;
  setViewTitle: Function;
  viewID: number;
  logError: Function;
  updateLicenceSpeed: Function;
};

// TODO: webpreferences="contextIsolation" would be nice, see https://github.com/electron-userland/electron-compile/issues/292 for blocker
// TODO: move TODO page to web so webSecurity=no is no longer nessesary

export class Webview extends React.Component<WebViewProps, WebViewState> {
  static defaultProps = { app: -1 };

  state = {
    setUrl: "",
    currentUrl: "",
    showLoadingScreen: true,
    t: performance.now(),
    licenceId: this.props.licenceID,
    previousLicenceId: -1,
    unitId: -1,
    popup: null,
    interactions: [],
    intervalId: null,
    intervalId2: null,
    timeSpent: [],
    options: {},
    appid: -1,
    error: null,
    loggedIn: false,
    errorshowed: false,
    progress: undefined,
    loginspeed: 10,
    errorScreen: false,
    oldspeed: undefined,
    key: null
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
    //console.log("COMPARE PROPS", this.props, nextProps);
    //console.log("COMPARE STATE", this.state, nextState);
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
    setTimeout(async () => {
      if (this.state.loggedIn) {
        return true;
      } else {
        if (this.state.errorshowed) {
          return console.log("Timeout", this.state.errorshowed, this.state.loggedIn);
        } else {
          const eventdata = { state: this.state, props: this.props };
          //await this.props.logError({ variables: { eventdata } });
          /*this.setState({
            error: "The Login takes too much time. Please check with our support.",
            loggedIn: true
          });*/
        }
      }
    }, 30000);
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

  showPopup = type => this.setState({ popup: type });

  closePopup = () => this.setState({ popup: null, error: null, errorshowed: true });

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
            trackMinutesSpent(licenceid: $licenceid, minutes: $minutes) {
              ok
            }
          }
        `,
        variables: { licenceid: this.state.licenceId, minutes: minutes }
      });
    }
  };

  acceptFunction = async () => {
    try {
      await this.props.client.mutate({
        mutation: gql`
          mutation agreeToLicence($licenceid: ID!) {
            agreeToLicence(licenceid: $licenceid) {
              ok
            }
          }
        `,
        variables: { licenceid: this.state.licenceId }
      });
      this.closePopup();
      this.setState({ previousLicenceId: -1 });
      this.switchApp();
    } catch (err) {
      console.error(err);
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
    if (!licence) {
      return;
    }
    if (licence && licence.disabled) {
      window.alert("This licence is disabled, you cannot use it");
    } else if (licence && !licence.agreed) {
      this.setState({
        previousLicenceId: this.state.licenceId
      });

      this.showPopup({
        type: "Accept Licences",
        id: this.state.licenceId,
        neededCheckIns: licence.boughtPlan.plan.app.options,
        appname: licence.boughtPlan.plan.app.name,
        acceptFunction: this.acceptFunction
      });
      return;
    }
    /*if (licence.unit.id !== this.state.unitId) {
      await new Promise((resolve, reject) => {
        session.fromPartition("services").clearStorageData({}, () => {
          resolve();
        });
      });
    }*/

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
    //console.log("BP", licence.boughtPlan, optionsobject);
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
      progress: undefined
    });
  }

  onDidNavigate(url: string): void {
    //this.props.history.push(`/area/app/${this.props.licenceID}/${encodeURIComponent(url)}`);
    //this.setState(prevState => (prevState.currentUrl != url ? { currentUrl: url } : null));
    //this.showLoadingScreen();
  }

  onDidNavigateInPage(url: string): void {
    //this.props.history.push(`/area/app/${this.props.licenceID}/${encodeURIComponent(url)}`);
    //this.setState(prevState => (prevState.currentUrl != url ? { currentUrl: url } : null));
    //this.showLoadingScreen();
  }

  onLoadCommit(event: any): void {
    this.props.setViewTitle(
      event.srcElement ? event.srcElement.getURL() : "",
      this.props.viewID,
      this.props.licenceID
    );
    if (!event.isMainFrame) {
      return;
    }
    //this.setState({ currentUrl: event.url });
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

  maybeHideLoadingScreen(): void {
    const loginPages = [
      "^https://(www.)?dropbox.com/?(/login.*|/logout|/plans.*)?$",
      "^https://app.pipedrive.com/auth/login",
      "^https://www.wrike.com/login",
      "^https://www.weebly.com/login",
      "^https://login.domaindiscount24.com/(login|dashboard)",
      "^https://.*?sendgrid.com/login",
      "https://www.moo.com/uk/account/signin.php"
    ];
    let loginPageRegex = loginPages.join("|");

    if (new RegExp(loginPageRegex).test(this.state.currentUrl)) {
      console.log(`Not hiding loading screen for ${this.state.currentUrl}`);
      return;
    }
    this.hideLoadingScreen();
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

  async onIpcMessage(e): Promise<void> {
    //console.log("IPCMessage", e.channel)
    switch (e.channel) {
      case "getLoginData":
        {
          let { key } = this.state;
          if (key === null) {
            window.alert("invalid licence");
          }
          e.target.send("loginData", key);
        }
        break;

      case "getCustomerData":
        {
          e.target.send("customerData", {
            name: this.props.company.name,
            domain: this.props.domain
          });
        }
        break;

      case "requestAuthcode":
        {
          this.props.history.push(`/area/domains/${this.props.domain}`);
        }
        break;

      case "requestPush":
        {
          this.props.history.push(`/area/domains/${this.props.domain}`);
        }
        break;

      case "interactionHappened":
        {
          let interactions = this.state.interactions;
          interactions[this.state.planId] = new Date();
          await this.setState({ interactions });
        }
        break;
      case "showLoading": {
        //console.log("ShowLoading");
        this.showLoadingScreen();
        break;
      }
      case "hideLoading": {
        //console.log("HideLoading");
        this.hideLoadingScreen();
        break;
      }
      case "loggedIn": {
        //console.log("HideLoading");
        this.setState({ loggedIn: true });
        break;
      }

      case "errorDetected": {
        console.log("errorDetected 434");
        // Create the error object
        /*const { logError, client, ...saveprops } = this.props;
        const data = {
          error: "errorDetected",
          state: this.state,
          props: saveprops
        }; */

        const { id, isadmin, licences, sidebBarOpen, tutorialprogess, viewID } = this.props;
        const {
          appid,
          currentUrl,
          intervalId,
          intervalId2,
          key,
          licenceId,
          loggedIn,
          options,
          previousLicenceId,
          showLoadingScreen,
          t
        } = this.state;
        const licence = licences.fetchLicences.find(l => l.id == licenceId);

        const data = {
          id,
          isadmin,
          sidebBarOpen,
          tutorialprogess,
          viewID,
          appid,
          currentUrl,
          intervalId,
          intervalId2,
          key,
          licenceId,
          loggedIn,
          options,
          previousLicenceId,
          showLoadingScreen,
          t,
          licence,
          message: "errorDetected"
        };

        try {
          await this.props.logError({ variables: { data } });
        } catch (err) {
          console.error(err);
        }
        this.setState({
          error: `Please check your email address. Then try to reset your password in the service. ${
            this.props.isadmin
              ? "Verify the correctness or update the data of the service in the Service Manager afterwards"
              : "Please ask your admin to check the service in the Service Manager afterwards"
          }.`,
          errorshowed: true,
          loggedIn: true
        });
        this.hideLoadingScreen();
        break;
      }
      case "falseLogin": {
        //console.log("falseLogin");
        const { logError, client, ...saveprops } = this.props;
        const data = {
          error: "falseLogin",
          state: this.state,
          props: saveprops
        };
        try {
          await this.props.logError({ variables: { data } });
        } catch (err) {
          console.error(err);
        }
        this.setState({
          error: `Please check your email address. Then try to reset your password in the service. ${
            this.props.isadmin
              ? "Verify the correctness or update the data of the service in the Service Manager afterwards"
              : "Please ask your admin to check the service in the Service Manager afterwards"
          }.`,
          errorshowed: true,
          loggedIn: true
        });
        this.hideLoadingScreen();
        break;
      }
      case "startLoginIn": {
        break;
      }
      case "getLoginDetails": {
        let round = e.args[0];
        if (round > 10) {
          const { id, isadmin, licences, sidebBarOpen, tutorialprogess, viewID } = this.props;
          const {
            appid,
            currentUrl,
            intervalId,
            intervalId2,
            key,
            licenceId,
            loggedIn,
            options,
            previousLicenceId,
            showLoadingScreen,
            t
          } = this.state;
          //console.log("PROPS", this.props, licences);
          const licence = licences.fetchLicences.find(l => l.id == licenceId);

          const data = {
            id,
            isadmin,
            sidebBarOpen,
            tutorialprogess,
            viewID,
            appid,
            currentUrl,
            intervalId,
            intervalId2,
            key,
            licenceId,
            loggedIn,
            options,
            previousLicenceId,
            showLoadingScreen,
            t,
            licence,
            message: "STOP RETRY"
          };

          try {
            await this.props.logError({ variables: { data } });
          } catch (err) {
            console.error(err);
          }

          this.setState({
            error: `Please check your email address. Then try to reset your password in the service. ${
              this.props.isadmin
                ? "Verify the correctness or update the data of the service in the Service Manager afterwards"
                : "Please ask your admin to check the service in the Service Manager afterwards"
            }.`,
            errorshowed: true,
            loggedIn: true
          });
          this.hideLoadingScreen();
        }

        let { key } = this.state;
        if (key === null) {
          window.alert("invalid licence");
        }
        if (this.state.options) {
          e.target.send("loginDetails", {
            appid: this.state.appid,
            ...this.state.options,
            loggedIn: this.state.loggedIn,
            key
          });
        } else {
          e.target.send("loginDetails", {
            appid: this.state.appid,
            type: 0,
            key
          });
        }
        break;
      }
      default:
        console.log("No case applied", e.channel);
    }
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

    // this is a workaround for a weebly bug. Remove when no longer nessesary
    if (
      this.state.setUrl != this.state.currentUrl &&
      this.state.setUrl === "https://www.weebly.com/login"
    ) {
      session
        .fromPartition("services")
        .clearStorageData({ origin: "https://www.weebly.com" }, () =>
          console.log("cleared cookies")
        );
    }

    //initWebContentContextMenu();

    if (this.props.plain) {
      cssClass = "";
    }

    //console.log("STATE", this.state);
    //console.log("Opening Licence ", this.state.licenceId, " with speed ", this.state.loginspeed);
    return (
      <HeaderNotificationContext.Consumer>
        {context => {
          return (
            <div className={cssClass} id={`webview-${this.props.viewID}`}>
              {this.state.showLoadingScreen && <LoadingDiv progress={this.state.progress} />}

              {this.state.options.universallogin ? (
                <UniversalLoginExecutor
                  key={`${this.state.setUrl}-${this.state.loginspeed}`}
                  //keylog={`${this.state.setUrl}-${this.state.loginspeed}`}
                  loginUrl={this.state.setUrl}
                  username={this.state.key.email || this.state.key.username}
                  password={this.state.key.password}
                  domain={this.state.key.domain}
                  timeout={60000}
                  takeScreenshot={false}
                  partition={`service-${this.state.licenceId}`}
                  className={cssClassWeb}
                  showLoadingScreen={b => this.setState({ showLoadingScreen: b })}
                  setResult={async ({ loggedin, errorin, emailEntered, passwordEntered }) => {
                    /*console.log(
                      "SETRESULT",
                      loggedin,
                      "| ",
                      errorin,
                      "|",
                      emailEntered,
                      "|",
                      passwordEntered
                    );*/
                    if (loggedin && emailEntered && passwordEntered) {
                      //console.log("Loggin detected");
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
                        //console.log("REAL PROBLEM!", this.state.setUrl);
                        this.setState({
                          progress: 1,
                          error:
                            "Sorry, Login was not possible. Please go back to your Dashboard and retry or contact our support if the problem persists.",
                          errorshowed: true
                        });
                      } else {
                        /*console.log(
                          "SET LOGINSPEED TO 1",
                          this.state.setUrl,
                          this.state.loginspeed
                        );*/
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
                />
              ) : (
                <WebView
                  id={`webview-${this.props.viewID}`}
                  preload={getPreloadScriptPath("preload.js")}
                  webpreferences="webSecurity=no"
                  className={cssClassWeb}
                  src={this.state.currentUrl || this.state.setUrl}
                  partition="services"
                  onDidNavigate={e => this.onDidNavigate(e.target.src)}
                  style={
                    context.isActive
                      ? { height: "calc(100vh - 32px - 40px)" }
                      : { height: "calc(100vh - 32px)" }
                  }
                  //style={{ visibility: this.state.showLoadingScreen && false ? "hidden" : "visible" }}
                  onDidFailLoad={(code, desc, url, isMain) => {
                    if (isMain) {
                      //this.hideLoadingScreen();
                    }
                    //console.log(`failed loading ${url}: ${code} ${desc}`);
                  }}
                  onLoadCommit={e => this.onLoadCommit(e)}
                  onNewWindow={e => this.onNewWindow(e)}
                  onDidStartNavigation={e => console.log("DidStartNavigation", e.target.src)}
                  onDomReady={e => {
                    if (!e.target.isDevToolsOpened()) {
                      //e.target.openDevTools();
                    }
                  }}
                  //onDialog={e => console.log("Dialog", e)}
                  onIpcMessage={e => this.onIpcMessage(e)}
                  //onConsoleMessage={e => console.log("LOGCONSOLE", e.message)}
                  onDidNavigateInPage={e => this.onDidNavigateInPage(e.target.src)}
                  useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
                />
              )}
              {this.state.error && (
                //TODO VIP-411 Replace old Popup with new PopupBase
                <Popup
                  popupHeader={"Ooopps, sorry it seems that we can't log you in"}
                  popupBody={ErrorPopup}
                  bodyProps={{ sentence: this.state.error }}
                  onClose={this.closePopup}
                />
              )}

              {this.state.popup && (
                //TODO VIP-411 Replace old Popup with new PopupBase
                <Popup
                  popupHeader={this.state.popup.type}
                  popupBody={AcceptLicence}
                  bodyProps={this.state.popup}
                  onClose={this.closePopup}
                />
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
