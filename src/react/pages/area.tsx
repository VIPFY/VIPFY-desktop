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
import Team from "./team";
import MessageCenter from "./messagecenter";
import Domains from "./domains";

export type AreaProps = {
  history: any[];
  me: any;
  fetchLicences: any;
  logMeOut: () => void;
};

export type AreaState = {
  app: number;
  chatopen: boolean;
  sidebaropen: boolean;
};

class Area extends Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1,
    chatopen: false,
    sidebaropen: true
  };

  setapp = (boughtplan: number) => {
    console.log("SetApp to boughtplan ", boughtplan);
    this.setState({ app: boughtplan });
    this.props.history.push("/area/webview");
  };

  toggleChat = () => {
    this.setState({ chatopen: !this.state.chatopen });
  };

  toggleSidebar = () => {
    this.setState({ sidebaropen: !this.state.sidebaropen });
  };

  render() {
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
              setapp={this.setapp}
              {...this.props}
              {...props}
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
              {...this.props}
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
              {...this.props}
              {...props}
            />
          )}
        />
        <Route
          exact
          path="/area/team"
          render={props => (
            <Team
              chatopen={this.state.chatopen}
              sidebaropen={this.state.sidebaropen}
              {...this.props}
              {...props}
            />
          )}
        />
        <Route
          exact
          path="/area/messagecenter"
          render={props => (
            <MessageCenter
              chatopen={this.state.chatopen}
              sidebaropen={this.state.sidebaropen}
              {...this.props}
              {...props}
            />
          )}
        />
        <Route
          path="/area/messagecenter/:person"
          render={props => (
            <MessageCenter
              chatopen={this.state.chatopen}
              sidebaropen={this.state.sidebaropen}
              {...this.props}
              {...props}
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
              {...this.props}
              {...props}
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
              {...this.props}
              {...props}
            />
          )}
        />
        <Route
          exact
          path="/area/domains"
          render={props => (
            <Domains
              chatopen={this.state.chatopen}
              sidebaropen={this.state.sidebaropen}
              {...this.props}
              {...props}
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
              {...this.props}
              {...props}
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
              {...this.props}
              {...props}
            />
          )}
        />
      </div>
    );
  }
}

export default compose(
  // graphql(me, {
  //   name: "me",
  //   options: { fetchPolicy: "network-only" }
  // }),
  graphql(fetchLicences, {
    name: "licences"
  }),
  graphql(fetchRecommendedApps, {
    name: "rcApps"
  })
)(Area);
