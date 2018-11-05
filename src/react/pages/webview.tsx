import * as React from "react";
import { Link } from "react-router-dom";
import WebView = require("react-electron-web-view");
const { shell, remote } = require("electron");
const { session } = remote;
import { withApollo } from "react-apollo";
import gql from "graphql-tag";

import LoadingDiv from "../components/LoadingDiv";
import { STATUS_CODES } from "http";
import Popup from "../components/Popup";
import AcceptLicence from "../popups/acceptLicence";

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
};

export type WebViewProps = {
  app: number;
  client: ApolloClient;
  chatOpen: boolean;
  sidebBarOpen: boolean;
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

  constructor(props: WebViewProps) {
    super(props);
    this.state = {
      setUrl: "",
      currentUrl: "vipfy://blank",
      inspirationalText: "Loading...",
      legalText: "Legal Text",
      showLoadingScreen: true,
      t: performance.now(),
      licenceId: props.match.params.licenceid,
      previousLicenceId: -1,
      unitId: -1,
      popup: null,
      interactions: [],
      intervalId: null,
      intervalId2: null,
      timeSpent: []
    };
  }

  static getDerivedStateFromProps(
    nextProps: WebViewProps,
    prevState: WebViewState
  ): WebViewState | null {
    if (nextProps.match.params.licenceid !== prevState.licenceId) {
      return {
        ...prevState,
        previousLicenceId: prevState.licenceId,
        licenceId: nextProps.match.params.licenceid,
        showLoadingScreen: true
      };
    } else {
      return prevState;
    }
  }

  componentDidMount() {
    console.log("webview mounted");
    let intervalId = setInterval(() => this.timer1m(), 60000);
    let intervalId2 = setInterval(() => this.sendTimeSpent(), 600000);
    this.setState({ intervalId, intervalId2 });
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
      console.log("CHECK", this.state.previousLicenceId, this.state.licenceId);
      await this.setState({
        previousLicenceId: this.state.licenceId
      });

      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      this.switchApp();
    }
  }

  showPopup = type => {
    this.setState({ popup: type });
  };
  closePopup = () => {
    this.setState({ popup: null });
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
    console.log("TIME SPENT", timeSpent);
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
    console.log("ACCEPTED LICENCE", this.state.licenceId);
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
      console.log(err);
    }
  };

  private async switchApp(): Promise<void> {
    console.log("switchApp", this.state.licenceId);

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
    console.log("APP DATA", result);
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
      /*window.alert(
        "You first have to agree to the licence terms. Unfortunately this isn't implemented yet"
      );*/
    }

    if (licence.unit.id !== this.state.unitId) {
      await new Promise((resolve, reject) => {
        session.fromPartition("services").clearStorageData({}, () => {
          resolve();
        });
      });
    }
    let loginurl = licence.boughtPlan.plan.app.loginurl;
    if (licence.key && licence.key.loginurl) {
      console.log(licence.key.loginurl);
      loginurl = licence.key.loginurl;
    }
    this.setState({
      setUrl: loginurl,
      unitId: licence.unit.id
    });
  }

  onDidNavigate(url: string): void {
    console.log("DidNavigate", url);
    this.setState({ currentUrl: url });
    this.showLoadingScreen();
  }

  onLoadCommit(event: any): void {
    console.log("LoadCommit", event);
    if (!event.isMainFrame) {
      return;
    }
    this.setState({ currentUrl: event.url });
  }

  hideLoadingScreen(): void {
    console.log("Loading Screen Hidden", performance.now() - this.state.t);
    this.setState({ showLoadingScreen: false });
  }

  showLoadingScreen(): void {
    console.log("Show Loading Screen");
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
      shell.openExternal(e.url);
    }
  }

  async onIpcMessage(e): Promise<void> {
    console.log("onIpcMessage", e);

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

          console.log("LICENCE", result);
          let { key } = result.data.fetchLicences[0];
          console.log("chosen key", key);
          if (key === null) {
            window.alert("invalid licence");
          }
          e.target.send("loginData", key);
        }
        break;

      case "getLoginData":
        {
          let licence = this.state.licenceId;
          let result = await this.props.client.query({
            query: gql`
          {
            createLoginLink(licenceid: ${licence}) {
              loginLink
            }
          }
          `,
            fetchPolicy: "no-cache"
          });
          console.log("LOGIN LINK", result);
          let link = result.data.createLoginLink.loginLink;
          this.setState({ setUrl: link });
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

      default:
        console.log("No case applied", e.channel);
    }
  }

  render() {
    let cssClass = "marginLeft";
    if (this.props.chatOpen) {
      cssClass += " chat-open";
    }
    if (this.props.sideBarOpen) {
      cssClass += " side-bar-open";
    }
    let cssClassWeb = "newMainPosition";
    if (this.props.chatOpen) {
      cssClass += " chat-open";
    }
    if (this.props.sideBarOpen) {
      cssClass += " side-bar-open";
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

    console.log("setUrl", this.state.setUrl);

    return (
      <div className={cssClass}>
        {this.state.showLoadingScreen ? (
          <LoadingDiv text={this.state.inspirationalText} legalText={this.state.legalText} />
        ) : (
          ""
        )}
        <WebView
          id="webview"
          preload="./preload-launcher.js"
          webpreferences="webSecurity=no"
          className={cssClassWeb}
          src={this.state.setUrl}
          partition="services"
          onDidNavigate={e => this.onDidNavigate(e.target.src)}
          style={{ visibility: this.state.showLoadingScreen ? "hidden" : "visible" }}
          onDidFailLoad={(code, desc, url, isMain) => {
            if (isMain) {
              this.hideLoadingScreen();
            }
            console.log(`failed loading ${url}: ${code} ${desc}`);
          }}
          onLoadCommit={e => this.onLoadCommit(e)}
          onNewWindow={e => this.onNewWindow(e)}
          onWillNavigate={e => console.log("WillNavigate", e)}
          onDidStartLoading={e => console.log("DidStartLoading", e)}
          onDidStartNavigation={e => console.log("DidStartNavigation", e)}
          onDidFinishLoad={e => console.log("DidFinishLoad", e)}
          onDidStopLoading={e => console.log("DidStopLoading", e)}
          onDomReady={e => {
            console.log("DomReady", e);
            this.maybeHideLoadingScreen();
            if (!e.target.isDevToolsOpened()) {
              e.target.openDevTools();
            }
          }}
          onDialog={e => console.log("Dialog", e)}
          onIpcMessage={e => this.onIpcMessage(e)}
        />
        {this.state.popup ? (
          <Popup
            popupHeader={this.state.popup.type}
            popupBody={AcceptLicence}
            bodyProps={this.state.popup}
            onClose={this.closePopup}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default withApollo(Webview);
