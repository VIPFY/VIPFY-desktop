import * as React from "react";
import {Component} from "react";
import { Link } from "react-router-dom";

class Webview extends Component<any, any> {

  render() {

    return (
      <div>WEBVIEW
         <webview id="webview" className="mainPosition" preload="./preload-launcher.js" webpreferences="webSecurity=no" src="https://vipfy.com" partition="persist:services"></webview>
      </div>
    );
  }
}

export default Webview;