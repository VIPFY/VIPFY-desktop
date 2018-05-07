import * as React from "react";
import {Component} from "react";
import { Link } from "react-router-dom";

class Webview extends Component {

  render() {
    console.log("WEBVIEW", this.props.app)
    return (
      <div>{this.props.app}
        <Link to="/area/bug">LINK</Link>
      </div>
    );
  }
}

export default Webview;