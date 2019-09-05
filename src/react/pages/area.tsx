import * as React from "react";
import { Route } from "react-router-dom";
import { withRouter, Switch } from "react-router";

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
import Webview from "./webview";
import ErrorPage from "./error";
import UsageStatistics from "./usagestatistics";
import UsageStatisticsBoughtplan from "./usagestatisticsboughtplans";

import { fetchLicences } from "../queries/auth";
// import { fetchRecommendedApps } from "../queries/products";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import SupportPage from "./support";
import Security from "./security";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import Integrations from "./integrations";
import LoadingDiv from "../components/LoadingDiv";
import ServiceEdit from "../components/admin/ServiceEdit";
import ViewHandler from "./viewhandler";
import Tabs from "../components/Tabs";
import SsoConfigurator from "./ssoconfigurator";
import SsoTester from "./SSOtester";
import ServiceCreationExternal from "../components/admin/ServiceCreationExternal";
import { SideBarContext } from "../common/context";
import EmployeeOverview from "./manager/employeeOverview";
import EmployeeDetails from "./manager/employeeDetails";
import TeamOverview from "./manager/teamOverview";
import TeamDetails from "./manager/teamDetails";
import ServiceOverview from "./manager/serviceOverview";
import ServiceDetails from "./manager/serviceDetails";
import Consent from "../popups/universalPopups/Consent";
import UniversalLogin from "./universalLogin";
import UniversalLoginTest from "../components/admin/UniversalLoginTest";
import PendingIntegrations from "../components/admin/PendingIntegrations";
import ResizeAware from "react-resize-aware";
import HistoryButtons from "../components/HistoryButtons";
import CompanyDetails from "./manager/companyDetails";
import ForcedPasswordChange from "../popups/universalPopups/ForcedPasswordChange";

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
  consent?: boolean;
  style?: Object;
  needspasswordchange: boolean;
  emails: string[];
}

interface AreaState {
  app: number;
  licenceID: number;
  viewID: number;
  chatOpen: boolean;
  sidebarOpen: boolean;
  domain: string;
  script: Element | null;
  script3: Element | null;
  webviews: any[];
  oldWebViews: any[];
  openInstances: any;
  activeTab: null | object;
  adminOpen: boolean;
  consentPopup: boolean;
}

class Area extends React.Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1, //Very Old style - should be removed sometime
    licenceID: -1, //Old style - should be removed sometime
    viewID: -1,
    chatOpen: false,
    sidebarOpen: true,
    domain: "",
    script: null,
    script3: null,
    webviews: [],
    oldWebViews: [],
    openInstances: {},
    activeTab: null,
    adminOpen: false,
    consentPopup: false
  };

  componentDidMount = async () => {
    require("electron").ipcRenderer.on("change-page", (_event, page) => {
      this.props.history.push(page);
    });

    /*const meme = await this.props.client.query({ query: me });

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
    document.head.appendChild(script);*/

    if (this.props.consent === null) {
      this.setState({ consentPopup: true });
    }
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
    console.error(error, info);
    this.moveTo("error");
  }

  setSidebar = value => {
    this.setState({ sidebarOpen: value });
  };

  toggleChat = () => {
    this.setState(prevState => ({ chatOpen: !prevState.chatOpen }));
  };

  toggleAdmin = () => {
    this.setState(prevState => ({ adminOpen: !prevState.adminOpen }));
  };

  toggleSidebar = () => {
    this.setState(prevState => ({ sidebarOpen: !prevState.sidebarOpen }));
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
            instanceTitle: "Opening new service",
            licenceID
          }
        ],
        openInstances: {
          ...prevState.openInstances,
          [licenceID]:
            prevState.openInstances && prevState.openInstances[licenceID]
              ? {
                  ...prevState.openInstances[licenceID],

                  [viewID]: { instanceTitle: "Opening new service", instanceId: viewID }
                }
              : {
                  [viewID]: { instanceTitle: "Opening new service", instanceId: viewID }
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

  /*  setInstanceUrl = (viewID: number, url: string) => {
    const view = this.state.webviews.find(view => view.key == viewID);
    view.view.props.forceUrl = url;
  }; */

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
            this.props.moveTo(`app/${prevState.webviews[position].licenceID}`);
            return { ...prevState, viewID: prevState.webviews[position].key };
          } else if (prevState.webviews[0]) {
            this.props.moveTo(`app/${prevState.webviews[prevState.webviews.length - 1].licenceID}`);
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
    const { sidebarOpen, chatOpen } = this.state;
    const routes = [
      { path: "", component: Dashboard },
      { path: "dashboard", component: Dashboard },
      { path: "dashboard/:overlay", component: Dashboard },
      { path: "settings", component: Settings },
      { path: "profile", component: Profile },
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
      { path: "admin/service-creation-external", component: ServiceCreationExternal, admin: true },
      { path: "admin/service-creation", component: ServiceCreation, admin: true },
      { path: "admin/service-edit", component: ServiceEdit, admin: true },
      { path: "admin/pending-integrations", component: PendingIntegrations, admin: true },
      { path: "ssoconfig", component: SsoConfigurator, admin: true },
      { path: "ssotest", component: SsoTester, admin: true },
      { path: "emanager", component: EmployeeOverview, admin: true },
      { path: "lmanager", component: ServiceOverview, admin: true },
      { path: "dmanager", component: TeamOverview, admin: true },
      { path: "emanager/:userid", component: EmployeeDetails, admin: true },
      { path: "profile/:userid", component: EmployeeDetails, addprops: { profile: true } },
      { path: "lmanager/:serviceid", component: ServiceDetails, admin: true },
      { path: "dmanager/:teamid", component: TeamDetails, admin: true },
      { path: "admin/universal-login-test", component: UniversalLoginTest, admin: true },
      { path: "universallogin", component: UniversalLogin },
      { path: "company", component: CompanyDetails, admin: true }
    ];

    if (this.props.licences.loading) {
      return <LoadingDiv text="Preparing Vipfy..." />;
    }

    return (
      <div className="area" style={this.props.style}>
        <SideBarContext.Provider value={this.state.sidebarOpen}>
          <Route
            render={props => {
              if (!this.props.location.pathname.includes("advisor")) {
                return (
                  <Query query={FETCH_NOTIFICATIONS} pollInterval={600000}>
                    {res => (
                      <Sidebar
                        sidebarOpen={sidebarOpen}
                        setApp={this.setApp}
                        viewID={this.state.viewID}
                        views={this.state.webviews}
                        openInstances={this.state.openInstances}
                        toggleSidebar={this.toggleSidebar}
                        setInstance={this.setInstance}
                        {...this.props}
                        licences={this.props.licences.fetchLicences}
                        {...props}
                        {...res}
                        moveTo={this.moveTo}
                      />
                    )}
                  </Query>
                );
              } else {
                return "";
              }
            }}
          />
          {/*<Route
            render={props => {
              if (!this.props.location.pathname.includes("advisor")) {
                return (
                  <Navigation
                    chatOpen={chatOpen}
                    sidebarOpen={sidebarOpen}
                    setApp={this.setApp}
                    toggleChat={this.toggleChat}
                    toggleSidebar={this.toggleSidebar}
                    viewID={this.state.viewID}
                    views={this.state.webviews}
                    openInstances={this.state.openInstances}
                    {...this.props}
                    {...props}
                  />
                );
              } else {
                return "";
              }
            }}
          />*/}
          <Route render={() => <HistoryButtons viewID={this.state.viewID} />} />
          <Switch>
            <Route
              exact
              path="/area/support"
              render={props => <SupportPage {...this.state} {...this.props} {...props} />}
            />

            {routes.map(({ path, component, admin, addprops }) => {
              const RouteComponent = component;
              if (admin && !this.props.isadmin) {
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
                          sidebarOpen && !props.location.pathname.includes("advisor")
                            ? "sidebar-open"
                            : ""
                        }`}
                        style={{ marginRight: this.state.adminOpen ? "15rem" : "" }}>
                        <ResizeAware>
                          <RouteComponent
                            setApp={this.setApp}
                            toggleAdmin={this.toggleAdmin}
                            adminOpen={this.state.adminOpen}
                            moveTo={this.moveTo}
                            {...addprops}
                            {...this.props}
                            {...props}
                          />
                        </ResizeAware>
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
                    sidebarOpen ? "sidebar-open" : ""
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
                    sidebarOpen ? "sidebar-open" : ""
                  }`}>
                  <Domains setDomain={this.setDomain} {...this.props} {...props} />
                </div>
              )}
            />

            <Route
              exact
              path="/area/app/:licenceid"
              render={props => {
                if (
                  this.state.licenceID != props.match.params.licenceid ||
                  this.state.viewID == -1
                ) {
                  this.setApp(props.match.params.licenceid);
                }
                return "";
              }}
            />
            {/*<Route
            exact
            path="/area/app/:licenceid/:url"
            render={props => {
              console.log("PROPSURL", props);
              if (this.state.licenceID != props.match.params.licenceid || this.state.viewID == -1) {
                this.setApp(props.match.params.licenceid);
              }
              this.setInstanceUrl(
                parseInt(Object.keys(this.state.openInstances[props.match.params.licenceid])[0]),
                props.match.params.url
              );
              return "";
            }}
          />*/}
            <Route
              key={"ERRORELSE"}
              render={props => (
                <div
                  className={`${
                    !this.props.location.pathname.includes("advisor") ? "full-working" : ""
                  } ${chatOpen ? "chat-open" : ""} ${
                    sidebarOpen && !props.location.pathname.includes("advisor")
                      ? "sidebar-open"
                      : ""
                  }`}>
                  <ErrorPage />
                </div>
              )}
            />
          </Switch>

          <ViewHandler
            showView={this.state.viewID}
            views={this.state.webviews}
            sidebarOpen={sidebarOpen}
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

          {this.state.consentPopup && (
            <Consent close={() => this.setState({ consentPopup: false })} />
          )}

          {this.props.needspasswordchange && (
            <ForcedPasswordChange email={this.props.emails[0].email} />
          )}
        </SideBarContext.Provider>
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
