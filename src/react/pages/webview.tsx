import * as React from "react";
import {Component, ReactPropTypes} from "react";
import { Link } from "react-router-dom";
import WebView = require('react-electron-web-view');

export type WebViewState = {
  url: string;
}

export type WebViewProps = {
  app: string;
}

export class Webview extends Component<WebViewProps, WebViewState> {

  static defaultProps = { app: 'vipfy' }

  constructor(props) {
    super(props);
    this.state = {
      url: Webview.appToUrl(props.app) //passed prop as initial value
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

  render() {
    console.log("WEBVIEW", this.props.app)
    return (
      <div>
         <WebView id="webview" preload="./preload-launcher.js" webpreferences="webSecurity=no"
          src={this.state.url} partition="persist:services" onDidNavigate={e => this.onDidNavigate(e.target.src)}></WebView>
      </div>
    );
  }
}

export default Webview;