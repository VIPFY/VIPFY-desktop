import * as React from "react";
import Tooltip from "react-tooltip-lite";
import gql from "graphql-tag";
import { Licence } from "../interfaces";
import { AppContext } from "../common/functions";
import config from "../../configurationManager";
import * as moment from "moment";
import * as ReactDOM from "react-dom";
import Notification from "../components/Notification";
import { sleep, refetchQueries } from "../common/functions";
import { fetchLicences, me } from "../queries/auth";
import { FETCH_DOMAINS } from "../components/domains/graphql";
import { FETCH_CARDS } from "../queries/billing";
import SidebarApps from "./SidebarApps";
import UserName from "./UserName";
import PrintEmployeeSquare from "./manager/universal/squares/printEmployeeSquare";
import ProfileMenu from "./ProfileMenu";
import { FETCH_EMPLOYEES } from "../queries/departments";
import { fetchCompanyServices, fetchCompanyService } from "../queries/products";

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription onNewNotification {
    newNotification {
      id
      sendtime
      message
      icon
      changed
      link
    }
  }
`;

const FETCH_CREDIT_DATA = gql`
  {
    fetchCompany {
      createdate
      promocode
    }

    fetchPlans(appid: 66) {
      id
      price
      appid {
        id
        options
        features
        name
        options
        logo
        icon
      }
      features
      name
      currency
      numlicences
      teaserdescription
      options
      optional
      payperiod
      gotoplan {
        id
        numlicences
        currency
        price
        optional
        payperiod
        name
        teaserdescription
        options
      }
    }

    fetchVipfyPlan {
      id
      plan: planid {
        id
        name
      }
    }
  }
`;

interface SidebarLinks {
  label: string;
  location: string;
  icon: string;
  show: any;
  highlight: any;
}

export type SidebarProps = {
  id: number;
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
  subscribeToMore: Function;
  data: any;
  loading: boolean;
  refetch: Function;
};

interface State {
  donotopen: boolean;
  searchstring: string;
  sortorientation: boolean;
  sortstring: string;
  showNotification: boolean;
  contextMenu: boolean;
  notify: boolean;
}

class Sidebar extends React.Component<SidebarProps, State> {
  state = {
    donotopen: false,
    searchstring: "",
    sortorientation: true,
    sortstring: "Custom",
    showNotification: false,
    contextMenu: false,
    notify: false
  };

  //references: { key; element }[] = [];
  goTo = view => this.props.moveTo(view);

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

  async refetchCategories(categories, client) {
    await sleep(2000);
    for (const category of categories) {
      const options = { errorPolicy: "ignore", fetchPolicy: "network-only" };

      switch (category) {
        case "ownLicences":
          await client.query({
            query: fetchLicences,
            ...options
          });
          break;

        case "employees":
          await client.query({
            query: FETCH_EMPLOYEES,
            ...options
          });
          break;

        case "companyServices":
          await refetchQueries(client, ["fetchCompanyService"]);
          break;

        case "domains":
          await client.query({
            query: FETCH_DOMAINS,
            ...options
          });
          break;

        case "foreignLicences":
          await refetchQueries(client, ["fetchUnitApps", "fetchUsersOwnLicences"]);
          break;

        case "invoices":
          await refetchQueries(client, ["FETCH_BILLS"]);
          break;

        case "paymentMethods":
          await client.query({
            query: FETCH_CARDS,
            ...options
          });
          break;

        case "promocode":
          await client.query({
            query: FETCH_CREDIT_DATA,
            ...options
          });
          break;

        case "me":
          await client.query({
            query: me,
            ...options
          });
          break;
      }
    }
  }

  componentDidMount() {
    this.props.sidebarloaded();
    window.addEventListener("keydown", this.listenKeyboard, true);
    document.addEventListener("click", this.handleClickOutside, true);

    this.props.subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data || subscriptionData.error) {
          return prev;
        }

        this.setState({ notify: true });
        setTimeout(() => this.setState({ notify: false }), 5000);

        this.refetchCategories(subscriptionData.data.newNotification.changed, this.props.client);

        return Object.assign({}, prev, {
          fetchNotifications: [subscriptionData.data.newNotification, ...prev.fetchNotifications]
        });
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
    document.removeEventListener("click", this.handleClickOutside, true);
  }

  handleClickInside = e => {
    if (this.state.donotopen) {
      this.setState({ donotopen: false });
    }
  };

  handleClickOutside = e => {
    this.handleClickInside(e);
    const domNode = ReactDOM.findDOMNode(this);
    if (
      (!domNode || !domNode.contains(e.target)) &&
      (this.state.showNotification || this.state.notify)
    ) {
      this.setState({ showNotification: false, notify: false });
    }
  };

  toggleNotificationPopup = e => {
    if (this.state.donotopen) {
      this.setState({ donotopen: false });
    } else {
      this.setState(prevState => ({ showNotification: !prevState.showNotification }));
    }
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
      //cssClass += ` sidebar-active${sidebarOpen ? "" : "-small"}`;
      cssClass += " sidebar-active";
    }

    if (show) {
      return (
        <li
          key={location}
          className={cssClass}
          ref={el => this.maybeaddHighlightReference(location, highlight, el, addRenderElement)}>
          <button className="naked-button itemHolder" onClick={() => this.goTo(location)}>
            <Tooltip
              distance={12}
              arrowSize={5}
              useHover={!sidebarOpen}
              content={label}
              direction="right">
              <div className="naked-button sidebarButton">
                <i className={`fal fa-${icon} sidebar-icon`} />
              </div>
            </Tooltip>
            <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
              {label}
            </span>
          </button>
        </li>
      );
    } else {
      return;
    }
  };

  render() {
    let { sidebarOpen, licences } = this.props;

    if (!licences) {
      licences = [];
    }

    const maxValue = licences.reduce((acc, cv) => Math.max(acc, cv.sidebar), 0);

    const sidebarLinks = [
      {
        label: "Dashboard",
        location: "dashboard",
        icon: "home",
        show: true,
        highlight: "dashboardelement"
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
        show: this.props.isadmin && config.showTeams,
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
        label: "Account Integrator",
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
        label: "Account Manager",
        location: "lmanager",
        icon: "credit-card-blank",
        show: this.props.isadmin,
        important: false,
        highlight: "lmanager"
      },
      {
        label: "Universal Login",
        location: "universallogin",
        icon: "pager",
        show:
          this.props.isadmin && config.showUniversalLoginDebug && this.props.company.unit.id == 14,
        important: false
      },
      {
        label: "Admin",
        location: "admin",
        icon: "layer-plus",
        show: this.props.isadmin && config.showAdmin && this.props.company.unit.id == 14,
        highlight: "adminelement"
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
      }
    ];

    const filteredLicences0 = licences.filter(licence => {
      // Make sure that every License has an index
      if (licence.sidebar === null) {
        licence.sidebar = maxValue + 1;
      }
      if (
        !(
          (!licence.disabled &&
            !licence.pending &&
            !licence.boughtplanid.planid.appid.disabled &&
            (licence.endtime > moment.now() || licence.endtime == null) &&
            !licence.vacationstart) ||
          (!licence.disabled &&
            !licence.pending &&
            licence.vacationstart &&
            licence.vacationstart <= moment.now() &&
            ((licence.vacationend && licence.vacationend > moment.now()) ||
              licence.vacationend == null))
        )
      ) {
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
    let filteredLicences = filteredLicences0;

    if (this.state.sortstring == "Custom") {
      // Handle "Custom" seperatly
      // filteredLicences = this.sortCustomlist(licences);
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
          <ul
            className={`sidebar${sidebarOpen ? "" : "-small"} ${
              this.props.impersonation ? "sidebar-impersonate" : ""
            }`}
            ref={el => context.addRenderElement({ key: "sidebar", element: el })}>
            <li className={`sidebar-nav-icon${sidebarOpen ? "" : "-turn"}`}>
              <Tooltip
                distance={18}
                arrowSize={5}
                content={
                  <div style={{ width: "75px" }}>{sidebarOpen ? "Hide" : "Open"} Sidebar</div>
                }
                direction="right">
                <button
                  className="naked-button sidebarButton"
                  onClick={() => this.props.toggleSidebar()}
                  style={{ margin: "8px 12px" }}>
                  <i className="fal fa-angle-left" />
                </button>
              </Tooltip>
            </li>

            <li className="sidebar-main">
              <ul>{sidebarLinks.map(link => this.renderLink(link, context.addRenderElement))}</ul>

              {/* Without temporary licences */}
              <SidebarApps
                setApp={this.props.setApp}
                setInstance={this.props.setInstance}
                sidebarOpen={sidebarOpen}
                openInstances={this.props.openInstances}
                licences={filteredLicences.filter(({ tags }) => tags.length < 1)}
                viewID={this.props.viewID}
              />

              {/* Temporary licences */}
              <SidebarApps
                header="Temporary Apps"
                icon="island-tropical"
                setApp={this.props.setApp}
                setInstance={this.props.setInstance}
                sidebarOpen={sidebarOpen}
                openInstances={this.props.openInstances}
                licences={filteredLicences.filter(
                  ({ vacationend, vacationstart, tags }) =>
                    tags.length > 0 && vacationstart && moment().isBefore(moment(vacationend))
                )}
                viewID={this.props.viewID}
              />
            </li>

            <li
              className={`sidebar-link${sidebarOpen ? "" : "-small"} ${
                this.state.notify ? "notify-user" : ""
              }`}
              style={{ height: "24px", marginTop: "16px" }}>
              <button className="naked-button itemHolder" onClick={this.toggleNotificationPopup}>
                <Tooltip
                  distance={12}
                  arrowSize={5}
                  useHover={!sidebarOpen}
                  content="Notifications"
                  direction="right">
                  <div className="naked-button sidebarButton">
                    <i className="far fa-bell" />
                    <span className="notification-amount">
                      {this.props.loading || !this.props.data.fetchNotifications
                        ? 0
                        : this.props.data.fetchNotifications.length}
                    </span>
                  </div>
                </Tooltip>
                <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
                  Notifications
                </span>
              </button>
            </li>
            {this.state.showNotification && (
              <Notification
                //sidebar={"1"}
                moveTo={this.props.moveTo}
                data={this.props.data}
                loading={this.props.loading}
                refetch={this.props.refetch}
                style={{ left: sidebarOpen ? "210px" : "50px", zIndex: 1000 }}
                closeme={() => this.setState({ showNotification: false, donotopen: true })}
              />
            )}

            <li
              className={`sidebar-link${sidebarOpen ? "" : "-small"}${
                this.props.location.pathname.startsWith("/area/profile") ||
                `${this.props.location.pathname}/dashboard`.startsWith("/area/profile")
                  ? " sidebar-active"
                  : ""
              }`}>
              <button
                className="naked-button itemHolder"
                onClick={() =>
                  this.setState(prevState => ({ contextMenu: !prevState.contextMenu }))
                }>
                <Tooltip
                  distance={12}
                  arrowSize={5}
                  useHover={!sidebarOpen}
                  content={<UserName unitid={this.props.id} />}
                  direction="right">
                  <div className="naked-button sidebarButton">
                    <PrintEmployeeSquare
                      hideTitle={true}
                      size={24}
                      className="managerSquare small-profile-pic"
                      employee={this.props}
                      styles={{ marginTop: "0px" }}
                    />
                  </div>
                </Tooltip>
                <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
                  <UserName unitid={this.props.id} />
                </span>
              </button>
            </li>
            {this.state.contextMenu && (
              <ProfileMenu
                closeme={() => this.setState({ contextMenu: false })}
                sidebarOpen={this.props.sidebarOpen}
                history={this.props.history}
                id={this.props.id}
                logMeOut={this.props.logMeOut}
                goTo={location => {
                  this.goTo(location);
                  this.setState({ contextMenu: false });
                }}
              />
            )}
          </ul>
        )}
      </AppContext.Consumer>
    );
  }
}

export default Sidebar;
