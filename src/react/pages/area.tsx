import * as React from "react";
import { Route } from "react-router-dom";
import { withRouter, Switch } from "react-router";
import { ipcRenderer } from "electron";
import { Query, withApollo } from "react-apollo";
import compose from "lodash.flowright";
import Domains from "./domains";
import Sidebar from "../components/Sidebar";
import Webview from "./webview";
import ErrorPage from "./error";
import VIPFYPlanPopup from "../popups/universalPopups/VIPFYPlanPopup";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import SupportPage from "../pages/support";
import LoadingDiv from "../components/LoadingDiv";
import { SideBarContext, UserContext } from "../common/context";
import ClickTracker from "../components/ClickTracker";
import Consent from "../popups/universalPopups/Consent";
import ResizeAware from "react-resize-aware";
import ForcedPasswordChange from "../popups/universalPopups/ForcedPasswordChange";
import TutorialBase from "../tutorials/tutorialBase";
import { fetchUserLicences } from "../queries/departments";
import RecoveryKey from "../components/signin/RecoveryKey";
import FloatingNotifications from "../components/notifications/floatingNotifications";
import { WorkAround, Expired_Plan } from "../interfaces";
import config from "../../configurationManager";
import { vipfyAdmins, vipfyVacationAdmins } from "../common/constants";
import { AppContext } from "../common/functions";
import Browser from "./browser";
import routes from "../routes";

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
  showVIPFYPlanPopup: boolean;
  expiredPlan: Expired_Plan;
  client: any;
  recoverypublickey?: string;
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
  openServices: string[];
  showService: string | null;
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
    allowSkip: false,
    openServices: [],
    showService: null
  };

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
        label: "Payment Method",
        location: "paymentdata/paymentmethod",
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
        show: config.showMarketplace,
        highlight: "marketplace"
      },
      {
        label: "Market Categories",
        location: "marketplace/categories",
        show: config.showMarketplace,
        highlight: "marketplace"
      }
    ]
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
      this.setState({ viewID: -1, showService: null });
    }

    this.props.moveTo(path);
  };

  setApp = (assignmentId: string) => {
    if (!this.state.openServices.find(os => os == assignmentId)) {
      this.setState(oldstate => {
        return { ...oldstate, openServices: [...oldstate.openServices, assignmentId] };
      });
    }
    this.setState({ showService: assignmentId });
    this.props.history.push(`/area/browser/${assignmentId}`);
  };

  setDomain = (boughtplan: number, domain: string) => {
    this.setState({ app: boughtplan, licenceID: boughtplan, domain });
    this.props.history.push(`/area/app/${boughtplan}`);
  };

  componentDidCatch(error, info) {
    console.error(error, info);
    this.moveTo("error");
  }

  setSidebar = value => this.setState({ sidebarOpen: value });

  toggleChat = () => this.setState(prevState => ({ chatOpen: !prevState.chatOpen }));

  toggleAdmin = () => this.setState(prevState => ({ adminOpen: !prevState.adminOpen }));

  toggleSidebar = () => this.setState(prevState => ({ sidebarOpen: !prevState.sidebarOpen }));

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

  closeBrowser(assignmentId, moveTo) {
    this.setState(oldstate => {
      const openServices = oldstate.openServices.filter(os => os != assignmentId) || [];
      return { openServices };
    });
    this.moveTo(moveTo);
  }

  isAdminOpen = () => {
    return routes.find(route => {
      const splits = route.path.slice(6).split(":");
      const slashsplits = splits[0].split("/");
      const locationssplits = history.location.pathname.split("/");
      let location = "";
      locationssplits.forEach((l, k) => {
        if (k > 0 && k <= slashsplits.length + 1) {
          location += "/";
          location += l;
        }
      });
      return `/area/${splits[0]}` == location;
    })?.admin;
  };

  renderCategories = (categories, categorie, addRenderElement) => (
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

  render() {
    const {
      sidebarOpen,
      chatOpen,
      allowSkip,
      webviews,
      adminOpen,
      viewID,
      licenceID,
      openServices,
      openInstances,
      consentPopup
    } = this.state;

    const {
      recoverypublickey,
      emails,
      needspasswordchange,
      isadmin,
      tutorialprogress,
      highlightReferences,
      showVIPFYPlanPopup,
      company,
      expiredPlan,
      id,
      style,
      showService
    } = this.props;

    const isImpersonating = !!localStorage.getItem("impersonator-token");

    if (!allowSkip && !recoverypublickey && !isImpersonating && isadmin) {
      return (
        <div className="centralize backgroundLogo">
          <RecoveryKey continue={() => this.setState({ allowSkip: true })} />
        </div>
      );
    }

    const browserlist: JSX.Element[] = [];
    let marginLeft = 64;
    if (sidebarOpen) {
      marginLeft += 176;
    }
    openServices.forEach(o =>
      browserlist.push(
        <div
          key={o}
          style={{
            visibility: showService == o ? "visible" : "hidden",
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "100%",
            height: "100%"
          }}>
          <Browser
            setApp={this.setApp}
            toggleAdmin={this.toggleAdmin}
            adminOpen={adminOpen}
            moveTo={this.moveTo}
            assignmentId={o}
            visible={showService == o}
            closeBrowser={(a, b) => this.closeBrowser(a, b)}
            {...this.props}
          />
        </div>
      )
    );

    return (
      <AppContext.Consumer>
        {context => (
          <Query<WorkAround, WorkAround> query={fetchUserLicences} variables={{ unitid: id }}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv />;
              }

              if (error) {
                return <ErrorPage />;
              }

              const licences = data.fetchUserLicenceAssignments;

              return (
                <div className="area" style={style}>
                  <ClickTracker />
                  <SideBarContext.Provider value={sidebarOpen}>
                    <UserContext.Provider value={{ userid: id }}>
                      <Route
                        render={props => (
                          <Query query={FETCH_NOTIFICATIONS} pollInterval={120000}>
                            {res => (
                              <>
                                <Sidebar
                                  sidebarOpen={sidebarOpen}
                                  setApp={this.setApp}
                                  viewID={viewID}
                                  views={webviews}
                                  openInstances={openInstances}
                                  openServices={openServices}
                                  showService={showService}
                                  toggleSidebar={this.toggleSidebar}
                                  setInstance={this.setInstance}
                                  {...this.props}
                                  licences={licences}
                                  {...props}
                                  {...res}
                                  moveTo={this.moveTo}
                                  adminOpen={this.isAdminOpen}
                                />

                                <FloatingNotifications
                                  sidebarOpen={sidebarOpen}
                                  setApp={this.setApp}
                                  viewID={viewID}
                                  views={webviews}
                                  openInstances={openInstances}
                                  toggleSidebar={this.toggleSidebar}
                                  setInstance={this.setInstance}
                                  {...this.props}
                                  licences={licences}
                                  {...props}
                                  {...res}
                                  moveTo={this.moveTo}
                                  adminOpen={this.isAdminOpen}
                                />
                              </>
                            )}
                          </Query>
                        )}
                      />
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

                        {routes.map(({ path, component, admin, addprops, manager }) => {
                          const RouteComponent = component;
                          let marginLeft = 64;

                          if (admin || sidebarOpen) {
                            marginLeft += 176;
                          }

                          if (admin && !isadmin) {
                            return null;
                          }

                          return (
                            <Route
                              key={path}
                              exact
                              path={path}
                              render={props => (
                                <div
                                  className={`full-working ${chatOpen ? "chat-open" : ""}`}
                                  style={{ marginLeft: `${marginLeft}px` }}>
                                  <ResizeAware>
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
                                            this.renderCategories(
                                              this.categories,
                                              categorie,
                                              context.addRenderElement
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                    {addprops && addprops.heading && (
                                      <div className="pageHeading">{addprops.heading}</div>
                                    )}

                                    <RouteComponent
                                      setApp={this.setApp}
                                      toggleAdmin={this.toggleAdmin}
                                      adminOpen={adminOpen}
                                      moveTo={this.moveTo}
                                      {...addprops}
                                      {...this.props}
                                      {...props}
                                      licences={licences}
                                      manager={manager}
                                    />
                                  </ResizeAware>
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
                            if (licenceID != props.match.params.licenceid || viewID == -1) {
                              this.setApp(props.match.params.licenceid);
                            }
                            return "";
                          }}
                        />

                        <Route
                          exact
                          path="/area/browser/:assignmentid"
                          render={props => {
                            if (showService != props.match.params.assignmentid) {
                              this.setApp(props.match.params.assignmentid);
                            }
                            return "";
                          }}
                        />
                        <Route
                          exact
                          path="/area/browser"
                          render={props => {
                            if (showService != "browser") {
                              this.setApp("browser");
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

                      <div
                        id="viewHandler"
                        className={`marginLeft ${sidebarOpen && "sidebar-open"}`}
                        style={{
                          visibility: showService !== null ? "visible" : "hidden",
                          position: "relative",
                          height: showService !== null ? undefined : "1px",
                          overflow: showService !== null ? undefined : "hidden"
                        }}>
                        {browserlist}
                      </div>

                      {needspasswordchange && !localStorage.getItem("impersonator-token") && (
                        <ForcedPasswordChange email={emails[0].email} />
                      )}

                      {isadmin && tutorialprogress && highlightReferences && (
                        <TutorialBase {...this.props} />
                      )}

                      {consentPopup && (
                        <Consent close={() => this.setState({ consentPopup: false })} />
                      )}
                    </UserContext.Provider>
                  </SideBarContext.Provider>

                  {showVIPFYPlanPopup && (
                    <VIPFYPlanPopup company={company} currentPlan={expiredPlan} />
                  )}
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
