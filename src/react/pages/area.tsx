import * as React from "react";
import { Route } from "react-router-dom";
import { withRouter, Switch } from "react-router";
import { ipcRenderer } from "electron";
import { graphql, compose, Query, withApollo } from "react-apollo";

import AppPage from "./apppage";
import Billing from "./billing";
import Dashboard from "./dashboard";
import Domains from "./domains";
import Marketplace from "./marketplace";
import MessageCenter from "./messagecenter";
import AdminDashboard from "../components/admin/Dashboard";
import ServiceCreation from "../components/admin/ServiceCreation";
import Sidebar from "../components/Sidebar";
import Webview from "./webview";
import ErrorPage from "./error";
import UsageStatistics from "./usagestatistics";
import UsageStatisticsBoughtplan from "./usagestatisticsboughtplans";

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
import { SideBarContext, UserContext } from "../common/context";
import ClickTracker from "../components/ClickTracker";
import EmployeeOverview from "./manager/employeeOverview";
import TeamDetails from "./manager/teamDetails";
import Consent from "../popups/universalPopups/Consent";
import UniversalLogin from "./universalLogin";
import UniversalLoginTest from "../components/admin/UniversalLoginTest";
import ResizeAware from "react-resize-aware";
import HistoryButtons from "../components/HistoryButtons";
import CompanyDetails from "./manager/companyDetails";
import ForcedPasswordChange from "../popups/universalPopups/ForcedPasswordChange";
import ServiceIntegrator from "../components/admin/ServiceIntegrator";
import TutorialBase from "../tutorials/tutorialBase";
import CryptoDebug from "../components/admin/crytpodebug";
import Vacation from "./vacation";
import { fetchUserLicences } from "../queries/departments";
import EmployeeDetails from "./manager/employeeDetails";
import TeamOverview from "./manager/teamOverview";
import ServiceOverview from "./manager/serviceOverview";
import ServiceDetails from "./manager/serviceDetails";
import LoginIntegrator from "../components/admin/LoginIntegrator";

interface AreaProps {
  history: any[];
  moveTo: Function;
  consent?: boolean;
  style?: Object;
  needspasswordchange: boolean;
  emails: string[];
  tutorialprogress?: any;
  highlightReferences?: any;
}

interface AreaState {
  app: number;
  licenceID: number;
  viewID: number;
  chatOpen: boolean;
  sidebarOpen: boolean;
  domain: string;
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
    webviews: [],
    oldWebViews: [],
    openInstances: {},
    activeTab: null,
    adminOpen: false,
    consentPopup: false
  };

  componentDidMount = async () => {
    ipcRenderer.on("change-page", (_event, page) => {
      this.props.history.push(page);
    });

    if (this.props.consent === null) {
      this.setState({ consentPopup: true });
    }
  };

  moveTo = path => {
    if (!path.startsWith("app")) {
      this.setState({ viewID: -1 });
    }
    this.props.moveTo(path);
  };

  setApp = (assignmentId: number) => {
    if (this.state.openInstances[assignmentId]) {
      this.setState(prevState => {
        const newstate = {
          ...prevState,
          app: assignmentId,
          licenceID: assignmentId,
          viewID: Object.keys(prevState.openInstances[assignmentId])[0]
        };
        return newstate;
      });
      this.props.history.push(`/area/app/${assignmentId}`);
    } else {
      this.addWebview(assignmentId, true);
      this.props.history.push(`/area/app/${assignmentId}`);
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
      { path: "security", component: Security },
      { path: "messagecenter", component: MessageCenter },
      { path: "messagecenter/:person", component: MessageCenter },
      { path: "billing", component: Billing },
      { path: "marketplace", component: Marketplace },
      { path: "marketplace/:appid/", component: AppPage },
      { path: "marketplace/:appid/:action", component: AppPage },
      { path: "integrations", component: Integrations },
      { path: "usage", component: UsageStatistics },
      { path: "usage/boughtplan/:boughtplanid", component: UsageStatisticsBoughtplan },
      { path: "support", component: SupportPage },
      { path: "error", component: ErrorPage },
      { path: "vacation", component: Vacation },
      { path: "admin", component: AdminDashboard, admin: true },
      { path: "admin/service-creation-external", component: ServiceCreationExternal, admin: true },
      { path: "admin/service-creation", component: ServiceCreation, admin: true },
      { path: "admin/service-edit", component: ServiceEdit, admin: true },
      { path: "admin/service-integration", component: ServiceIntegrator, admin: true },
      { path: "admin/service-integration/:appid/:url", component: LoginIntegrator },
      { path: "admin/crypto-debug", component: CryptoDebug, admin: true },
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
    return (
      <Query query={fetchUserLicences} variables={{ unitid: this.props.id }}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Preparing Vipfy..." />;
          }

          if (error) {
            return <ErrorPage />;
          }
          const licences = data.fetchUserLicenceAssignments;
          return (
            <div className="area" style={this.props.style}>
              <ClickTracker />
              <SideBarContext.Provider value={this.state.sidebarOpen}>
                <UserContext.Provider value={{ userid: this.props.id }}>
                  <Route
                    render={props => {
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
                              licences={licences}
                              {...props}
                              {...res}
                              moveTo={this.moveTo}
                            />
                          )}
                        </Query>
                      );
                    }}
                  />
                  <Route render={() => <HistoryButtons viewID={this.state.viewID} />} />
                  <Switch>
                    <Route
                      exact
                      path="/area/support"
                      render={props => <SupportPage {...this.state} {...this.props} {...props} />}
                    />

                    <Route
                      exact
                      path="/area/support/fromError"
                      render={() => <SupportPage {...this.state} fromErrorPage={true} />}
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
                                className={`full-working ${chatOpen ? "chat-open" : ""} ${
                                  sidebarOpen ? "sidebar-open" : ""
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
                                    licences={licences}
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
                    <Route
                      key={"ERRORELSE"}
                      render={() => (
                        <div
                          className={`full-working ${chatOpen ? "chat-open" : ""} ${
                            sidebarOpen ? "sidebar-open" : ""
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
                  {this.props.needspasswordchange &&
                    !localStorage.getItem("impersonator-token") && (
                      <ForcedPasswordChange email={this.props.emails[0].email} />
                    )}
                  {this.props.isadmin &&
                    this.props.tutorialprogress &&
                    this.props.highlightReferences && <TutorialBase {...this.props} />}
                </UserContext.Provider>
              </SideBarContext.Provider>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default compose(withApollo)(withRouter(Area));
