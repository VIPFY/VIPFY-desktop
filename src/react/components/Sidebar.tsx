import * as React from "react";
import { Component } from "react";
import pjson = require("pjson");

export type SidebarProps = {
  history: any[];
  setApp: (licence: number) => void;
  licences: any;
  sideBarOpen: boolean;
  logMeOut: () => void;
  isadmin: boolean;
  toggleSidebar: Function;
};

export type SidebarState = {
  app: string;
};

class Sidebar extends Component<SidebarProps, SidebarState> {
  goTo = view => this.props.history.push(`/area/${view}`);

  showApps = licences => {
    let appLogos: JSX.Element[] = [];
    //console.log("PL", this.props, licences);
    if (licences) {
      licences.forEach((licence, key) => {
        let cssClass = "sidebar-link";
        if (this.props.location.pathname === `/area/app/${licence.id}`) {
          cssClass += " sidebar-active";
        }

        appLogos.push(
          <li
            className={cssClass}
            key={`ServiceLogo-${key}`}
            onClick={() => this.props.setApp(licence.id)}>
            <span
              className="service-logo-small"
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                  licence.boughtplanid.planid.appid.icon
                })`
              }}>
              {licence.boughtplanid.planid.options &&
              licence.boughtplanid.planid.options.external ? (
                <div className="ribbon-small ribbon-small-top-right">
                  <span>E</span>
                </div>
              ) : (
                ""
              )}
            </span>

            <span className={this.props.sideBarOpen ? "sidebar-link-caption" : "show-not"}>
              {licence.boughtplanid.alias
                ? licence.boughtplanid.alias
                : licence.boughtplanid.planid.appid.name}
            </span>
          </li>
        );
      });
    }

    return appLogos;
  };

  renderLink = ({ label, location, icon, show, important }: object) => {
    let cssClass = "sidebar-link";
    if (important) {
      cssClass += " sidebar-link-important";
    }
    if (
      this.props.location.pathname === `/area/${location}` ||
      `${this.props.location.pathname}/dashboard` === `/area/${location}`
    ) {
      cssClass += " sidebar-active";
    }

    if (show) {
      return (
        <li key={location} className={cssClass} onClick={() => this.goTo(location)}>
          <span className={`fal fa-${icon} sidebar-icons`} />
          <span className={`${this.props.sideBarOpen ? "sidebar-link-caption" : "show-not"}`}>
            {label}
          </span>
        </li>
      );
    }
  };

  render() {
    const sidebarLinks = [
      { label: "Dashboard", location: "dashboard", icon: "home", show: true },
      { label: "Profile", location: "profile", icon: "alicorn", show: true },
      /*{ label: "Message Center", location: "messagecenter", icon: "envelope", show: true },*/
      {
        label: "Billing",
        location: "billing",
        icon: "file-invoice-dollar",
        show: this.props.isadmin
      },
      { label: "Security", location: "security", icon: "user-shield", show: this.props.isadmin },
      { label: "Teams", location: "team", icon: "users", show: this.props.isadmin },
      {
        label: "Marketplace",
        location: "marketplace",
        icon: "shopping-cart",
        show: true,
        important: false
      },
      {
        label: "External Accounts",
        location: "integrations",
        icon: "shapes",
        show: true,
        important: false
      },
      {
        label: "Domains",
        location: "domains",
        icon: "atlas",
        show: this.props.isadmin,
        important: false
      },
      {
        label: "Support",
        location: "support",
        icon: "ambulance",
        show: true,
        important: false
      }
    ];

    return (
      <div className={`sidebar${this.props.sideBarOpen ? "" : "-small"}`}>
        {/*<div className={`sidebar-logo ${this.props.sideBarOpen ? "" : "sidebar-logo-small"}`} />*/}
        <ul className="sidebar-link-holder">
          <span onClick={() => this.props.toggleSidebar()} className="fal fa-bars barIcon" />
          {sidebarLinks.map(link => this.renderLink(link))}
          <li className="sidebarfree" />
          {this.showApps(this.props.licences.fetchLicences)}
          <li className="sidebar-link sidebar-link-important" onClick={() => this.props.logMeOut()}>
            <span className="fal fa-sign-out-alt sidebar-icons" />
            <span className={`${this.props.sideBarOpen ? "sidebar-link-caption" : "show-not"}`}>
              Logout
            </span>
          </li>

          {/*this.renderLink({ label: "Advisor", location: "advisor", icon: "envelope", show: true })*/}
        </ul>
        <div className="versionnumber">Version {pjson.version}</div>
      </div>
    );
  }
}

export default Sidebar;
