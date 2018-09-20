import * as React from "react";
import { Component } from "react";

class Welcome extends Component {
  state = {};

  render() {
    return (
      <div className="welcomeHolderNew">
        <div className="logo" />
        <div className="text">
          VIPFY is very proud to have you here. If you have any question we are happy to help you :)
        </div>
      </div>
    );
  }
}
export default Welcome;
