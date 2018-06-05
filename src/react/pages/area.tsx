import * as React from "react";
import { Component } from "react";
import { Route } from "react-router-dom";
import { graphql, compose } from "react-apollo";
import { me, fetchLicences } from "../queries/auth";
import { fetchRecommendedApps } from "../queries/products";

import Dashboard from "./dashboard";
import Navigation from "./navigation";
import Sidebar from "./sidebar";
import Chat from "./chat";
import Webview from "./webview";
import Settings from "./settings";
import Marketplace from "./marketplace";
import AppPage from "./apppage";
import Billing from "./billing";
import Advisor from "./advisor";

export type AreaProps = {
  history: any[];
  me: any;
  fetchLicences: any;
};

export type AreaState = {
  app: string;
  chatopen: boolean;
  sidebaropen: boolean;
};

class Area extends Component<AreaProps, AreaState> {
  state: AreaState = {
    app: "vipfy",
    chatopen: false,
    sidebaropen: true
  };

  setapp = appname => {
    console.log(appname);
    this.setState({ app: appname });
    this.props.history.push("/area/webview");
  };

  toggleChat = () => {
    this.setState({ chatopen: !this.state.chatopen });
  };

  toggleSidebar = () => {
    this.setState({ sidebaropen: !this.state.sidebaropen });
  };

  loggedIn = async () => {
    try {
      const res = await this.props.me.refetch();
      if (res) {
        return true;
      }
    } catch (err) {
      console.log("ErrorLI", err);
      this.props.history.push("/");
      return false;
    }
    this.props.history.push("/");
    return false;
  };

  render() {
    if (this.loggedIn()) {
      console.log("AREA", this.props);
      return (
        <div className="area">
          <Route
            render={props => (
              <Sidebar
                sidebaropen={this.state.sidebaropen}
                setapp={this.setapp}
                {...this.props}
                {...props}
              />
            )}
          />
          <Route
            render={props => (
              <Navigation
                chatopen={this.state.chatopen}
                setapp={this.setapp}
                toggleChat={this.toggleChat}
                toggleSidebar={this.toggleSidebar}
                sidebaropen={this.state.sidebaropen}
                {...this.props}
                {...props}
              />
            )}
          />
          <Route
            render={props => <Chat chatopen={this.state.chatopen} {...this.props} {...props} />}
          />
          <Route
            exact
            path="/area/dashboard"
            render={props => (
              <Dashboard
                chatopen={this.state.chatopen}
                sidebaropen={this.state.sidebaropen}
                {...props}
                setapp={this.setapp}
                {...this.props}
              />
            )}
          />
          <Route
            exact
            path="/area/webview"
            render={props => (
              <Webview
                chatopen={this.state.chatopen}
                sidebaropen={this.state.sidebaropen}
                app={this.state.app}
                {...props}
              />
            )}
          />
          <Route
            exact
            path="/area/settings"
            render={props => (
              <Settings
                chatopen={this.state.chatopen}
                sidebaropen={this.state.sidebaropen}
                {...props}
                {...this.props}
              />
            )}
          />
          <Route
            exact
            path="/area/billing"
            render={props => (
              <Billing
                chatopen={this.state.chatopen}
                sidebaropen={this.state.sidebaropen}
                {...props}
                {...this.props}
              />
            )}
          />
          <Route
            exact
            path="/area/advisor"
            render={props => (
              <Advisor
                chatopen={this.state.chatopen}
                sidebaropen={this.state.sidebaropen}
                {...props}
                {...this.props}
              />
            )}
          />
          <Route
            exact
            path="/area/marketplace"
            render={props => (
              <Marketplace
                chatopen={this.state.chatopen}
                sidebaropen={this.state.sidebaropen}
                {...props}
                {...this.props}
              />
            )}
          />
          <Route
            path="/area/marketplace/:appid"
            render={props => (
              <AppPage
                chatopen={this.state.chatopen}
                sidebaropen={this.state.sidebaropen}
                setapp={this.setapp}
                match={this.match}
                {...this.props}
                {...props}
              />
            )}
          />
        </div>
      );
    } else {
      console.log("AREA FALSE");
      return "";
    }
  }
}

export default compose(
  graphql(me, {
    name: "me",
    options: { fetchPolicy: "network-only" }
  }),
  graphql(fetchLicences, {
    name: "licences"
  }),
  graphql(fetchRecommendedApps, {
    name: "rcApps"
  })
)(Area);
