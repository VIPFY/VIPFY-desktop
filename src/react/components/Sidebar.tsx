import * as React from "react";
import Tooltip from "react-tooltip-lite";
import gql from "graphql-tag";
import * as moment from "moment";
import * as ReactDOM from "react-dom";
import { Licence } from "../interfaces";
import Notification from "../components/Notification";
import { sleep, refetchQueries, AppContext } from "../common/functions";
import { me } from "../queries/auth";
import { FETCH_DOMAINS } from "../components/domains/graphql";
import { FETCH_CARDS } from "../queries/billing";
import SidebarApps from "./SidebarApps";
import UserName from "./UserName";
import EmployeePicture from "./EmployeePicture";
import ProfileMenu from "./ProfileMenu";
import {
  FETCH_EMPLOYEES,
  fetchDepartmentsData,
  FETCH_COMPANY,
  FETCH_VIPFY_PLAN,
  VIPFYPlanParts
} from "../queries/departments";
import { FETCH_USER_SECURITY_OVERVIEW } from "./security/graphqlOperations";
import config from "../../configurationManager";

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
      ...VIPFYPlan
    }
  }
  ${VIPFYPlanParts}
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
  location: any;
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
  adminOpen: boolean;
};

interface State {
  doNotOpen: boolean;
  searchString: string;
  sortOrientation: boolean;
  sortString: string;
  showNotification: boolean;
  contextMenu: boolean;
  notify: boolean;
  initialLoad: boolean;
  fetchedNotifications: any;
}

class Sidebar extends React.Component<SidebarProps, State> {
  state = {
    doNotOpen: false,
    searchString: "",
    sortOrientation: true,
    sortString: "Custom",
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
        if (
          subscriptionData.data.newNotification &&
          (!subscriptionData.data.newNotification.options ||
            (subscriptionData.data.newNotification.options &&
              subscriptionData.data.newNotification.options.level > 1))
        ) {
          this.setState({ notify: true });
          setTimeout(() => this.setState({ notify: false }), 5000);
        }
        this.refetchCategories([subscriptionData.data.newNotification], this.props.client);
        if (
          subscriptionData.data.newNotification &&
          (!subscriptionData.data.newNotification.options ||
            (subscriptionData.data.newNotification.options &&
              subscriptionData.data.newNotification.options.type != "update" &&
              (!subscriptionData.data.newNotification.options.level ||
                subscriptionData.data.newNotification.options.level > 1)))
        ) {
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
            client.query({ query: FETCH_USER_SECURITY_OVERVIEW, ...options }),
            client.query({ query: fetchDepartmentsData, ...options })
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
          await client.query({ query: FETCH_COMPANY, ...options });
          break;

        case "semiPublicUser":
          refetchQueries(client, ["onFetchSemiPublicUser"]);
          break;

        case "companyTeams":
          refetchQueries(client, ["fetchCompanyTeams"]);
          break;

        case "vipfyPlan":
          await client.query({ query: FETCH_VIPFY_PLAN, ...options });
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
    if (this.state.doNotOpen) {
      this.setState({ doNotOpen: false });
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
    if (this.state.doNotOpen) {
      this.setState({ doNotOpen: false });
    } else {
      this.setState(prevState => ({ showNotification: !prevState.showNotification }));
    }
  };

  renderLink = (
    { label, location, icon, show, highlight }: SidebarLinks,
    addRenderElement,
    disabled
  ) => {
    //return;
    let cssClass = "sidebar-link";
    let buttonClass = "naked-button itemHolder";
    const { sidebarOpen } = this.props;

    if (!sidebarOpen) {
      cssClass += "-small";
    }

    if (
      this.props.location.pathname.startsWith(`/area/${location}`) ||
      `${this.props.location.pathname}/dashboard`.startsWith(`/area/${location}`)
    ) {
      cssClass += " sidebar-active";
      buttonClass += " selected";
    }
    const id = label.toString() + location.toString() + icon.toString();

    if (show) {
      return (
        <Tooltip
          className="sidebar-tooltip"
          distance={8}
          arrowSize={5}
          useHover={!sidebarOpen}
          content={label}
          direction="right">
          <li
            key={location}
            className={cssClass}
            ref={el => this.maybeAddHighlightReference(location, highlight, el, addRenderElement)}>
            <button
              id={id}
              disabled={disabled}
              className={buttonClass}
              onMouseDown={() => {
                document.getElementById(id).className = "naked-button itemHolder active";
              }}
              onMouseUp={() => {
                document.getElementById(id).className = buttonClass;
                this.goTo(location);
              }}
              onMouseLeave={() => {
                document.getElementById(id).className = buttonClass;
              }}>
              <div className="naked-button sidebarButton">
                <i className={`fal fa-${icon}`} />
              </div>

              <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
                {label}
              </span>
            </button>
          </li>
        </Tooltip>
      );
    }
  };

  render() {
    let { sidebarOpen, licences } = this.props;
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
        label: "Add Credentials",
        location: "integrations",
        icon: "plus",
        show: true,
        highlight: "pluselement"
      },
      {
        label: "Domains",
        location: "domains",
        icon: "atlas",
        show: config.showDomains
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
      if (this.state.searchString === "") {
        return true;
      }

      if (
        licence.boughtplanid.alias !== null &&
        !licence.boughtplanid.alias.toLowerCase().includes(this.state.searchString.toLowerCase())
      ) {
        one = true;
      }
      if (
        licence.boughtplanid.planid.appid.name !== null &&
        !licence.boughtplanid.planid.appid.name
          .toLowerCase()
          .includes(this.state.searchString.toLowerCase())
      ) {
        two = true;
      }
      if (one && two) {
        return false;
      } //include search if search

      return true;
    });
    let filteredLicences = filteredLicences0;

    if (this.state.sortString == "Custom") {
      // Handle "Custom" seperatly
      // filteredLicences = this.sortCustomlist(licences);
    } else {
      filteredLicences = filteredLicences0.sort((a, b) => {
        let a0; //Placeholder for a
        let b0; //Placeholder for b
        switch (
          this.state.sortString //look what to search for an assin the fitting values
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
          if (this.state.sortOrientation) {
            return 1;
          } else {
            return -1;
          }
        }

        if (b0 === null) {
          if (this.state.sortOrientation) {
            return -1;
          } else {
            return 1;
          }
        }

        if (a0 < b0) {
          if (this.state.sortOrientation) {
            return -1;
          } else {
            return 1;
          }
        }

        if (a0 > b0) {
          if (this.state.sortOrientation) {
            return 1;
          } else {
            return -1;
          }
        }

        return 0;
      });
    }

    let cssClass = "sidebar-link";
    let buttonClass = "naked-button itemHolder";

    if (!sidebarOpen) {
      cssClass += "-small";
    }
    if (this.props.adminOpen) {
      cssClass += " sidebar-active";
      buttonClass += " selected";
    }

    return (
      <AppContext.Consumer>
        {context => (
          <div
            className={`sidebar${sidebarOpen ? "" : "-small"} ${
              this.props.impersonation ? "sidebar-impersonate" : ""
            }`}
            style={{ gridTemplateRows: `129px 1fr ${this.props.isadmin ? "185px" : "145px"}` }}
            ref={el => context.addRenderElement({ key: "sidebar", element: el })}>
            {/*<div className={`sidebar original${sidebarOpen ? "" : "-small"}`}>*/}
            <div className="sidebar-nav-icon">
              <Tooltip
                className="sidebar-tooltip-nav"
                distance={16}
                arrowSize={5}
                content={
                  <div style={{ width: "75px" }}>{sidebarOpen ? "Hide" : "Open"} Sidebar</div>
                }
                direction="right">
                <button
                  className="naked-button sidebarButton"
                  onClick={() => this.props.toggleSidebar()}
                  style={{ width: "20px", height: "20px" }}>
                  <i className={`fal fa-angle-left ${sidebarOpen ? "" : "rotate"}`} />
                </button>
              </Tooltip>
            </div>
            <div>
              <Tooltip
                className="sidebar-tooltip"
                distance={8}
                arrowSize={5}
                useHover={!sidebarOpen}
                content={<div style={{ width: "75px" }}>VIPFY</div>}
                direction="right">
                <div className="VIPFYLogo"></div>
              </Tooltip>
              {sidebarLinks.map(link => this.renderLink(link, context.addRenderElement, false))}
              <div className="divider" />
            </div>
            <div className="sidebar-apps">
              {/* Without temporary licences */}
              <SidebarApps
                setApp={this.props.setApp}
                setInstance={this.props.setInstance}
                sidebarOpen={sidebarOpen}
                openInstances={this.props.openInstances}
                licences={
                  filteredLicences /*.filter(
                  ({ tags }) => tags.length < 1 || !tags.includes("vacation")
                )*/
                }
                viewID={this.props.viewID}
                impersonation={this.props.impersonation}
              />

              {/* Temporary licences */}
              {/*<SidebarApps
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
                />*/}
            </div>
            <ul>
              <div className="divider" style={{ marginBottom: "16px" }} />
              <li
                className={`sidebar-link${sidebarOpen ? "" : "-small"} ${
                  this.state.notify ? "notify-user" : ""
                }`}>
                <button className="naked-button itemHolder" onClick={this.toggleNotificationPopup}>
                  <Tooltip
                    className="sidebar-tooltip"
                    distance={12}
                    arrowSize={5}
                    useHover={!sidebarOpen}
                    content="Notifications"
                    direction="right">
                    <div className="naked-button sidebarButton">
                      <i className="far fa-bell" />
                      <span className="notification-amount">
                        {this.props.loading ||
                        !this.props.data ||
                        !this.props.data.fetchNotifications
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
                  closeme={() => this.setState({ showNotification: false, doNotOpen: true })}
                />
              )}

              {this.renderLink(
                {
                  label: "Support",
                  location: "support",
                  icon: "ambulance",
                  show: true,
                  highlight: "supportelement"
                },
                context.addRenderElement,
                false
              )}

              {this.props.isadmin && (
                <li
                  className={cssClass}
                  ref={el => context.addRenderElement({ key: "adminPanel", element: el })}>
                  <button
                    className={buttonClass}
                    onClick={() => {
                      this.props.moveTo("company");
                    }}>
                    <Tooltip
                      className="sidebar-tooltip"
                      distance={12}
                      arrowSize={5}
                      useHover={!sidebarOpen}
                      content="VIPFY Admin"
                      direction="right">
                      <div className="naked-button sidebarButton">
                        <i className="fal fa-users-crown" />
                      </div>
                    </Tooltip>
                    <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
                      Admin Panel
                    </span>
                  </button>
                </li>
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
                    className="sidebar-tooltip"
                    distance={12}
                    arrowSize={5}
                    useHover={!sidebarOpen}
                    content={<UserName unitid={this.props.id} />}
                    direction="right">
                    <div className="naked-button sidebarButton" id="profileOpener">
                      <EmployeePicture
                        hideTitle={true}
                        size={32}
                        className="managerSquare small-profile-pic"
                        employee={this.props}
                        style={{ marginTop: "0px", borderRadius: "32px", fontSize: "12px" }}
                      />
                    </div>
                  </Tooltip>
                  <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
                    <UserName unitid={this.props.id} />
                  </span>
                </button>
              </li>
            </ul>
            {this.state.contextMenu && (
              <ProfileMenu
                closeme={() => this.setState({ contextMenu: false })}
                sidebarOpen={this.props.sidebarOpen}
                history={this.props.history}
                id={this.props.id}
                company={this.props.company.unit.id}
                isadmin={this.props.isadmin}
                logMeOut={this.props.logMeOut}
                goTo={location => {
                  this.goTo(location);
                  this.setState({ contextMenu: false });
                }}
              />
            )}
            {/*</div>*/}
          </div>
        )}
      </AppContext.Consumer>
    );
  }
}

export default Sidebar;
