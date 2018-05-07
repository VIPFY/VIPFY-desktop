import * as React from "react";
import { Component } from "react";
import { Route, Switch, Link } from "react-router-dom";
import { matchPath, withRouter, Redirect } from "react-router";

import Dashboard from "./dashboard";
import Bug from "./bug";



class Area extends Component<undefined, undefined> {



  render() {
    console.log("RENDER AREA", this)

    return (
      <div className="area">
        <Switch>
          <Route path="/area/dashboard" component={Dashboard} />
          <Route component={Bug} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(Area, history);