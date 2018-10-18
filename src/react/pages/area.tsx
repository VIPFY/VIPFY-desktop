import * as React from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import { graphql, compose, Query } from "react-apollo";

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

import { fetchLicences } from "../queries/auth";
import { fetchRecommendedApps } from "../queries/products";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import SupportPage from "./support";
import Security from "./security";

interface AreaProps {
  history: any[];
  fetchLicences: any;
  login: boolean;
  logMeOut: () => void;
  location: any;
  userData: any;
  userid: number;
}

interface AreaState {
  app: number;
  chatOpen: boolean;
  sideBarOpen: boolean;
  domain: string;
}

class Area extends React.Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1,
    chatOpen: false,
    sideBarOpen: true,
    domain: ""
  };

  componentDidMount = async () => {
    require("electron").ipcRenderer.on("change-page", (event, page) => {
      this.props.history.push(page);
    });
  };

  moveTo = path => {
    if (!(this.props.location.pathname === path)) {
      this.props.history.push(path);
    }
  };

  setApp = (boughtplan: number) => {
    console.log("SetApp to boughtplan ", boughtplan);
    this.setState({ app: boughtplan });
    this.props.history.push(`/area/app/${boughtplan}`);
  };

  setDomain = (boughtplan: number, domain: string) => {
    this.setState({ app: boughtplan, domain });
    this.props.history.push(`/area/app/${boughtplan}`);
  };

  setSidebar = value => this.setState({ sideBarOpen: value });

  toggleChat = () => this.setState(prevState => ({ chatOpen: !prevState.chatOpen }));

  toggleSidebar = () => this.setState(prevState => ({ sideBarOpen: !prevState.sideBarOpen }));

  render() {
    const { sideBarOpen, chatOpen } = this.state;
    const routes = [
      { path: "dashboard", component: Dashboard },
      { path: "dashboard/:overlay", component: Dashboard },
      { path: "settings", component: Settings },
      { path: "profile", component: Profile },
      { path: "team", component: Team },
      { path: "security", component: Security },
      { path: "messagecenter", component: MessageCenter },
      { path: "messagecenter/:person", component: MessageCenter },
      { path: "billing", component: Billing },
      { path: "advisor", component: Advisor },
      { path: "advisor/:typeid", component: Advisor },
      { path: "marketplace", component: Marketplace },
      { path: "marketplace/:appid/", component: AppPage },
      { path: "marketplace/:appid/:action", component: AppPage },
      { path: "support", component: SupportPage }
    ];

    return (
      <div className="area">
        <Route
          render={props => {
            if (!this.props.location.pathname.includes("advisor")) {
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
            if (!this.props.location.pathname.includes("advisor")) {
              return (
                <Query query={FETCH_NOTIFICATIONS} pollInterval={600000}>
                  {res => (
                    <Navigation
                      chatOpen={chatOpen}
                      sideBarOpen={sideBarOpen}
                      setApp={this.setApp}
                      toggleChat={this.toggleChat}
                      toggleSidebar={this.toggleSidebar}
                      {...this.props}
                      {...props}
                      {...res}
                    />
                  )}
                </Query>
              );
            } else {
              return "";
            }
          }}
        />
        <Route render={props => <Chat chatOpen={chatOpen} {...this.props} {...props} />} />

        <Route
          exact
          path="/area/app/:licenceid"
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
                    !this.props.location.pathname.includes("advisor") ? "full-working" : ""
                  } ${chatOpen ? "chat-open" : ""} ${
                    sideBarOpen && !props.location.pathname.includes("advisor")
                      ? "side-bar-open"
                      : ""
                  }`}>
                  <RouteComponent
                    setApp={this.setApp}
                    {...this.props}
                    {...props}
                    moveTo={this.moveTo}
                  />
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
  graphql(fetchLicences, {
    name: "licences"
  }),
  graphql(fetchRecommendedApps, {
    name: "rcApps"
  })
)(withRouter(Area));
