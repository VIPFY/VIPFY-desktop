import * as React from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import { graphql, compose, Query, withApollo } from "react-apollo";

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
import AdminDashboard from "../components/admin/Dashboard";
import ServiceCreation from "../components/admin/ServiceCreation";
import Sidebar from "../components/Sidebar";
import Team from "./team";
import Webview from "./webview";
import ErrorPage from "./error";

import { fetchLicences, me } from "../queries/auth";
import { fetchRecommendedApps } from "../queries/products";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import SupportPage from "./support";
import Security from "./security";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import Integrations from "./integrations";
import AppAdmin from "./appadmin";
import ServiceEdit from "../components/admin/ServiceEdit";

interface AreaProps {
  history: any[];
  fetchLicences: any;
  login: boolean;
  logMeOut: () => void;
  location: any;
  userData: any;
  userid: number;
  client: ApolloClient<InMemoryCache>;
}

interface AreaState {
  app: number;
  chatOpen: boolean;
  sideBarOpen: boolean;
  domain: string;
  script: Element | null;
  script3: Element | null;
}

class Area extends React.Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1,
    chatOpen: false,
    sideBarOpen: true,
    domain: "",
    script: null,
    script3: null
  };

  componentDidMount = async () => {
    require("electron").ipcRenderer.on("change-page", (event, page) => {
      this.props.history.push(page);
    });

    const meme = await this.props.client.query({ query: me });
    console.log(meme);

    const script = document.createElement("script");

    script.src =
      "https://static.zdassets.com/ekr/snippet.js?key=dae43c43-7726-40fb-be8a-7468a19337e0";
    script.id = "ze-snippet";
    script.async = false;
    script.onload = () => {
      const script3 = document.createElement("script");

      const datascript = JSON.stringify({
        name: `${meme.data.me.firstname} ${meme.data.me.lastname}`,
        email: `${meme.data.me.emails[0].email}`,
        organization: `${meme.data.me.company.name}`
      });
      console.log(datascript);
      script3.innerHTML = `zE(function() {zE.identify(${datascript});});`;
      script3.id = "ze-snippet3";
      script3.async = false;

      document.head.appendChild(script3);

      this.setState({ script3 });
    };
    this.setState({ script });
    document.head.appendChild(script);
  };

  componentWillUnmount() {
    console.log("AREA UNMOUNT");
    /*if (this.state.script) {
      console.log(this.state.script);
      document.head.removeChild(this.state.script);
    }*/
  }

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

  componentDidCatch(error, info) {
    console.log("ERROR", error, info);
    this.moveTo("/area/error");
  }

  setSidebar = value => this.setState({ sideBarOpen: value });

  toggleChat = () => this.setState(prevState => ({ chatOpen: !prevState.chatOpen }));

  toggleSidebar = () => this.setState(prevState => ({ sideBarOpen: !prevState.sideBarOpen }));

  render() {
    const { sideBarOpen, chatOpen } = this.state;
    const routes = [
      { path: "", component: Dashboard },
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
      { path: "integrations", component: Integrations },
      //{ path: "support", component: SupportPage },
      { path: "error", component: ErrorPage },
      { path: "admin", component: AdminDashboard, admin: true },
      { path: "admin/service-creation", component: ServiceCreation, admin: true },
      { path: "admin/service-edit", component: ServiceEdit, admin: true },
      { path: "appadmin", component: AppAdmin }
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

        <Route
          exact
          path="/area/support"
          render={props => <SupportPage {...this.state} {...this.props} {...props} />}
        />

        {routes.map(({ path, component, admin }) => {
          const RouteComponent = component;

          if (admin && this.props.company.unit.id != 14) {
            return;
          } else {
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
          }
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
  }) /*
  graphql(fetchRecommendedApps, {
    name: "rcApps"
  }),*/,
  withApollo
)(withRouter(Area));
