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
import Profile from "./profile";
import Settings from "./settings";
import Sidebar from "../components/Sidebar";
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
  chatOpen: boolean;
  sideBarOpen: boolean;
  domain: string;
};

class Area extends Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1,
    chatOpen: false,
    sideBarOpen: true,
    domain: ""
  };

  componentDidMount() {
    require("electron").ipcRenderer.on("change-page", (event, page) => {
      this.props.history.push(page);
    });
  }

  setApp = (boughtplan: number) => {
    console.log("SetApp to boughtplan ", boughtplan);
    this.setState({ app: boughtplan });
    this.props.history.push("/area/webview");
  };

  setDomain = (boughtplan: number, domain: string) => {
    this.setState({ app: boughtplan, domain });
    this.props.history.push("/area/webview");
  };

  toggleChat = () => this.setState(prevState => ({ chatOpen: !prevState.chatOpen }));

  toggleSidebar = () => this.setState(prevState => ({ sideBarOpen: !prevState.sideBarOpen }));

  setSidebar = value => this.setState({ sideBarOpen: value });

  render() {
    const { sideBarOpen, chatOpen } = this.state;

    const routes = [
      { path: "dashboard", component: Dashboard },
      { path: "settings", component: Settings },
      { path: "profile", component: Profile },
      { path: "team", component: Team },
      { path: "messagecenter", component: MessageCenter },
      { path: "messagecenter/:person", component: MessageCenter },
      { path: "billing", component: Billing },
      { path: "advisor", component: Advisor },
      { path: "advisor/:typeid", component: Advisor },
      { path: "marketplace", component: Marketplace },
      { path: "marketplace/:appid/", component: Marketplace },
      { path: "marketplace/:appid/:action", component: Marketplace }
    ];

    return (
      <div className="area">
        <Route
          render={props => {
            if (!props.location.pathname.includes("advisor")) {
              return (
                <Sidebar
                  sideBarOpen={sideBarOpen}
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
                  chatOpen={chatOpen}
                  sideBarOpen={sideBarOpen}
                  setApp={this.setApp}
                  toggleChat={this.toggleChat}
                  toggleSidebar={this.toggleSidebar}
                  {...this.props}
                  {...props}
                />
              );
            } else {
              return "";
            }
          }}
        />
        <Route render={props => <Chat chatOpen={chatOpen} {...this.props} {...props} />} />

        <Route
          exact
          path="/area/webview"
          render={props => <Webview {...this.state} {...this.props} {...props} />}
        />

        {routes.map(({ path, component }) => {
          const RouteComponent = component;

          return (
            <Route
              key={path}
              exact
              path={`/area/${path}`}
              render={props => (
                <div
                  className={`${
                    !props.location.pathname.includes("advisor") ? "full-working" : ""
                  } ${chatOpen ? "chat-open" : ""} ${
                    sideBarOpen && !props.location.pathname.includes("advisor")
                      ? "side-bar-open"
                      : ""
                  }`}>
                  <RouteComponent setApp={this.setApp} {...this.props} {...props} />
                </div>
              )}
            />
          );
        })}

        <Route
          exact
          path="/area/domains/"
          render={props => (
            <div
              className={`full-working ${chatOpen ? "chat-open" : ""} ${
                sideBarOpen ? "side-bar-open" : ""
              }`}>
              <Domains setDomain={this.setDomain} {...this.props} {...props} />
            </div>
          )}
        />

        <Route
          exact
          path="/area/domains/:domain"
          render={props => (
            <div
              className={`full-working ${chatOpen ? "chat-open" : ""} ${
                sideBarOpen ? "side-bar-open" : ""
              }`}>
              <Domains setDomain={this.setDomain} {...this.props} {...props} />
            </div>
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
