import * as React from "react";
import { graphql } from "react-apollo";
import Tooltip from "react-tooltip-lite";
import { UPDATE_LAYOUT } from "../mutations/auth";
import { Licence } from "../interfaces";
import { AppContext, layoutChange } from "../common/functions";
import SidebarLink from "./sidebarLink";
import config from "../../configurationManager";
import * as moment from "moment";
import * as ReactDOM from "react-dom";

interface SidebarLinks {
  label: string;
  location: string;
  icon: string;
  show: any;
  highlight: any;
}

export type SidebarProps = {
  history: any[];
  setApp: (licence: number) => void;
  licences: Licence[];
  location: object;
  sidebarOpen: boolean;
  logMeOut: () => void;
  isadmin: boolean;
  toggleSidebar: Function;
  updateLayout: Function;
  moveTo: Function;
  viewID: number;
  openInstances: any;
  setInstance: Function;
  sidebarloaded: Function;
  views: any[];
};

interface State {
  dragItem: number | null;
  searchstring: string;
  sortorientation: boolean;
  sortstring: string;
  showNotification: boolean;
  showApps: boolean;
  showMoreApps: boolean;
  showSearch: boolean;
}

class Sidebar extends React.Component<SidebarProps, State> {
  state = {
    dragItem: null,
    searchstring: "",
    sortorientation: true,
    sortstring: "Custom",
    showNotification: false,
    showApps: true,
    showMoreApps: false,
    showSearch: false
  };

  //references: { key; element }[] = [];
  goTo = view => this.props.moveTo(view);

  handleDrop = /* async id */ (tragetId, dragedId, top) => {
    let targetLi = this.props.licences.find(a => a.id === tragetId);
    let dragedLi = this.props.licences.find(a => a.id === dragedId);
    if (targetLi!.nextLicence == dragedLi && !top) {
      return;
    } else if (targetLi!.prevLicence == dragedLi) {
      return;
    }
    let prevdragedLi = dragedLi!.prevLicence;
    let nextdragedLi = dragedLi!.nextLicence;
    let reltargetLi;
    if (!top == this.state.sortorientation) {
      reltargetLi = targetLi!.nextLicence;
    } else {
      reltargetLi = targetLi!.prevLicence;
    }

    if (!nextdragedLi && !prevdragedLi) {
      return;
    }

    if (prevdragedLi) {
      prevdragedLi!.nextLicence = nextdragedLi;
    }
    if (nextdragedLi) {
      nextdragedLi!.prevLicence = prevdragedLi;
    }
    if (!top == this.state.sortorientation) {
      targetLi!.nextLicence = dragedLi!;
      dragedLi!.prevLicence = targetLi!;
      dragedLi!.nextLicence = reltargetLi!;
    } else {
      targetLi!.prevLicence = dragedLi!;
      dragedLi!.nextLicence = targetLi!;
      dragedLi!.prevLicence = reltargetLi!;
    }

    if (reltargetLi) {
      if (!top == this.state.sortorientation) {
        reltargetLi!.prevLicence = dragedLi!;
      } else {
        reltargetLi!.nextLicence = dragedLi!;
      }
    }

    this.setState({ showNotification: false });

    /* const { dragItem } = this.state;
    const { licences } = this.props;

    const layouts = layoutChange(licences, dragItem, id, "layoutvertical");

    try {
      await this.props.updateLayout({
        variables: { layouts },
        update: cache => {
          const newLicences = licences.map(licence => {
            if (licence.id == layouts[0].id) {
              return { ...licence, layoutvertical: layouts[0]!.layoutvertical };
            } else if (licence.id == layouts[1].id) {
              return { ...licence, layoutvertical: layouts[1]!.layoutvertical };
            } else {
              return licence;
            }
          });

          cache.writeQuery({ query: fetchLicences, data: { fetchLicences: newLicences } });
        }
      });
      this.setState({ dragItem: null });
    } catch (error) {
      console.log(error);
    } */
  };

  addReferences = (key, element, addRenderElement) => {
    // this.references.push({ key, element });
    addRenderElement({ key, element });
  };

  maybeaddHighlightReference = (location, highlight, el, addRenderElement) => {
    if (
      this.props.location.pathname === `/area/${location}` ||
      `${this.props.location.pathname}/dashboard` === `/area/${location}`
    ) {
      this.addReferences("active", el, addRenderElement);
    }

    this.addReferences(highlight, el, addRenderElement);
  };

  listenKeyboard = e => {
    if (e.key === "Escape" || e.keyCode === 27) {
      this.setState({ showNotification: false });
    }
  };

  componentDidMount() {
    this.props.sidebarloaded();
    window.addEventListener("keydown", this.listenKeyboard, true);
    document.addEventListener("click", this.handleClickOutside, true);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
    document.removeEventListener("click", this.handleClickOutside, true);
  }

  handleClickOutside = e => {
    const domNode = ReactDOM.findDOMNode(this);

    if (!domNode || !domNode.contains(e.target)) {
      this.setState({ showNotification: false });
    }
  };

  toggleNotificationPopup = () => {
    this.setState(prevState => ({ showNotification: !prevState.showNotification }));
  };

  renderLink = ({ label, location, icon, show, highlight }: SidebarLinks, addRenderElement) => {
    let cssClass = "sidebar-link";
    const { sidebarOpen } = this.props;

    if (!sidebarOpen) {
      cssClass += "-small";
    }

    if (
      this.props.location.pathname.startsWith(`/area/${location}`) ||
      `${this.props.location.pathname}/dashboard`.startsWith(`/area/${location}`)
    ) {
      cssClass += " sidebar-active";
    }

    if (show) {
      return (
        <li
          key={location}
          className={cssClass}
          onClick={() => this.goTo(location)}
          ref={el => this.maybeaddHighlightReference(location, highlight, el, addRenderElement)}>
          <Tooltip
            distance={1}
            arrowSize={5}
            useHover={!sidebarOpen}
            content={label}
            direction="right">
            <i className={`fal fa-${icon} sidebar-icons`} />
          </Tooltip>
          <span className={`${sidebarOpen ? "sidebar-link-caption" : "show-not"}`}>{label}</span>
        </li>
      );
    } else {
      return;
    }
  };

  sortCustomlist(unsortedList) {
    let a = unsortedList[0];
    while (a.prevLicence) {
      a = a.prevLicence;
    }
    let i;
    if (this.state.sortorientation) {
      i = 0;
    } else {
      i = unsortedList.length - 1;
    }
    while (a.nextLicence) {
      unsortedList[i] = a;
      a = a.nextLicence;
      i = (i => {
        if (this.state.sortorientation) {
          return ++i;
        } else {
          return --i;
        }
      })(i);
    }

    return unsortedList.filter(licence => {
      if (licence.disabled || (licence.endtime && moment().isAfter(licence.endtime))) {
        return false;
      }
      let one = false,
        two = false;
      if (this.state.searchstring === "") {
        return true;
      }
      if (
        licence.boughtplanid.alias !== null &&
        !licence.boughtplanid.alias.toLowerCase().includes(this.state.searchstring.toLowerCase())
      ) {
        one = true;
      }
      if (
        licence.boughtplanid.planid.appid.name !== null &&
        !licence.boughtplanid.planid.appid.name
          .toLowerCase()
          .includes(this.state.searchstring.toLowerCase())
      ) {
        two = true;
      }
      if (one && two) {
        return false;
      } //include search if search
      return true;
    });
  }

  render() {
    let { sidebarOpen, licences } = this.props;
    const { showApps, showMoreApps } = this.state;

    const SortComponent = (
      <div className="sidebar-search-tooltip">
        <button
          className="wrapper naked-button"
          onClick={() => {
            this.setState(prevState => ({ ...prevState, showApps: !prevState.showApps }));
          }}>
          <i className="fal fa-angle-right" />
          <span style={{ fontSize: "10px" }}>{`${showApps ? "Hide" : "Show"} Apps`}</span>
        </button>

        <span className="wrapper">
          <i className="fal fa-sort-alpha-up" />
          <span style={{ fontSize: "10px" }}>Sort Up</span>
        </span>

        <span className="wrapper">
          <i className="fal fa-sort-alpha-down" />
          <span style={{ fontSize: "10px" }}>Sort Down</span>
        </span>
      </div>
    );

    if (licences && !(licences[0].nextLicence && licences[1].nextLicence)) {
      for (let i = 0; i < licences.length - 1; i++) {
        if (i != licences.length - 1) {
          licences[i].nextLicence = licences[i + 1];
        }
        if (i != 0) {
          licences[i].prevLicence = licences[i - 1];
        }
      }
    }

    const sidebarLinks = [
      {
        label: "Dashboard",
        location: "dashboard",
        icon: "home",
        show: true,
        highlight: "dashboardelement"
      },
      {
        label: "Profile",
        location: "profile",
        icon: "alicorn",
        show: config.showProfile,
        highlight: "profileelement"
      },
      {
        label: "Message Center",
        location: "messagecenter",
        icon: "envelope",
        show: config.showMessageCenter
      },
      {
        label: "Billing",
        location: "billing",
        icon: "file-invoice-dollar",
        show: this.props.isadmin && config.showBilling,
        highlight: "billingelement"
      },
      {
        label: "Security",
        location: "security",
        icon: "user-shield",
        show: this.props.isadmin,
        highlight: "securityelement"
      },
      {
        label: "Teams",
        location: "team",
        icon: "users",
        show: this.props.isadmin,
        highlight: "teamelement"
      },
      {
        label: "Marketplace",
        location: "marketplace",
        icon: "shopping-cart",
        show: config.showMarketplace,
        highlight: "marketplaceelement"
      },
      {
        label: "Integrating Accounts",
        location: "integrations",
        icon: "shapes",
        show: true,
        highlight: "integrationselement"
      },
      {
        label: "Domains",
        location: "domains",
        icon: "atlas",
        show: config.showDomains
      },
      {
        label: "Usage Statistics",
        location: "usage",
        icon: "chart-line",
        show: this.props.isadmin
      },
      {
        label: "Support",
        location: "support",
        icon: "ambulance",
        show: true,
        highlight: "supportelement"
      },
      {
        label: "AppAdmin",
        location: "appadmin",
        icon: "screwdriver",
        show: config.showAppAdmin,
        highlight: "appadminelement"
      },
      {
        label: "Admin",
        location: "admin",
        icon: "layer-plus",
        show: this.props.isadmin && config.showAdmin,
        highlight: "adminelement"
      },
      {
        label: "SSO Configurator",
        location: "ssoconfig",
        icon: "dice-d12",
        show: this.props.isadmin && config.showSsoConfig,
        highlight: "ssoconfig"
      },
      {
        label: "SSO Tester",
        location: "ssotest",
        icon: "dragon",
        show: false,
        highlight: "ssotest"
      }
    ];

    const filteredLicences0 = licences.filter(licence => {
      if (licence.disabled || (licence.endtime && moment().isAfter(licence.endtime))) {
        return false;
      }
      let one = false,
        two = false;
      if (this.state.searchstring === "") {
        return true;
      }
      if (
        licence.boughtplanid.alias !== null &&
        !licence.boughtplanid.alias.toLowerCase().includes(this.state.searchstring.toLowerCase())
      ) {
        one = true;
      }
      if (
        licence.boughtplanid.planid.appid.name !== null &&
        !licence.boughtplanid.planid.appid.name
          .toLowerCase()
          .includes(this.state.searchstring.toLowerCase())
      ) {
        two = true;
      }
      if (one && two) {
        return false;
      } //include search if search
      return true;
    });
    let filteredLicences;
    if (this.state.sortstring == "Custom") {
      //Handle "Custom" seperatly
      filteredLicences = this.sortCustomlist(licences);
    } else {
      filteredLicences = filteredLicences0.sort((a, b) => {
        let a0; //Placeholder for a
        let b0; //Placeholder for b
        switch (
          this.state.sortstring //look what to search for an assin the fitting values
        ) {
          case "Name":
            if (a.boughtplanid.alias !== null && a.boughtplanid.alias != "") {
              a0 = a.boughtplanid.alias.toLowerCase();
            } else {
              a0 = a.boughtplanid.planid.appid.name.toLowerCase();
            }
            if (b.boughtplanid.alias !== null && b.boughtplanid.alias != "") {
              b0 = b.boughtplanid.alias.toLowerCase();
            } else {
              b0 = b.boughtplanid.planid.appid.name.toLowerCase();
            }
            break;
          case "Boughtplanid":
            a0 = a.boughtplanid.id;
            b0 = b.boughtplanid.id;
            break;
          case "???":
            break;
          case "Last_used":
            break;
          case "Endtime":
            a0 = a.endtime;
            b0 = b.endtime;
            break;
          case "Buytime":
            a0 = a.boughtplanid.buytime.toLowerCase();
            b0 = b.boughtplanid.buytime.toLowerCase();
            break;
          case "Total_price":
            a0 = a.boughtplanid.totalprice;
            b0 = b.boughtplanid.totalprice;
            break;
        }
        if (a0 === null) {
          if (this.state.sortorientation) {
            return 1;
          } else {
            return -1;
          }
        }

        if (b0 === null) {
          if (this.state.sortorientation) {
            return -1;
          } else {
            return 1;
          }
        }

        if (a0 < b0) {
          if (this.state.sortorientation) {
            return -1;
          } else {
            return 1;
          }
        }

        if (a0 > b0) {
          if (this.state.sortorientation) {
            return 1;
          } else {
            return -1;
          }
        }

        return 0;
      });
    }

    return (
      <AppContext.Consumer>
        {context => (
          <div
            className={`sidebar${sidebarOpen ? "" : "-small"}`}
            ref={el => context.addRenderElement({ key: "sidebar", element: el })}>
            <ul className="sidebar-link-holder">
              <li
                onClick={() => this.props.toggleSidebar()}
                className={`sidebar-nav-icon${sidebarOpen ? "" : "-turn"}`}>
                <i className="fal fa-angle-left" />
              </li>

              <li className={`sidebar-main ${sidebarOpen ? "" : "sidebar-nav-small"}`}>
                <ul>{sidebarLinks.map(link => this.renderLink(link, context.addRenderElement))}</ul>

                {/* 
              <li
                className="sidebar-link"
                style={
                  sidebarOpen
                    ? {
                        backgroundColor: "transparent",
                        height: "35px",
                        paddingBottom: 0,
                        paddingTop: 0,
                        transitionDuration: "0ms"
                      }
                    : { backgroundColor: "transparent", transitionDuration: "0ms" }
                }>
                {sidebarOpen ? (
                  <React.Fragment>
                    <button className="naked-button genericButton">
                      <span className="textButton">
                        <i className="fal fa-search" />
                      </span>
                    </button>
                    <input
                      onChange={e => this.setState({ searchstring: e.target.value })}
                      value={this.state.searchstring}
                      style={{ width: "160px" }}
                      className="inputBoxField"
                    />
                  </React.Fragment>
                ) : (
                  <span className="textButton">
                    <i className="fal fa-search" />
                  </span>
                )}
              </li> */}

                {/* <li className="sidebar-link">
                <span>
                  <div
                    style={{ display: "inline-block", width: "100px" }}
                    onClick={() => {
                      if (this.state.sortorientation) {
                        this.setState({ sortorientation: false });
                      } else {
                        this.setState({ sortorientation: true });
                      }
                    }}
                    className="sidebar-link">
                    {this.state.sortstring}
                  </div>
                  <button
                    onClick={this.toggleNotificationPopup}
                    style={{ display: "inline" }}
                    className="naked-button genericButton">
                    <span className="textButton">
                      <i className="fal fa-search" />
                    </span>
                  </button>
                </span>
                {this.state.showNotification ? (
                  <div
                    className="notificationPopup"
                    onClick={this.toggleNotificationPopup}
                    style={{ width: "159px", minWidth: "0px", left: "21%", top: "72%" }}>
                    <li
                      className="sidebar-link"
                      style={{ color: "black" }}
                      onClick={() => {
                        this.setState({ sortstring: "Custom" });
                      }}>
                      Custom
                    </li>
                    <li
                      className="sidebar-link"
                      style={{ color: "black" }}
                      onClick={() => {
                        this.setState({ sortstring: "Name" });
                      }}>
                      Name
                    </li>
                    <li
                      className="sidebar-link"
                      style={{ color: "black" }}
                      onClick={() => {
                        this.setState({ sortstring: "Boughtplanid" });
                      }}>
                      Boughtplanid
                    </li>
                    <li
                      className="sidebar-link"
                      style={{ color: "black" }}
                      onClick={() => {
                        this.setState({ sortstring: "???" });
                      }}>
                      ?bought Date?
                    </li>
                    <li
                      className="sidebar-link"
                      style={{ color: "black" }}
                      onClick={() => {
                        this.setState({ sortstring: "Last_used" });
                      }}>
                      Last used
                    </li>
                    <li
                      className="sidebar-link"
                      style={{ color: "black" }}
                      onClick={() => {
                        this.setState({ sortstring: "Endtime" });
                      }}>
                      Endtime
                    </li>
                    <li
                      className="sidebar-link"
                      style={{ color: "black" }}
                      onClick={() => {
                        this.setState({ sortstring: "Buytime" });
                      }}>
                      Buytime
                    </li>
                    <li
                      className="sidebar-link"
                      style={{ color: "black" }}
                      onClick={() => {
                        this.setState({ sortstring: "Total_price" });
                      }}>
                      Total price
                    </li>
                  </div>
                ) : (
                  ""
                )}
              </li> */}

                <ul>
                  <li className={`sidebar-link-apps${sidebarOpen ? "" : "-small"}`}>
                    <Tooltip
                      useHover={!sidebarOpen}
                      padding="0px"
                      distance={4}
                      arrowSize={5}
                      direction="right"
                      content={SortComponent}>
                      <i className="fal fa-th-large sidebar-icons" />
                    </Tooltip>
                    <span className={`${sidebarOpen ? "sidebar-link-caption" : "show-not"}`}>
                      Apps
                    </span>

                    {sidebarOpen && (
                      <React.Fragment>
                        <Tooltip
                          arrowSize={5}
                          content={`${showApps ? "Hide" : "Show"} Apps`}
                          direction="right">
                          <button
                            type="button"
                            onClick={() =>
                              this.setState(prevState => ({
                                ...prevState,
                                showApps: !prevState.showApps
                              }))
                            }
                            className="naked-button">
                            <i className={`fal fa-angle-right ${showApps ? "open" : "        "}`} />
                          </button>
                        </Tooltip>

                        <button
                          type="button"
                          onClick={() => {
                            console.log("HI");
                          }}
                          className="naked-button">
                          <i className="fal fa-ellipsis-v" />
                        </button>
                      </React.Fragment>
                    )}
                  </li>

                  <li style={sidebarOpen ? { marginLeft: "6px" } : {}}>
                    <ul>
                      <li style={{ marginLeft: "11px" }} className="sidebar-link">
                        <button
                          type="button"
                          onClick={() => console.log("I am the mighty searchbar")}
                          className="naked-button">
                          <i className="fal fa-search" />

                          <span className={`${sidebarOpen ? "sidebar-link-caption" : "show-not"}`}>
                            Search Apps
                          </span>
                        </button>
                      </li>

                      {showApps &&
                        filteredLicences.length > 0 &&
                        filteredLicences
                          .filter((_, index) => (showMoreApps ? true : index < 5))
                          .map((licence, key) => {
                            const maxValue = filteredLicences.reduce(
                              (acc, cv) => Math.max(acc, cv.layoutvertical),
                              0
                            );
                            //console.log((this.state.searchstring === "") && (this.state.sortstring === "Custom"));
                            // Make sure that every License has an index
                            if (licence.layoutvertical === null) {
                              licence.layoutvertical = maxValue + 1;
                            }

                            return (
                              <SidebarLink
                                key={`ServiceLogo-${licence.id}`}
                                licence={licence}
                                openInstances={this.props.openInstances}
                                sidebarOpen={sidebarOpen}
                                active={
                                  this.props.openInstances && this.props.openInstances[licence.id]
                                    ? this.props.openInstances[licence.id][this.props.viewID]
                                    : false
                                }
                                setTeam={this.props.setApp}
                                setInstance={this.props.setInstance}
                                viewID={this.props.viewID}
                                handleDragStart={null}
                                handleDrop={this.handleDrop}
                                isSearching={
                                  this.state.searchstring === "" &&
                                  this.state.sortstring === "Custom"
                                }
                              />
                            );
                          })}
                    </ul>
                  </li>

                  {showApps && (
                    <li className={`show-more${sidebarOpen ? "" : "-small"}`}>
                      <Tooltip
                        useHover={!sidebarOpen}
                        direction="right"
                        content={`Show ${showMoreApps ? "less" : "more"} Apps`}>
                        <button
                          type="button"
                          onClick={() =>
                            this.setState(prevState => ({
                              ...prevState,
                              showMoreApps: !prevState.showMoreApps
                            }))
                          }
                          className="naked-button">
                          <i className={`fal fa-angle-down ${showMoreApps ? "open" : ""}`} />

                          <span className={`${sidebarOpen ? "sidebar-link-caption" : "show-not"}`}>
                            {`Show ${showMoreApps ? "less" : "more"} Apps`}
                          </span>
                        </button>
                      </Tooltip>
                    </li>
                  )}
                </ul>
              </li>

              <li
                className={`sidebar-link${sidebarOpen ? "" : "-small"}`}
                onClick={() => this.props.logMeOut()}>
                <Tooltip arrowSize={5} content="Logout" direction="right" useHover={!sidebarOpen}>
                  <i className="fal fa-sign-out-alt sidebar-icons" />
                </Tooltip>
                <span className={`${sidebarOpen ? "sidebar-link-caption" : "show-not"}`}>
                  Logout
                </span>
              </li>
            </ul>
          </div>
        )}
      </AppContext.Consumer>
    );
  }
}

export default graphql(UPDATE_LAYOUT, { name: "updateLayout" })(Sidebar);
