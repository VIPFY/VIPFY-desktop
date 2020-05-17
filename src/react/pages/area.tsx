import * as React from "react";
import { Route } from "react-router-dom";
import { withRouter, Switch } from "react-router";
import { ipcRenderer } from "electron";
import { Query, withApollo } from "react-apollo";
import compose from "lodash.flowright";

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
import Integrations from "./integrations";
import LoadingDiv from "../components/LoadingDiv";
import ServiceEdit from "../components/admin/ServiceEdit";
import ViewHandler from "./viewhandler";
import Tabs from "../components/Tabs";
import SsoConfigurator from "./ssoconfigurator";
import SsoTester from "./SSOtester";
import ServiceCreationExternal from "../components/admin/ServiceCreationExternal";
import ServiceLogoEdit from "../components/admin/ServiceLogoOverview";
import { SideBarContext, UserContext } from "../common/context";
import ClickTracker from "../components/ClickTracker";
import EmployeeOverview from "./manager/employeeOverview";
import TeamDetails from "./manager/teamDetails";
import Consent from "../popups/universalPopups/Consent";
import UniversalLoginTest from "../components/admin/UniversalLoginTest/UniversalLoginTest";
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
import RecoveryKey from "../components/signin/RecoveryKey";
import { WorkAround } from "../interfaces";
//import Order from "./marketplace/order";
import FloatingNotifications from "../components/notifications/floatingNotifications";
import config from "../../configurationManager";
import { vipfyAdmins, vipfyVacationAdmins } from "../common/constants";
import { AppContext } from "../common/functions";
import Workspace from "./Workspace";

interface AreaProps {
  id: string;
  history: any[];
  moveTo: Function;
  consent?: boolean;
  style?: Object;
  needspasswordchange: boolean;
  emails: string[];
  tutorialprogress?: any;
  highlightReferences?: any;
  addUsedLicenceID: Function;
  client: any;
  recoverypublickey?: string;
  needstowfa: boolean;
  isadmin: boolean;
  [moreStuff: string]: any;
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
  allowSkip: boolean;
}

class Area extends React.Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1, //Very Old style - should be removed sometime
    licenceID: -1, //Old style - should be removed sometime
    viewID: -1,
    chatOpen: false,
    sidebarOpen: false,
    domain: "",
    webviews: [],
    oldWebViews: [],
    openInstances: {},
    activeTab: null,
    adminOpen: false,
    consentPopup: false,
    allowSkip: false
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

  addWebview = (licenceID, opendirect = false, url = undefined, loggedIn = false) => {
    this.setState(prevState => {
      const viewID = Math.max(...prevState.webviews.map(o => o.key), 0) + 1;
      const l = {
        licenceID: licenceID,
        plain: true,
        setViewTitle: this.setViewTitle,
        viewID,
        addWebview: this.addWebview,
        url: url,
        loggedIn
      };
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
    this.props.addUsedLicenceID(licenceID);
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

  rendercategories = (categories, categorie, addRenderElement) => (
    <li>
      <div className={"adminHeadline-categoryTitle"}>{categorie}</div>
      {categories[categorie].map(({ label, location, highlight, ...categoryProps }) => {
        let buttonClass = "naked-button adminHeadline-categoryElement";

        const id = label.toString() + location.toString();

        if (
          this.props.location.pathname.startsWith(`/area/${location}`) ||
          `${this.props.location.pathname}/dashboard`.startsWith(`/area/${location}`)
        ) {
          buttonClass += " selected";
        }

        return (
          <button
            ref={element => addRenderElement({ key: highlight, element })}
            {...categoryProps}
            id={id}
            className={buttonClass}
            onMouseDown={() => {
              document.getElementById(id).className =
                "naked-button adminHeadline-categoryElement active";
            }}
            onMouseUp={() => {
              document.getElementById(id).className = buttonClass;
              this.moveTo(location);
            }}
            onMouseLeave={() => {
              document.getElementById(id).className = buttonClass;
            }}>
            <div className="label">{label}</div>
          </button>
        );
      })}
    </li>
  );

  categories = {
    PROFILE: [
      {
        label: "Company Profile",
        location: "company",
        icon: "building",
        show: this.props.isadmin,
        important: false,
        highlight: "companyprofile"
      }
    ],
    MANAGEMENT: [
      {
        label: "Team Manager",
        location: "dmanager",
        icon: "user-tag",
        show: this.props.isadmin,
        important: false,
        highlight: "dmanager"
      },
      {
        label: "Employee Manager",
        location: "emanager",
        icon: "users-cog",
        show: this.props.isadmin,
        important: false,
        highlight: "emanager"
      },
      {
        label: "Service Manager",
        location: "lmanager",
        icon: "credit-card-blank",
        show: this.props.isadmin,
        important: false,
        highlight: "lmanager"
      }
    ],
    "ACCOUNT INTEGRATOR": [
      {
        label: "Account Integrator",
        location: "integrations",
        icon: "shapes",
        show: this.props.isadmin,
        highlight: "integrationselement"
      }
    ],
    BILLING: [
      {
        label: "Billing Information",
        location: "billing",
        icon: "file-invoice-dollar",
        show: this.props.isadmin && config.showBilling,
        highlight: "billingelement"
      },
      {
        label: "Billing History",
        location: "billing",
        icon: "file-invoice-dollar",
        show: this.props.isadmin && config.showBilling,
        highlight: "billingelement"
      },
      {
        label: "Billing Statistics",
        location: "billing",
        icon: "file-invoice-dollar",
        show: this.props.isadmin && config.showBilling,
        highlight: "billingelement"
      }
    ],
    STATISTICS: [
      {
        label: "Billing Statistics",
        location: "billing",
        icon: "file-invoice-dollar",
        show: this.props.isadmin && config.showBilling,
        highlight: "billingelement"
      },
      {
        label: "Usage Statistics",
        location: "usage",
        icon: "chart-line",
        show: this.props.isadmin,
        highlight: "usage"
      }
    ],
    SECURITY: [
      {
        label: "Overview",
        location: "security",
        icon: "user-shield",
        show: this.props.isadmin,
        highlight: "securityelement"
      }
    ],
    "VIPFY ADMIN": [
      {
        label: "Tools",
        location: "admin",
        icon: "layer-plus",
        show: config.showAdmin && vipfyAdmins.find(admin => admin == this.props.id),
        highlight: "adminelement"
      },
      {
        label: "Vacation Requests",
        location: "vacation",
        icon: "umbrella-beach",
        show:
          config.showVacationRequests && vipfyVacationAdmins.find(admin => admin == this.props.id),
        highlight: "vacation"
      },
      {
        label: "SSO Configurator",
        location: "ssoconfig",
        icon: "dice-d12",
        show: this.props.isadmin && config.showSsoConfig && this.props.company.unit.id == 14,
        highlight: "ssoconfig"
      },
      {
        label: "SSO Tester",
        location: "ssotest",
        icon: "dragon",
        show: false,
        highlight: "ssotest"
      },
      {
        label: "Marketplace",
        location: "marketplace",
        icon: "shopping-cart",
        show: config.showMarketplace,
        highlight: "marketplaceelement"
      }
    ]
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
      { path: "security", component: Security, admin: true },
      { path: "messagecenter", component: MessageCenter },
      { path: "messagecenter/:person", component: MessageCenter },
      { path: "billing", component: Billing, admin: true },
      { path: "marketplace", component: Marketplace, admin: true },
      { path: "marketplace/:appid/", component: AppPage, admin: true },
      { path: "marketplace/:appid/:action", component: AppPage, admin: true },
      { path: "integrations", component: Integrations, admin: true },
      { path: "usage", component: UsageStatistics, admin: true },
      { path: "usage/boughtplan/:boughtplanid", component: UsageStatisticsBoughtplan, admin: true },
      { path: "support", component: SupportPage },
      { path: "error", component: ErrorPage },
      { path: "workspace", component: Workspace },
      { path: "vacation", component: Vacation, admin: true },
      { path: "admin", component: AdminDashboard, admin: true },
      { path: "admin/service-creation-external", component: ServiceCreationExternal, admin: true },
      { path: "admin/service-creation", component: ServiceCreation, admin: true },
      { path: "admin/service-edit", component: ServiceEdit, admin: true },
      { path: "admin/service-integration", component: ServiceIntegrator, admin: true },
      { path: "admin/service-integration/:appid", component: LoginIntegrator, admin: true },
      { path: "admin/crypto-debug", component: CryptoDebug, admin: true },
      { path: "admin/service-logo-overview", component: ServiceLogoEdit, admin: true },
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
      { path: "company", component: CompanyDetails, admin: true }
    ];

    const isImpersonating = !!localStorage.getItem("impersonator-token");

    if (
      !this.state.allowSkip &&
      !this.props.recoverypublickey &&
      !isImpersonating &&
      this.props.isadmin
    ) {
      return (
        <div className="centralize backgroundLogo">
          <RecoveryKey continue={() => this.setState({ allowSkip: true })} />
        </div>
      );
    }

    return (
      <AppContext.Consumer>
        {context => (
          <Query<WorkAround, WorkAround>
            query={fetchUserLicences}
            variables={{ unitid: this.props.id }}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv />;
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
                        render={props => (
                          <Query query={FETCH_NOTIFICATIONS} pollInterval={120000}>
                            {res => (
                              <>
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
                                  adminOpen={
                                    routes.find(r => {
                                      const splits = r.path.split(":");
                                      const slashsplits = splits[0].split("/");
                                      const locationssplits = this.props.history.location.pathname.split(
                                        "/"
                                      );

                                      let location = "";
                                      locationssplits.forEach((l, k) => {
                                        if (k > 0 && k <= slashsplits.length + 1) {
                                          location += "/";
                                          location += l;
                                        }
                                      });

                                      if (`/area/${splits[0]}` == location) {
                                        return true;
                                      } else {
                                        return false;
                                      }
                                    })?.admin
                                  }
                                />
                                <FloatingNotifications
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
                                  adminOpen={
                                    routes.find(r => {
                                      const splits = r.path.split(":");
                                      const slashsplits = splits[0].split("/");
                                      const locationssplits = this.props.history.location.pathname.split(
                                        "/"
                                      );

                                      let location = "";
                                      locationssplits.forEach((l, k) => {
                                        if (k > 0 && k <= slashsplits.length + 1) {
                                          location += "/";
                                          location += l;
                                        }
                                      });

                                      if (`/area/${splits[0]}` == location) {
                                        return true;
                                      } else {
                                        return false;
                                      }
                                    })?.admin
                                  }
                                />
                              </>
                            )}
                          </Query>
                        )}
                      />
                      <Route render={() => <HistoryButtons viewID={this.state.viewID} />} />
                      <Switch>
                        <Route
                          exact
                          path="/area/support"
                          render={props => (
                            <SupportPage {...this.state} {...this.props} {...props} />
                          )}
                        />

                        <Route
                          exact
                          path="/area/support/fromError"
                          render={() => <SupportPage {...this.state} fromErrorPage={true} />}
                        />

                        {routes.map(({ path, component, admin, addprops }) => {
                          const RouteComponent = component;
                          let marginLeft = 64;
                          if (admin) {
                            marginLeft += 176;
                          }
                          if (sidebarOpen) {
                            marginLeft += 176;
                          }
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
                                    className={`full-working ${chatOpen ? "chat-open" : ""}`}
                                    style={{ marginLeft: `${marginLeft}px` }}>
                                    <ResizeAware
                                      style={
                                        path.includes("order")
                                          ? {
                                              height: "100%",
                                              width: "100%",
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center"
                                            }
                                          : undefined
                                      }>
                                      {admin && (
                                        <div
                                          className={`sidebar-adminpanel${
                                            sidebarOpen ? "" : " small"
                                          }`}
                                          ref={element =>
                                            context.addRenderElement({
                                              key: "adminSideBar",
                                              element
                                            })
                                          }>
                                          <div className="adminHeadline">ADMIN PANEL</div>
                                          <ul>
                                            {Object.keys(this.categories).map(categorie =>
                                              this.rendercategories(
                                                this.categories,
                                                categorie,
                                                context.addRenderElement
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
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
                      {this.props.needspasswordchange &&
                        !localStorage.getItem("impersonator-token") && (
                          <ForcedPasswordChange email={this.props.emails[0].email} />
                        )}
                      {this.props.isadmin &&
                        this.props.tutorialprogress &&
                        this.props.highlightReferences && <TutorialBase {...this.props} />}
                      {this.state.consentPopup && (
                        <Consent close={() => this.setState({ consentPopup: false })} />
                      )}
                    </UserContext.Provider>
                  </SideBarContext.Provider>
                </div>
              );
            }}
          </Query>
        )}
      </AppContext.Consumer>
    );
  }
}

export default compose(withApollo)(withRouter(Area));
