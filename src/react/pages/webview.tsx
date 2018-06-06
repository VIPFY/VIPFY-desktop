import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";
import WebView = require("react-electron-web-view");
const { shell } = require("electron");
import { withApollo } from "react-apollo";
import gql from "graphql-tag";

export type WebViewState = {
  setUrl: string;
  currentUrl: string;
  inspirationalText: string;
  legalText: string;
  showLoadingScreen: boolean;
  t: number;
};

export type WebViewProps = {
  app: string;
  client: ApolloClient;
  chatopen: boolean;
  sidebaropen: boolean;
};

// TODO: webpreferences="contextIsolation" would be nice, see https://github.com/electron-userland/electron-compile/issues/292 for blocker
// TODO: move TODO page to web so webSecurity=no is no longer nessesary

export class Webview extends Component<WebViewProps, WebViewState> {
  static defaultProps = { app: "vipfy" };

  static loadingQuotes = [
    "Loading",
    "Connecting to the World",
    "Constructing Pylons",
    "Loading",
    "Did you know that Vipfy is cool",
    "Just a second"
  ];

  constructor(props) {
    super(props);
    this.state = {
      setUrl: Webview.appToUrl(props.app), //passed prop as initial value
      currentUrl: Webview.appToUrl(props.app), //passed prop as initial value
      inspirationalText: "Loading",
      legalText: "Legal Text",
      showLoadingScreen: false,
      t: performance.now()
    };
    /*if(this.state.setUrl.startsWith("https://www.weebly.com")) {

    }*/
  }

  private static appToUrl(app: string): string {
    switch (app) {
      case "vipfy":
        return "https://vipfy.com";
      case "pipedrive":
        return "https://app.pipedrive.com/auth/login";
      case "google apps":
        return "https://docs.google.com";
      case "weebly":
        return "https://www.weebly.com/login";
      case "slack":
        return "https://slack.com";
      case "dropbox":
        return "https://www.dropbox.com/login";
      //return "http://dev.vipfy.com:7000/";
      case "moo":
        return "https://www.moo.com/uk/account/signin.php";
      default:
        return "/area/dashboard?error=unknownapp";
    }
  }

  static getDerivedStateFromProps(
    nextProps: WebViewProps,
    prevState: WebViewState
  ): WebViewState | null {
    return { ...prevState, setUrl: Webview.appToUrl(nextProps.app) };
  }

  onDidNavigate(url: string): void {
    console.log("DidNavigate", url);
    this.setState({
      currentUrl: url
    });
    this.showLoadingScreen();
  }

  onLoadCommit(event: any): void {
    console.log("LoadCommit", event);
    if (!event.isMainFrame) {
      return;
    }
    this.setState({
      currentUrl: event.url
    });
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
    let loginPageRegex =
      "^https://(www.)?dropbox.com/?(/login.*|/logout|/plans.*)?$|^https://app.pipedrive.com/auth/login|^https://www.wrike.com/login|^https://www.weebly.com/login";
    if (new RegExp(loginPageRegex).test(this.state.currentUrl)) {
      console.log("Not hiding loading screen for " + this.state.currentUrl);
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

  onIpcMessage(e): void {
    console.log("onIpcMessage", e);
    if (e.channel === "getLoginData") {
      let app = e.args[0];
      this.props.client
        .query({
          query: gql`
          {
            fetchLicencesByApp(appid: ${app}) {
                key
            }
          }
        `
        })
        .then(result => {
          console.log("LICENCE", result);
          let key = result.data.fetchLicencesByApp[0].key;
          console.log("chosen key", key);
          if (key === null) {
            window.alert("invalid licence");
          }
          e.target.send("loginData", key);
        });
    } else if (e.channel === "getLoginLink") {
      this.props.client
        .query({
          query: gql`
            {
              fetchLicencesByApp(appid: 2) {
                boughtplanid {
                  id
                }
              }
            }
          `
        })
        .then(result => {
          console.log("FETCH LICENCES", result)
          let licence = result.data.fetchLicencesByApp[0].boughtplanid.id;

          this.props.client
            .query({
              query: gql`
                {
                  createLoginLink(boughtplanid: ${licence}) {
                    loginLink
                  }
                }
              `
            })
            .then(result => {
              console.log("LOGIN LINK", result)
              let link = result.data.createLoginLink.loginLink;
              this.setState({ setUrl: link });
            });
        });
    }
  }

  render() {
    let cssClass = "marginLeft";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }
    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }
    let cssClassWeb = "mainPosition";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }
    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }
    return (
      <div className={cssClass}>
        <div
          id="loadingScreen"
          className={cssClassWeb}
          style={{ display: this.state.showLoadingScreen ? "block" : "none" }}>
          <div className="loadingTextBlock">
            <div className="centerText inspirationalText">
              <div>{this.state.inspirationalText}</div>
            </div>
            <div className="centerText legalText">
              <div>{this.state.legalText}</div>
            </div>
          </div>
        </div>
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
          onDidFinishLoad={e => {
            console.log("DidFinishLoad", e);
          }}
          onDidStopLoading={e => {
            console.log("DidStopLoading", e);
          }}
          onDomReady={e => {
            console.log("DomReady", e);
            this.maybeHideLoadingScreen();
            //if(!e.target.isDevToolsOpened()) {
            //  e.target.openDevTools();
            //}
          }}
          onDialog={e => {
            console.log("Dialog", e);
          }}
          onIpcMessage={e => {
            this.onIpcMessage(e);
          }}
        />
      </div>
    );
  }
}

export default withApollo(Webview);
