import * as React from "react";
import Tooltip from "react-tooltip-lite";
import gql from "graphql-tag";
import * as moment from "moment";
import * as ReactDOM from "react-dom";
import { Licence } from "../interfaces";
import config from "../../configurationManager";
import Notification from "../components/Notification";
import { sleep, refetchQueries, AppContext } from "../common/functions";
import { me } from "../queries/auth";
import { FETCH_DOMAINS } from "../components/domains/graphql";
import { FETCH_CARDS } from "../queries/billing";
import SidebarApps from "./SidebarApps";
import UserName from "./UserName";
import PrintEmployeeSquare from "./manager/universal/squares/printEmployeeSquare";
import ProfileMenu from "./ProfileMenu";
import { FETCH_EMPLOYEES, fetchDepartmentsData, FETCH_COMPANY } from "../queries/departments";
import { vipfyAdmins, vipfyVacationAdmins } from "../common/constants";
import { FETCH_USER_SECURITY_OVERVIEW } from "./security/graphqlOperations";

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription onNewNotification {
    newNotification {
      id
      sendtime
      message
      icon
      changed
      link
      options
    }
  }
`;

const FETCH_CREDIT_DATA = gql`
  {
    fetchCompany {
      createdate
      promocode
    }

    fetchPlans(appid: 1) {
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
  id: string;
  history: any[];
  setApp: (licence: number) => void;
  licences: Licence[];
  location: object;
  sidebarOpen: boolean;
  logMeOut: () => void;
  isadmin: boolean;
  toggleSidebar: Function;
  moveTo: Function;
  viewID: number;
  openInstances: any;
  setInstance: Function;
  impersonation?: boolean;
  sidebarloaded: Function;
  views: any[];
  subscribeToMore: Function;
  data: any;
  loading: boolean;
  refetch: Function;
  company: any;
};

interface State {
  donotopen: boolean;
  searchstring: string;
  sortorientation: boolean;
  sortstring: string;
  showNotification: boolean;
  contextMenu: boolean;
  notify: boolean;
  initialLoad: boolean;
  fetchedNotifications: any;
}

class Sidebar extends React.Component<SidebarProps, State> {
  state = {
    donotopen: false,
    searchstring: "",
    sortorientation: true,
    sortstring: "Custom",
    showNotification: false,
    contextMenu: false,
    notify: false,
    initialLoad: true,
    fetchedNotifications: new Set()
  };

  componentDidMount() {
    this.props.sidebarloaded();
    window.addEventListener("keydown", this.listenKeyboard);
    document.addEventListener("click", this.handleClickOutside);

    this.props.subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data || subscriptionData.error) {
          return prev;
        }
        this.setState({ notify: true });
        setTimeout(() => this.setState({ notify: false }), 5000);

        if (
          subscriptionData.data.newNotification &&
          subscriptionData.data.newNotification.options &&
          subscriptionData.data.newNotification.options.type != "update"
        ) {
          this.refetchCategories([subscriptionData.data.newNotification], this.props.client);
          return {
            ...prev,
            fetchNotifications: [subscriptionData.data.newNotification, ...prev.fetchNotifications]
          };
        } else {
          return prev;
        }
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard);
    document.removeEventListener("click", this.handleClickOutside);
  }

  async refetchCategories(notifications, client) {
    if (this.state.fetchedNotifications.size > 0) {
      notifications = notifications.filter(({ id }) => !this.state.fetchedNotifications.has(id));
    }
    const flattedCategories = notifications.flatMap(({ changed }) => changed);

    await sleep(2000);

    for (const category of flattedCategories) {
      const options = { errorPolicy: "ignore", fetchPolicy: "network-only" };

      switch (category) {
        case "ownLicences":
          refetchQueries(client, ["fetchUserLicenceAssignments", "onFetchUserLicences"]);
          break;

        case "employees":
          await Promise.all([
            client.query({
              query: FETCH_EMPLOYEES,
              ...options
            }),
            client.query({ query: FETCH_USER_SECURITY_OVERVIEW }),
            client.query({ query: fetchDepartmentsData })
          ]);
          break;

        case "companyServices":
          await refetchQueries(client, ["fetchCompanyService", "allApps"]);
          break;

        case "domains":
          await client.query({
            query: FETCH_DOMAINS,
            ...options
          });
          break;

        case "foreignLicences":
          await refetchQueries(client, ["onFetchUnitApps"]);
          break;

        case "invoices":
          await refetchQueries(client, ["onFetchBills"]);
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

        case "vacationRequest":
          await refetchQueries(client, ["onFetchVacationRequests"]);
          break;

        case "ownTeams":
          await refetchQueries(client, ["fetchTeams"]);
          break;

        case "me":
          await client.query({
            query: me,
            ...options
          });
          break;

        case "company":
          await client.query({ query: FETCH_COMPANY });
          break;
      }
    }

    for (let notification of notifications) {
      this.setState(prevState => {
        const { fetchedNotifications } = prevState;
        fetchedNotifications.add(notification.id);

        return { ...prevState, fetchedNotifications };
      });
    }
  }

  // references: { key; element }[] = [];
  goTo = view => this.props.moveTo(view);

  addReferences = (key, element, addRenderElement) => {
    // this.references.push({ key, element });
    addRenderElement({ key, element });
  };

  maybeAddHighlightReference = (location, highlight, el, addRenderElement) => {
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

  handleClickInside = () => {
    if (this.state.donotopen) {
      this.setState({ donotopen: false });
    }
  };

  handleClickOutside = e => {
    this.handleClickInside();
    const domNode = ReactDOM.findDOMNode(this);
    if (
      (!domNode || !domNode.contains(e.target)) &&
      (this.state.showNotification || this.state.notify)
    ) {
      this.setState({ showNotification: false, notify: false });
    }
  };

  toggleNotificationPopup = () => {
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
      cssClass += " sidebar-active";
    }

    if (show) {
      return (
        <li
          key={location}
          className={cssClass}
          ref={el => this.maybeAddHighlightReference(location, highlight, el, addRenderElement)}>
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
    }
  };

  render() {
    let { sidebarOpen, licences, isadmin } = this.props;
    if (!licences) {
      licences = [];
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
        label: "Message Center",
        location: "messagecenter",
        icon: "envelope",
        show: config.showMessageCenter
      },
      {
        label: "Billing",
        location: "billing",
        icon: "file-invoice-dollar",
        show: isadmin && config.showBilling,
        highlight: "billingelement"
      },
      {
        label: "Security",
        location: "security",
        icon: "user-shield",
        show: isadmin,
        highlight: "securityelement"
      },
      {
        label: "Teams",
        location: "team",
        icon: "users",
        show: isadmin && config.showTeams,
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
        show: isadmin,
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
        show: isadmin
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
        show: isadmin,
        important: false,
        highlight: "dmanager"
      },
      {
        label: "Employee Manager",
        location: "emanager",
        icon: "users-cog",
        show: isadmin,
        important: false,
        highlight: "emanager"
      },
      {
        label: "Service Manager",
        location: "lmanager",
        icon: "credit-card-blank",
        show: isadmin,
        important: false,
        highlight: "lmanager"
      },
      {
        label: "Admin",
        location: "admin",
        icon: "layer-plus",
        show: config.showAdmin && vipfyAdmins.find(admin => admin == this.props.id),
        highlight: "adminelement"
      },
      {
        label: "SSO Configurator",
        location: "ssoconfig",
        icon: "dice-d12",
        show: isadmin && config.showSsoConfig && this.props.company.unit.id == 14,
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
        label: "Vacation Requests",
        location: "vacation",
        icon: "umbrella-beach",
        show:
          config.showVacationRequests && vipfyVacationAdmins.find(admin => admin == this.props.id),
        highlight: "vacation"
      }
    ];
    const filteredLicences0 = licences.filter(licence => {
      if (
        !(
          (!licence.disabled &&
            !licence.pending &&
            !licence.boughtplanid.planid.appid.disabled &&
            (licence.boughtplanid.endtime > moment.now() || licence.boughtplanid.endtime == null) &&
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
                licences={filteredLicences.filter(
                  ({ tags }) => tags.length < 1 || !tags.includes("vacation")
                )}
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
                    tags.length > 0 &&
                    tags.includes("vacation") &&
                    vacationstart &&
                    moment().isBefore(moment(vacationend))
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
                      {this.props.loading || !this.props.data || !this.props.data.fetchNotifications
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
                data={this.props.data || {}}
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
                isadmin={this.props.isadmin}
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
