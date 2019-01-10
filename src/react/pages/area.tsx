import * as React from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import { graphql, compose, Query, withApollo } from "react-apollo";

import Advisor from "./advisor";
import AppPage from "./apppage";
import Billing from "./billing";
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
import UsageStatistics from "./usagestatistics";
import UsageStatisticsBoughtplan from "./usagestatisticsboughtplans";

import { fetchLicences, me } from "../queries/auth";
// import { fetchRecommendedApps } from "../queries/products";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import SupportPage from "./support";
import Security from "./security";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import Integrations from "./integrations";
import AppAdmin from "./appadmin";
import LoadingDiv from "../components/LoadingDiv";
import ServiceEdit from "../components/admin/ServiceEdit";
import ViewHandler from "./viewhandler";
import Tabs from "../components/Tabs";

interface AreaProps {
  history: any[];
  fetchLicences: any;
  login: boolean;
  logMeOut: () => void;
  location: any;
  userData: any;
  userid: number;
  client: ApolloClient<InMemoryCache>;
  moveTo: Function;
  sidebarloaded: Function;
}

interface AreaState {
  app: number;
  licenceID: number;
  viewID: number;
  chatOpen: boolean;
  sideBarOpen: boolean;
  domain: string;
  script: Element | null;
  script3: Element | null;
  webviews: any[];
  oldWebViews: any[];
  openInstances: any;
  activeTab: null | object;
}

class Area extends React.Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1, //Very Old style - should be removed sometime
    licenceID: -1, //Old style - should be removed sometime
    viewID: -1,
    chatOpen: false,
    sideBarOpen: true,
    domain: "",
    script: null,
    script3: null,
    webviews: [],
    oldWebViews: [],
    openInstances: {},
    activeTab: null
  };

  componentDidMount = async () => {
    require("electron").ipcRenderer.on("change-page", (event, page) => {
      this.props.history.push(page);
    });

    const meme = await this.props.client.query({ query: me });

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
      script3.innerHTML = `zE(function() {zE.identify(${datascript});});`;
      script3.id = "ze-snippet3";
      script3.async = false;

      document.head.appendChild(script3);

      this.setState({ script3 });
    };
    this.setState({ script });
    document.head.appendChild(script);

    //this.addWebview(1171);
    //this.addWebview(1001);
    //this.addWebview(1001);
    //this.addWebview(1001);
  };

  componentWillUnmount() {
    //console.log("AREA UNMOUNT");
    /*if (this.state.script) {
      console.log(this.state.script);
      document.head.removeChild(this.state.script);
    }*/
  }

  moveTo = path => {
    if (!path.startsWith("app")) {
      this.setState({ viewID: -1 });
    }
    /*if (!(this.props.location.pathname === path)) {
      this.props.history.push(path);
    }*/
    this.props.moveTo(path);
  };

  setApp = (boughtplan: number) => {
    if (this.state.openInstances[boughtplan]) {
      this.setState(prevState => {
        const newstate = {
          ...prevState,
          app: boughtplan,
          licenceID: boughtplan,
          viewID: Object.keys(prevState.openInstances[boughtplan])[0]
        };
        return newstate;
      });
      this.props.history.push(`/area/app/${boughtplan}`);
    } else {
      this.addWebview(boughtplan, true);
      this.props.history.push(`/area/app/${boughtplan}`);
    }
  };

  setDomain = (boughtplan: number, domain: string) => {
    this.setState({ app: boughtplan, licenceID: boughtplan, domain });
    this.props.history.push(`/area/app/${boughtplan}`);
  };

  componentDidCatch(error, info) {
    this.moveTo("/area/error");
  }

  setSidebar = value => {
    this.setState({ sideBarOpen: value });
  };

  toggleChat = () => {
    this.setState(prevState => ({ chatOpen: !prevState.chatOpen }));
  };

  toggleSidebar = () => {
    this.setState(prevState => ({ sideBarOpen: !prevState.sideBarOpen }));
  };

  addWebview = (licenceID, opendirect = false) => {
    const webviews = this.state.webviews;
    const l = { licenceID: licenceID, plain: true, setViewTitle: this.setViewTitle };
    const newview = <Webview {...this.state} {...this.props} {...l} />;
    this.setState(prevState => {
      const viewID = Math.max(...prevState.webviews.map(o => o.key), 0) + 1;
      const l = { licenceID: licenceID, plain: true, setViewTitle: this.setViewTitle, viewID };
      const newview = <Webview {...this.state} {...this.props} {...l} />;
      return {
        webviews: [
          ...prevState.webviews,
          {
            key: viewID,
            view: newview,
            instanceTitle: "Login",
            licenceID
          }
        ],
        openInstances: {
          ...prevState.openInstances,
          [licenceID]:
            prevState.openInstances && prevState.openInstances[licenceID]
              ? {
                  ...prevState.openInstances[licenceID],

                  [viewID]: { instanceTitle: "Login", instanceId: viewID }
                }
              : {
                  [viewID]: { instanceTitle: "Login", instanceId: viewID }
                }
        },
        app: opendirect ? licenceID : prevState.app,
        licenceID: opendirect ? licenceID : prevState.licenceID,
        viewID: opendirect ? viewID : prevState.viewID
      };
    });
  };

  setViewTitle = (title, viewID, licenceID) => {
    this.setState(prevState => ({
      openInstances: {
        ...prevState.openInstances,
        [licenceID]:
          prevState.openInstances &&
          prevState.openInstances[licenceID] &&
          prevState.openInstances[licenceID][viewID]
            ? {
                ...prevState.openInstances[licenceID],
                [viewID]: {
                  instanceTitle: title,
                  instanceId: viewID
                }
              }
            : { ...prevState.openInstances[licenceID] }
      },
      webviews: prevState.webviews.map(view => {
        if (view.key == viewID) {
          view.instanceTitle = title;
        }
        return view;
      })
    }));
  };

  closeInstance = (viewID: number, licenceID: number) => {
    const position = this.state.webviews.findIndex(view => view.key == viewID);

    this.setState(prevState => {
      const webviews = prevState.webviews.filter(view => view.key != viewID);
      const { openInstances } = prevState;

      if (openInstances[licenceID]) {
        if (openInstances[licenceID].length > 1) {
          delete openInstances[licenceID][viewID];
        } else {
          delete openInstances[licenceID];
        }
      }

      return { webviews, openInstances };
    });

    if (this.state.viewID == viewID) {
      if (this.props.history.location.pathname.startsWith("/area/app/")) {
        this.setState(prevState => {
          if (prevState.webviews[position]) {
            return { ...prevState, viewID: prevState.webviews[position].key };
          } else if (prevState.webviews[0]) {
            return { ...prevState, viewID: prevState.webviews[prevState.webviews.length - 1].key };
          } else {
            this.props.moveTo("dashboard");
            return prevState;
          }
        });
      }
    }
  };

  setInstance = viewID => {
    const licenceID = this.state.webviews.find(e => e.key == viewID).licenceID;
    this.setState({ app: licenceID, licenceID, viewID });
    this.props.history.push(`/area/app/${licenceID}`);
  };

  handleDragStart = (viewID: number) => {
    this.setState(prevState => {
      const activeTab = prevState.webviews.find(tab => tab.key == viewID);

      return { activeTab, oldWebViews: prevState.webviews };
    });
  };

  handleDragOver = async (viewID: number) => {
    await this.setState(prevState => {
      const webviews = prevState.webviews.map(tab => {
        if (tab.key == viewID) {
          return prevState.activeTab;
        } else if (prevState.activeTab!.key == tab.key) {
          return prevState.webviews.find(tab => tab.key == viewID);
        } else {
          return tab;
        }
      });
      return { webviews };
    });
  };

  handleDragLeave = async () => await this.setState({ webviews: this.state.oldWebViews });

  handleDragEnd = () => this.setState({ activeTab: null, webviews: this.state.oldWebViews });

  handleClose = (viewID: number, licenceID: number) => {
    this.setState(prevState => {
      const webviews = prevState.webviews.filter(view => view.key != viewID);

      return { webviews };
    });

    this.closeInstance(viewID, licenceID);
  };

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
      { path: "usage", component: UsageStatistics },
      { path: "usage/boughtplan/:boughtplanid", component: UsageStatisticsBoughtplan },
      //{ path: "support", component: SupportPage },
      { path: "error", component: ErrorPage },
      { path: "admin", component: AdminDashboard, admin: true },
      { path: "admin/service-creation", component: ServiceCreation, admin: true },
      { path: "admin/service-edit", component: ServiceEdit, admin: true },
      { path: "appadmin", component: AppAdmin }
    ];

    if (this.props.licences.loading) {
      return <LoadingDiv text="Preparing Vipfy..." />;
    }

    return (
      <div className="area">
        <Route
          render={props => {
            if (!this.props.location.pathname.includes("advisor")) {
              return (
                <Sidebar
                  sideBarOpen={sideBarOpen}
                  setApp={this.setApp}
                  viewID={this.state.viewID}
                  openInstances={this.state.openInstances}
                  toggleSidebar={this.toggleSidebar}
                  setInstance={this.setInstance}
                  {...this.props}
                  {...props}
                  moveTo={this.moveTo}
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
        <ViewHandler
          showView={this.state.viewID}
          views={this.state.webviews}
          sideBarOpen={sideBarOpen}
        />
        <Tabs
          tabs={this.state.webviews}
          setInstance={this.setInstance}
          viewID={this.state.viewID}
          handleDragStart={this.handleDragStart}
          handleDragOver={this.handleDragOver}
          handleDragEnd={this.handleDragEnd}
          handleDragLeave={this.handleDragLeave}
          handleClose={this.handleClose}
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
