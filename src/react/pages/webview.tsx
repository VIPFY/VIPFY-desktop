import * as React from "react";
import {Component} from "react";
import { Link } from "react-router-dom";

class Webview extends Component {

  render() {

    return (
      <div>WEBVIEW
        <Link to="/area/bug">LINK</Link>
      </div>
    );
  }
}

export default Webview;