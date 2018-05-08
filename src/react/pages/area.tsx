import * as React from "react";
import { Component } from "react";
import { Route } from "react-router-dom";
import { withRouter, Redirect } from "react-router";
import { graphql, compose } from "react-apollo";
import { me } from "../queries/auth";

import Dashboard from "./dashboard";
import Navigation from "./navigation";
import Webview from "./webview";
import Settings from "./settings";



class Area extends Component {
  state = {
    app: "vipfy"
  }

  setapp = appname => {
    this.setState({app: appname})
    this.props.history.push("/area/webview")
  }

  loggedIn = async () => {
    console.log("LoggedIn", this)
    try {
      const res = await this.props.me.refetch()
      console.log("LoggedIn", res)
      if (res) {return true}
    }
    catch(err) {
      console.log("ErrorLI", err)
      this.props.history.push("/")
      return false
    }
    this.props.history.push("/")
    return false
  }

  render() {
    console.log("AREA")
    if (this.loggedIn()) {
      return (
        <div className="area">
          <Route render={
                (props) => (<Navigation setapp={this.setapp}  {...this.props} {...props} />)}/>
          <Route exact path="/area/dashboard" render={
                (props) => (<Dashboard {...props} setapp={this.setapp} {...this.props}/>)} />
          <Route exact path="/area/webview" render={
                (props) => (<Webview app={this.state.app} {...props} />)}/>
          <Route exact path="/area/settings" render={
                (props) => (<Settings {...props} {...this.props} />)}/>
        </div>
      );
    } else {
      console.log("AREA FALSE")
      return ""
    }
  }
}

export default compose(
  graphql(me, {
  name: "me",
  options: { fetchPolicy: "network-only" }
  }))
(withRouter(Area, history))