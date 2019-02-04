import * as React from "react";
import { graphql } from "react-apollo";
import * as pjson from "pjson";
import { fetchLicences } from "../queries/auth";
import { UPDATE_LAYOUT } from "../mutations/auth";
import { Licence } from "../interfaces";
import { AppContext, findItem } from "../common/functions";
import SidebarLink from "./sidebarLink";
import moment = require("moment");
import config from "../../configurationManager";

interface SidebarLinks {
  label: string;
  location: string;
  icon: string;
  show: boolean;
  important: boolean;
  highlight: any;
}

export type SidebarProps = {
  history: any[];
  setApp: (licence: number) => void;
  licences: Licence[];
  location: object;
  sideBarOpen: boolean;
  logMeOut: () => void;
  isadmin: boolean;
  toggleSidebar: Function;
  updateLayout: Function;
  moveTo: Function;
  viewID: number;
  openInstances: any;
  setInstance: Function;
  sidebarloaded: Function;
};

interface State {
  dragItem: number | null;
}

class Sidebar extends React.Component<SidebarProps, State> {
  state = {
    dragItem: null
  };

  //references: { key; element }[] = [];
  goTo = view => this.props.moveTo(view);

  componentDidMount() {
    this.props.sidebarloaded();
  }

  handleDrop = async id => {
    const { dragItem } = this.state;
    const { licences } = this.props;

    const l1 = licences.find(licence => licence.id == dragItem);
    const pos1 = findItem(licences, dragItem);
    const dragged = {
      id: l1!.id,
      layoutvertical: l1!.layoutvertical ? l1!.layoutvertical : pos1
    };

    const l2 = licences.find(licence => licence.id == id);
    const pos2 = findItem(licences, id);
    const droppedOn = {
      id: l2!.id,
      layoutvertical: l2!.layoutvertical ? l2!.layoutvertical : pos2
    };

    try {
      await this.props.updateLayout({
        variables: { dragged, droppedOn, direction: "VERTICAL" },
        update: cache => {
          const newLicences = licences.map(licence => {
            if (licence.id == id) {
              return { ...l2, layoutvertical: dragged!.layoutvertical };
            } else if (licence.id == dragItem!) {
              return { ...l1, layoutvertical: droppedOn!.layoutvertical };
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
    }

    return newLicences;
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

  renderLink = (
    { label, location, icon, show, important, highlight }: SidebarLinks,
    addRenderElement
  ) => {
    let cssClass = "sidebar-link";
    if (important) {
      cssClass += " sidebar-link-important";
    }

    if (
      this.props.location.pathname.startsWith(`/area/${location}`) ||
      `${this.props.location.pathname}/dashboard`.startsWith(`/area/${location}`)
    ) {
      cssClass += " sidebar-active";
    }

    if (show) {
      return (
        <React.Fragment key={location}>
          <li
            key={location}
            className={cssClass}
            onClick={() => this.goTo(location)}
            ref={el => this.maybeaddHighlightReference(location, highlight, el, addRenderElement)}>
            <span className={`fal fa-${icon} sidebar-icons`} />
            <span className={`${this.props.sideBarOpen ? "sidebar-link-caption" : "show-not"}`}>
              {label}
            </span>
          </li>
        </React.Fragment>
      );
    } else {
      return;
    }
  };

  render() {
    const { sideBarOpen, licences } = this.props;

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
        important: false,
        highlight: "marketplaceelement"
      },
      {
        label: "Integrating Accounts",
        location: "integrations",
        icon: "shapes",
        show: true,
        important: false,
        highlight: "integrationselement"
      },
      /*{
        label: "Domains",
        location: "domains",
        icon: "atlas",
        show: this.props.isadmin,
        important: false
      },*/
      {
        label: "Usage Statistics",
        location: "usage",
        icon: "chart-line",
        show: this.props.isadmin,
        important: false
      },
      {
        label: "Support",
        location: "support",
        icon: "ambulance",
        show: true,
        important: false,
        highlight: "supportelement"
      },
      {
        label: "AppAdmin",
        location: "appadmin",
        icon: "screwdriver",
        show: config.showAppAdmin,
        important: false,
        highlight: "appadminelement"
      },
      {
        label: "Admin",
        location: "admin",
        icon: "layer-plus",
        show: this.props.isadmin && config.showAdmin,
        important: true,
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

    return (
      <AppContext.Consumer>
        {context => (
          <div
            className={`sidebar${sideBarOpen ? "" : "-small"}`}
            ref={el => context.addRenderElement({ key: "sidebar", element: el })}>
            <ul className="sidebar-link-holder">
              <span
                onClick={() => this.props.toggleSidebar()}
                className={`fal fa-angle-left sidebar-nav-icon${sideBarOpen ? "" : "-turn"}`}
              />
              {sidebarLinks.map(link => this.renderLink(link, context.addRenderElement))}
              <li className="sidebarfree" />

              {licences.length > 0 &&
                licences
                  .sort((a, b) => a.layoutvertical - b.layoutvertical)
                  .map((licence, key) => {
                    if (
                      licence.disabled ||
                      (licence.endtime && moment().isAfter(licence.endtime))
                    ) {
                      return null;
                    }

                    return (
                      <SidebarLink
                        key={`ServiceLogo-${licence.id}`}
                        subPosition={key}
                        licence={licence}
                        openInstances={this.props.openInstances}
                        sideBarOpen={this.props.sideBarOpen}
                        active={this.props.location.pathname === `/area/app/${licence.id}`}
                        setTeam={this.props.setApp}
                        setInstance={this.props.setInstance}
                        viewID={this.props.viewID}
                        handleDragStart={dragItem => this.setState({ dragItem })}
                        handleDrop={this.handleDrop}
                      />
                    );
                  })}

              <li
                className="sidebar-link sidebar-link-important"
                onClick={() => this.props.logMeOut()}>
                <span className="fal fa-sign-out-alt sidebar-icons" />
                <span className={`${sideBarOpen ? "sidebar-link-caption" : "show-not"}`}>
                  Logout
                </span>
              </li>
            </ul>
            <div className="versionnumber">Version {pjson.version}</div>
          </div>
        )}
      </AppContext.Consumer>
    );
  }
}

export default graphql(UPDATE_LAYOUT, { name: "updateLayout" })(Sidebar);
