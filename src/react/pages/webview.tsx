import * as React from "react";
import {Component, ReactPropTypes} from "react";
import { Link } from "react-router-dom";
import WebView = require('react-electron-web-view');
const {shell} = require('electron');

export type WebViewState = {
  url: string;
  inspirationalText: string;
  legalText: string;
  showLoadingScreen: boolean;
  t: number;
}

export type WebViewProps = {
  app: string;
}

// TODO: webpreferences="contextIsolation" would be nice, see https://github.com/electron-userland/electron-compile/issues/292 for blocker
// TODO: move TODO page to web so webSecurity=no is no longer nessesary

export class Webview extends Component<WebViewProps, WebViewState> {

  static defaultProps = { app: 'vipfy' }

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
      url: Webview.appToUrl(props.app), //passed prop as initial value
      inspirationalText: "Loading",
      legalText: "Legal Text",
      showLoadingScreen: false,
      t: performance.now(),
    }
  }

  private static appToUrl(app: string):string {
    switch (app) {
      case "vipfy": return "https://vipfy.com";
      case "pipedrive": return "https://pipedrive.com";
      case "slack": return "https://slack.com";
      default: return "/area/dashboard?error=unknownapp";
    }
  }

  static getDerivedStateFromProps(nextProps: WebViewProps, prevState: WebViewState): WebViewState | null {
    return { ...prevState, url: Webview.appToUrl(nextProps.app) };
  }

  onDidNavigate(url: string): void {
    console.log("DidNavigate", url);
    this.setState({
      url: url
    })
  }

  hideLoadingScreen(): void {
    console.log("Loading Screen Hidden", performance.now() - this.state.t);
    this.setState({ showLoadingScreen: false });
  }

  showLoadingScreen(): void {
    console.log("Show Loading Screen");
    this.setState({
      showLoadingScreen: true,
      inspirationalText: Webview.loadingQuotes[Math.floor(Math.random()*Webview.loadingQuotes.length)],
      t: performance.now(),
    });
  }

  maybeHideLoadingScreen(): void {
    let loginPageRegex = "^https://(www.)?dropbox.com/?(/login.*|/logout)?$|^https://app.pipedrive.com/auth/login|^https://www.wrike.com/login";
    if(new RegExp(loginPageRegex).test(this.state.url))
      return;
    this.hideLoadingScreen();
  }

  onNewWindow(e): void {
    //if webview tries to open new window, open it in default browser
    //TODO: probably needs more fine grained control for cases where new window should stay logged in
    const protocol = require('url').parse(e.url).protocol
    if (protocol === 'http:' || protocol === 'https:') {
      shell.openExternal(e.url)
    }
  }

  render() {
    return (
      <div>
        <WebView id="webview" preload="./preload-launcher.js" webpreferences="webSecurity=no" className="mainPosition"
          src={this.state.url} partition="persist:services" onDidNavigate={e => this.onDidNavigate(e.target.src)}
          style={{display: this.state.showLoadingScreen ? 'none' : 'block' }}
          onDidFailLoad={(code, desc, url, isMain) => {if(isMain)this.hideLoadingScreen(); console.log(`failed loading ${url}: ${code} ${desc}`)}}
          onLoadCommit={e => {if(e.isMainFrame){console.log("LoadCommit", e);this.showLoadingScreen();}}}
          onNewWindow={e => this.onNewWindow(e)}
          onWillNavigate={e => console.log("WillNavigate", e)}
          onDidStartLoading={e => console.log("DidStartLoading", e)}
          onDidStartNavigation={e => console.log("DidStartNavigation", e)}
          onDidFinishLoad={e => {console.log("DidFinishLoad", e);this.maybeHideLoadingScreen()}}
          onDidStopLoading={e => {console.log("DidStopLoading", e);this.maybeHideLoadingScreen()}}
          ></WebView>
        <div id="loadingScreen" className="mainPosition" style={{display: this.state.showLoadingScreen ? 'block' : 'none' }}>
          <div className="loadingTextBlock">
            <div className="centerText inspirationalText"><div>{this.state.inspirationalText}</div></div>
            <div className="centerText legalText"><div>{this.state.legalText}</div></div>
          </div>
        </div>
      </div>
    );
  }
}

export default Webview;