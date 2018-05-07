import * as React from "react";
import { Component } from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import Dashboard from "./dashboard";
import Navigation from "./navigation";
import Webview from "./webview";



class Area extends Component<undefined, undefined> {



  render() {
    console.log("RENDER AREA", this)

    return (
      <div className="area">
        <Route component={Navigation} />
        <Route exact path="/area/dashboard" component={Dashboard} />
        <Route exact path="/area/webview" component={Webview} />
      </div>
    );
  }
}

export default withRouter(Area, history);