import * as React from "react";
import { Component } from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import Dashboard from "./dashboard";
import Navigation from "./navigation";
import Webview from "./webview";



class Area extends Component {
  state = {
    app: 'vipfy'
  }

  setapp = appname => {
    this.setState({app: appname})
    this.props.history.push("/area/webview")
  }

  render() {
    return (
      <div className="area">
        <Route render={
              (props) => (<Navigation setapp={this.setapp}  logMeOut={this.props.logMeOut} {...props} />)}/>
        <Route exact path="/area/dashboard" render={
              (props) => (<Dashboard {...props} setapp={this.setapp}
              firstname={this.props.firstname} lastname={this.props.lastname} profilepic={this.props.profilepicture}/>)} />
        <Route exact path="/area/webview" render={
              (props) => (<Webview app={this.state.app} {...props} />)}/>
      </div>
    );
  }
}

export default withRouter(Area, history);