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
      url: this.appToUrl(props.app) //passed prop as initial value
    }
  }

  private appToUrl(app: string):string {
    switch (app) {
      case "vipfy": return "https://vipfy.com";
      case "pipedrive": return "https://pipedrive.com";
      default: return "/area/dashboard?error=unknownapp";
    }
  }

  getDerivedStateFromProps(nextProps: WebViewProps, prevState: WebViewState): WebViewState | null {
    if(nextProps.app != this.props.app) {
      return { ...prevState, url: this.appToUrl(nextProps.app) }
    }
    return null;
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