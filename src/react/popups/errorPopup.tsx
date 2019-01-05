import * as React from "react";
import { Component } from "react";

class ErrorPopup extends Component {
  state = {};

  render() {
    return <div className="error-Popup">{this.props.sentence}</div>;
  }
}
export default ErrorPopup;
