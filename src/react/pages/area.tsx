import * as React from "react";
import { Component } from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import Dashboard from "./dashboard";
import Navigation from "./navigation";



class Area extends Component<undefined, undefined> {



  render() {
    console.log("RENDER AREA", this)

    return (
      <div className="area">
        <Route component={Navigation} />
        <Route path="/area/dashboard" component={Dashboard} />
      </div>
    );
  }
}

export default withRouter(Area, history);