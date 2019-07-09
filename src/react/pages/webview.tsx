import * as React from "react";
import { Link } from "react-router-dom";
import WebView = require("react-electron-web-view");
const { shell, remote } = require("electron");
const { session } = remote;
import { withApollo, compose, graphql } from "react-apollo";
import gql from "graphql-tag";

import LoadingDiv from "../components/LoadingDiv";
import { STATUS_CODES } from "http";
import Popup from "../components/Popup";
import AcceptLicence from "../popups/acceptLicence";
import ErrorPopup from "../popups/errorPopup";
import UniversalLoginExecutor from "../components/UniversalLoginExecutor";

const LOG_SSO_ERROR = gql`
  mutation onLogSSOError($data: JSON!) {
    logSSOError(eventdata: $data)
  }
`;

export type WebViewState = {
  setUrl: string;
  currentUrl: string;
  inspirationalText: string;
  legalText: string;
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
};

// TODO: webpreferences="contextIsolation" would be nice, see https://github.com/electron-userland/electron-compile/issues/292 for blocker
// TODO: move TODO page to web so webSecurity=no is no longer nessesary

export class Webview extends React.Component<WebViewProps, WebViewState> {
  static defaultProps = { app: -1 };

  static loadingQuotes = [
    "Loading...",
    "Connecting to the World",
    "Constructing Pylons",
    "Did you know that Vipfy is cool",
    "Just a second",
    "Vipfy loves you",
    "Almost there"
  ];

  state = {
    setUrl: "",
    currentUrl: "",
    inspirationalText: "Loading...",
    legalText: "Legal Text",
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
    errorshowed: false
  };

  static getDerivedStateFromProps(
    nextProps: WebViewProps,
    prevState: WebViewState
  ): WebViewState | null {
    //console.log("DERIVEDSTATE", prevState, nextProps);
    if (nextProps.licenceID !== prevState.licenceId) {
      return {
        ...prevState,
        previousLicenceId: prevState.licenceId,
        licenceId: nextProps.licenceID,
        showLoadingScreen: true
      };
    } else {
      return prevState;
    }
  }

  componentDidMount() {
    //console.log("webview mounted");
    let intervalId = setInterval(() => this.timer1m(), 60000);
    let intervalId2 = setInterval(() => this.sendTimeSpent(), 600000);
    this.setState({ intervalId, intervalId2 });
    // see https://github.com/reactjs/rfcs/issues/26 for context why we wait until after mount
    //console.log("DIDMOUNT");
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
      //console.log("CHECK", this.state.previousLicenceId, this.state.licenceId);
      await this.setState({
        previousLicenceId: this.state.licenceId
      });

      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      //console.log("DIDUPDATE");
      this.switchApp();
    }
  }

  showPopup = type => {
    this.setState({ popup: type });
  };
  closePopup = () => {
    this.setState({ popup: null, error: null, errorshowed: true });
  };

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
      console.log("ACCEPT");
      this.switchApp();
    } catch (err) {
      console.log(err);
    }
  };

  private async switchApp(): Promise<void> {
    console.log(`SWITCH APP webview-${this.props.viewID}`, this.state);
    const timeSpent: number[] = [];
    timeSpent[this.state.licenceId] = 0;
    this.sendTimeSpent(timeSpent);
    let result = await this.props.client.query({
      query: gql`
      {
        fetchLicences(licenceid: ${this.state.licenceId}) {
          id
          agreed
          disabled
          key
          boughtPlan: boughtplanid {
            id,
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
    let licence = result.data.fetchLicences[0];
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
    let loginurl = licence.boughtPlan.plan.app.loginurl;
    if (licence.key && licence.key.loginurl) {
      loginurl = licence.key.loginurl;
    }
    this.setState({
      setUrl: loginurl,
      unitId: licence.unit.id,
      options: licence.boughtPlan.plan.app.options,
      appid: licence.boughtPlan.plan.app.id,
      key: licence.key
    });
  }

  onDidNavigate(url: string): void {
    console.log("DidNavigate", url);
    //this.props.history.push(`/area/app/${this.props.licenceID}/${encodeURIComponent(url)}`);
    //this.setState(prevState => (prevState.currentUrl != url ? { currentUrl: url } : null));
    //this.showLoadingScreen();
  }

  onDidNavigateInPage(url: string): void {
    console.log("DidNavigateInPage", url);
    //this.props.history.push(`/area/app/${this.props.licenceID}/${encodeURIComponent(url)}`);
    //this.setState(prevState => (prevState.currentUrl != url ? { currentUrl: url } : null));
    //this.showLoadingScreen();
  }

  onLoadCommit(event: any): void {
    /*console.log(
      "LoadCommit",
      event,
      this,
      event.srcElement ? event.srcElement.getURL().substring(this.state.setUrl.length) : ""
    );*/

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
    //console.log("Loading Screen Hidden", performance.now() - this.state.t);
    this.setState({ showLoadingScreen: false });
  }

  showLoadingScreen(): void {
    //console.log("Show Loading Screen");
    this.setState({
      showLoadingScreen: true,
      inspirationalText:
        Webview.loadingQuotes[Math.floor(Math.random() * Webview.loadingQuotes.length)],
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
    console.log("onNewWindow", e);
    const protocol = require("url").parse(e.url).protocol;
    if (protocol === "http:" || protocol === "https:") {
      //  shell.openExternal(e.url);

      //TODO HISTORY
      console.log("PUSH HISTORY");
      //this.props.history.push(`/area/app/${this.props.licenceID}/${encodeURIComponent(e.url)}`);

      if (e.url.indexOf("wchat") == -1) {
        this.setState({ currentUrl: e.url });
      }
    }
  }

  async onIpcMessage(e): Promise<void> {
    console.log("onIpcMessage", e, e.senderId);

    switch (e.channel) {
      case "getLoginData":
        {
          let app = e.args[0];
          let result = await this.props.client.query({
            query: gql`
          {
            fetchLicences(licenceid: ${this.state.licenceId}) {
              key
            }
          }
          `
          });

          console.log("LICENCE FETCHED");
          let { key } = result.data.fetchLicences[0];
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
          /*let interactions = this.state.interactions;
          interactions[this.state.planId] = new Date();
          await this.setState({ interactions });*/
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
        console.log("errorDetected");
        // Create the error object
        /*const { logError, client, ...saveprops } = this.props;
        const data = {
          error: "errorDetected",
          state: this.state,
          props: saveprops
        }; */

        const {
          id,
          isadmin,
          licences
          sidebBarOpen,
          tutorialprogess,
          viewID
        } = this.props;
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
          error:
            // tslint:disable-next-line:max-line-length
            "Please check your email address. Then try to reset your password in the service. In your dashboard in VIPFY click on the pencil below the serviceicon to change the password.",
          errorshowed: true,
          loggedIn: true
        });
        this.hideLoadingScreen();
        break;
      }
      case "falseLogin": {
        console.log("falseLogin");
        const { logError, client, ...saveprops } = this.props;
        const data = {
          error: "falseLogin",
          state: this.state,
          props: saveprops
        };
        try {
          await this.props.logError({ variables: { data } });
        } catch (err) {
          console.log(err);
        }
        this.setState({
          error:
            // tslint:disable-next-line:max-line-length
            "Please check your email adress. Then try to reset your password in the service. In your dashboard in VIPFY click on the pencil below the serviceicon to change the password.",
          errorshowed: true,
          loggedIn: true
        });
        this.hideLoadingScreen();
        break;
      }
      case "startLoginIn": {
        console.log("StartLoginIN");
        break;
      }
      case "getLoginDetails": {
        console.log("GETDETAILS");
        let round = e.args[0];
        if (round > 10) {
          console.log("STOP RETRY Webview");

          const {
            id,
            isadmin,
            licences
            sidebBarOpen,
            tutorialprogess,
            viewID
          } = this.props;
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
            message: "STOP RETRY"
          };
  
          try {
            await this.props.logError({ variables: { data } });
          } catch (err) {
            console.error(err);
          }


          this.setState({
            error:
              "Please check your email adress. Then try to reset your password in the service. In your dashboard in VIPFY click on the pencil below the serviceicon to change the password.",
            errorshowed: true,
            loggedIn: true
          });
          this.hideLoadingScreen();
        }
        console.log(round);
        let result = await this.props.client.query({
          query: gql`
        {
          fetchLicences(licenceid: ${this.state.licenceId}) {
            key
          }
        }
        `
        });

        console.log("LICENCE FETCHED");
        let { key } = result.data.fetchLicences[0];
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
    console.log(`RENDER webview-${this.props.viewID}`, this.state, this.props);

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

    //console.log("setUrl", this.state.setUrl);
    //initWebContentContextMenu();

    if (this.props.plain) {
      cssClass = "";
    }

    return (
      <div className={cssClass} id={`webview-${this.props.viewID}`}>
        {this.state.showLoadingScreen && (
          <LoadingDiv text={this.state.inspirationalText} legalText={this.state.legalText} />
        )}
        {this.state.options.universallogin ? (
          <UniversalLoginExecutor
            loginUrl={this.state.setUrl}
            username={this.state.key.email || this.state.key.username}
            password={this.state.key.password}
            timeout={60000}
            takeScreenshot={false}
            partition="services"
            className={cssClassWeb}
            setResult={({ loggedin, emailEntered, passwordEntered }) => {
              if (loggedin && emailEntered && passwordEntered) {
                this.hideLoadingScreen();
              }
            }}
            speed={1}
          />
        ) : (
          <WebView
            id={`webview-${this.props.viewID}`}
            preload="./preload-launcher.js"
            webpreferences="webSecurity=no"
            className={cssClassWeb}
            src={this.state.currentUrl || this.state.setUrl}
            partition="services"
            onDidNavigate={e => this.onDidNavigate(e.target.src)}
            //style={{ visibility: this.state.showLoadingScreen && false ? "hidden" : "visible" }}
            onDidFailLoad={(code, desc, url, isMain) => {
              if (isMain) {
                //this.hideLoadingScreen();
              }
              console.log(`failed loading ${url}: ${code} ${desc}`);
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
        {this.state.error ? (
          <Popup
            popupHeader={"Uupps, sorry it seems that we can't look you in"}
            popupBody={ErrorPopup}
            bodyProps={{ sentence: this.state.error }}
            onClose={this.closePopup}
          />
        ) : (
          ""
        )}
        {this.state.popup && (
          <Popup
            popupHeader={this.state.popup.type}
            popupBody={AcceptLicence}
            bodyProps={this.state.popup}
            onClose={this.closePopup}
          />
        )}
      </div>
    );
  }
}

export default compose(
  withApollo,
  graphql(LOG_SSO_ERROR, { name: "logError" })
)(Webview);
