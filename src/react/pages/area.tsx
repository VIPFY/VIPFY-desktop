import * as React from "react";
import { Component } from "react";
import { Route } from "react-router-dom";
import { graphql, compose } from "react-apollo";
import { me, fetchLicences } from "../queries/auth";
import { fetchRecommendedApps } from "../queries/products";

import Advisor from "./advisor";
import AppPage from "./apppage";
import Billing from "./billing";
import Chat from "./chat";
import Dashboard from "./dashboard";
import Domains from "./domains";
import Marketplace from "./marketplace";
import MessageCenter from "./messagecenter";
import Navigation from "./navigation";
import Settings from "./settings";
import Sidebar from "./sidebar";
import Team from "./team";
import Webview from "./webview";

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
  domain: string;
};

class Area extends Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1,
    chatopen: false,
    sidebaropen: true,
    domain: ""
  };

  setApp = (boughtplan: number) => {
    console.log("SetApp to boughtplan ", boughtplan);
    this.setState({ app: boughtplan });
    this.props.history.push("/area/webview");
  };

  setDomain = (boughtplan: number, domain: string) => {
    this.setState({ app: boughtplan, domain });
    this.props.history.push("/area/webview");
  };

  toggleChat = () => this.setState({ chatopen: !this.state.chatopen });

  toggleSidebar = () => this.setState({ sidebaropen: !this.state.sidebaropen });

  setSidebar = value => this.setState({ sidebaropen: value });

  render() {
    return (
      <div className="area">
        <Route
          render={props => {
            if (!props.location.pathname.includes("advisor")) {
              return (
                <Sidebar
                  sidebaropen={this.state.sidebaropen}
                  setApp={this.setApp}
                  {...this.props}
                  {...props}
                />
              );
            } else {
              return "";
            }
          }}
        />
        <Route
          render={props => {
            if (!props.location.pathname.includes("advisor")) {
              return (
                <Navigation
                  chatopen={this.state.chatopen}
                  setApp={this.setApp}
                  toggleChat={this.toggleChat}
                  toggleSidebar={this.toggleSidebar}
                  sidebaropen={this.state.sidebaropen}
                  {...this.props}
                  {...props}
                />
              );
            } else {
              return "";
            }
          }}
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
              setApp={this.setApp}
              {...this.props}
              {...props}
            />
          )}
        />
        <Route
          exact
          path="/area/webview"
          render={props => <Webview {...this.state} {...this.props} {...props} />}
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
              setSidebar={this.setSidebar}
              {...this.props}
              {...props}
            />
          )}
        />
        <Route
          exact
          path="/area/advisor/:typeid"
          render={props => (
            <Advisor
              chatopen={this.state.chatopen}
              sidebaropen={this.state.sidebaropen}
              setSidebar={this.setSidebar}
              {...this.props}
              {...props}
            />
          )}
        />
        <Route
          exact
          path="/area/domains/"
          render={props => (
            <Domains
              chatopen={this.state.chatopen}
              sidebaropen={this.state.sidebaropen}
              setDomain={this.setDomain}
              {...this.props}
              {...props}
            />
          )}
        />
        <Route
          exact
          path="/area/domains/:domain"
          render={props => (
            <Domains
              chatopen={this.state.chatopen}
              sidebaropen={this.state.sidebaropen}
              setDomain={this.setDomain}
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
              setApp={this.setApp}
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
