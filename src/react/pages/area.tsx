import * as React from "react";
import { Component } from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import Dashboard from "./dashboard";
import Navigation from "./navigation";
import Webview from "./webview";



class Area extends Component {
  state = {
    app: null
  }

  setapp = appname => {
    console.log("SETAPP", this)
    this.setState({app: appname})
  }

  render() {
    console.log("RENDER AREA", this)

    return (
      <div className="area">
        <Route render={
              (props) => (<Navigation setapp={this.setapp} {...props} />)}/>
        <Route exact path="/area/dashboard" component={Dashboard} />
        <Route exact path="/area/webview" render={
              (props) => (<Webview app={this.state.app} {...props} />)}/>
      </div>
    );
  }
}

export default withRouter(Area, history);