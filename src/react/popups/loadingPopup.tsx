import * as React from "react";
import { Component } from "react";

class LoadingPopup extends Component {
  state = {};

  render() {
    return <div className="loading">{this.props.sentence}</div>;
  }
}
export default LoadingPopup;
