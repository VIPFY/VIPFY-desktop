import * as React from "react";
import { ErrorPage } from "@vipfy-private/vipfy-ui-lib";
import { Route } from "react-router-dom";
import { withRouter, Switch, Redirect } from "react-router";
import { ipcRenderer } from "electron";
import { Query } from "@apollo/client/react/components";
import { withApollo } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import moment from "moment";
import Domains from "./domains";
import Sidebar from "../components/Sidebar";
import Webview from "./webview";
import VIPFYPlanPopup from "../popups/universalPopups/VIPFYPlanPopup";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import SupportPage from "./support";
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
import { AppContext } from "../common/functions";
import DataNameForm from "../components/dataForms/NameForm";
import Browser from "./browser";
import routes from "../routes";
import AdminSidebar from "../components/AdminSidebar";

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
    if (moveTo) {
      this.moveTo(moveTo);
    }
  }

  isAdminOpen = () => {
    return routes.find(route => {
      const pathStart = route.path.split(":")[0];
      const slashSplits = pathStart.split("/");
      const locationSplits = this.props.history.location.pathname.split("/");

      let location = "";
      locationSplits.forEach((locationSplit, i) => {
        if (i > 0 && i <= slashSplits.length + 1) {
          location += "/" + locationSplit;
        }
      });

      return pathStart === location;
    })?.admin;
  };

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
      consentPopup,
      showService
    } = this.state;

    const {
      recoverypublickey,
      emails,
      needspasswordchange,
      isadmin,
      tutorialprogress,
      highlightReferences,
      company,
      expiredPlan,
      id,
      style,
      showVIPFYPlanPopup
    } = this.props;

    const browserlist: JSX.Element[] = [];

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

              this.state.openServices.forEach(oS => {
                const curL = licences.find(l => l.id == oS);
                if (curL && moment(curL.endtime).isBefore()) {
                  this.closeBrowser(oS, showService == oS ? "dashboard" : null);
                }
              });

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
                                  adminOpen={this.isAdminOpen()}
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
                                  adminOpen={this.isAdminOpen()}
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

                          if (admin && sidebarOpen) {
                            marginLeft += 176;
                          }

                          if (admin && !isadmin) {
                            return (
                              <Route key={path} exact path={path}>
                                <Redirect to="/area" />
                              </Route>
                            );
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
                                      <AdminSidebar
                                        sidebarOpen={sidebarOpen}
                                        moveTo={this.moveTo}
                                      />
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
                          key="ERRORELSE"
                          render={() => {
                            console.error("You tried go to a non-existing route.");
                            return (
                              <div
                                className={`full-working ${chatOpen ? "chat-open" : ""} ${
                                  sidebarOpen ? "sidebar-open" : ""
                                }`}>
                                <ErrorPage />
                              </div>
                            );
                          }}
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

                      {!this.props.setupfinished && (
                        <DataNameForm
                          moveTo={this.props.moveTo}
                          globalMeRefetch={this.props.globalMeRefetch}
                        />
                      )}

                      {!this.state.allowSkip &&
                        !this.props.recoverypublickey &&
                        !localStorage.getItem("impersonator-token") &&
                        isadmin && (
                          <RecoveryKey continue={() => this.setState({ allowSkip: true })} />
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
