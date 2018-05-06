import * as React from "react";
import { Component } from "react";
import { Route, Switch, Link } from "react-router-dom";
import { matchPath, withRouter } from "react-router";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Bug from "./pages/bug";



class App extends Component<undefined, undefined> {

  render() {
    console.log("RENDER", this)

    return (
      <div className="fullSize">
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route component={Bug} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App, history);