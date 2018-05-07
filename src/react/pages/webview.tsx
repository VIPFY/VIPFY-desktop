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
}

export type WebViewProps = {
  app: string;
}

export class Webview extends Component<WebViewProps, WebViewState> {

  static defaultProps = { app: 'vipfy' }

  constructor(props) {
    super(props);
    this.state = {
      url: Webview.appToUrl(props.app), //passed prop as initial value
      inspirationalText: "Loading",
      legalText: "Legal Text",
      showLoadingScreen: false,
    }
  }

  private static appToUrl(app: string):string {
    switch (app) {
      case "vipfy": return "https://vipfy.com";
      case "pipedrive": return "https://pipedrive.com";
      default: return "/area/dashboard?error=unknownapp";
    }
  }

  static getDerivedStateFromProps(nextProps: WebViewProps, prevState: WebViewState): WebViewState | null {
    return { ...prevState, url: Webview.appToUrl(nextProps.app) };
  }

  onDidNavigate(url: string): void {
    this.setState({
      url: url
    })
    console.log("URL", url)
  }

  hideLoadingScreen(): void {
    this.setState({ showLoadingScreen: false });
  }

  showLoadingScreen(): void {
    this.setState({ showLoadingScreen: true });
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
    console.log("WEBVIEW", this.props.app)
    return (
      <div>WEBVIEW
        <WebView id="webview" preload="./preload-launcher.js" webpreferences="webSecurity=no" className="mainPosition"
          src={this.state.url} partition="persist:services" onDidNavigate={e => this.onDidNavigate(e.target.src)}
          style={{display: this.state.showLoadingScreen ? 'none' : 'block' }}
          onDidFailLoad={(code, desc, url, isMain) => {this.hideLoadingScreen(); console.log(`failed loading ${url}: ${code} ${desc}`)}}
          onDidStartLoading={e => this.showLoadingScreen()} onDidStopLoading={e => this.hideLoadingScreen()}
          onNewWindow={e => this.onNewWindow(e)}></WebView>
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