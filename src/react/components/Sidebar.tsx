import * as React from "react";
import { Component } from "react";

export type SidebarProps = {
  history: any[];
  setApp: (licence: number) => void;
  licences: any;
  sideBarOpen: boolean;
  logMeOut: () => void;
};

export type SidebarState = {
  app: string;
};

class Sidebar extends Component<SidebarProps, SidebarState> {
  goTo = view => this.props.history.push(`/area/${view}`);

  showApps = licences => {
    let appLogos: JSX.Element[] = [];
    if (licences) {
      licences.forEach((licence, key) => {
        appLogos.push(
          <li
            className="sidebar-link"
            key={`ServiceLogo-${key}`}
            onClick={() => this.props.setApp(licence.id)}>
            <span
              className="service-logo-small"
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                  licence.boughtplanid.planid.appid.icon
                })`
              }}
            />
            <span className={this.props.sideBarOpen ? "sidebar-link-caption" : "show-not"}>
              {licence.boughtplanid.planid.appid.name}
            </span>
          </li>
        );
      });
    }

    return appLogos;
  };

  renderLink = ({ label, location, icon, show, important }: object) => {
    if (show) {
      return (
        <li
          key={location}
          className={`sidebar-link ${important ? "sidebar-link-important" : ""}`}
          onClick={() => this.goTo(location)}>
          <span className={`fas fa-${icon} sidebar-icons`} />
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
      { label: "Profile", location: "profile", icon: "user", show: true },
      { label: "Message Center", location: "messagecenter", icon: "envelope", show: true },
      { label: "Billing", location: "billing", icon: "dollar-sign", show: this.props.billing },
      { label: "Teams", location: "team", icon: "users-cog", show: this.props.teams },
      {
        label: "Marketplace",
        location: "marketplace",
        icon: "shopping-cart",
        show: this.props.marketplace,
        important: true
      },
      {
        label: "Domains",
        location: "domains",
        icon: "code",
        show: this.props.domains,
        important: true
      }
    ];

    return (
      <div className={`sidebar${this.props.sideBarOpen ? "" : "-small"}`}>
        <div className="sidebar-logo" />
        <ul className="sidebar-link-holder">
          {sidebarLinks.map(link => this.renderLink(link))}
          {this.showApps(this.props.licences.fetchLicences)}

          <li className="sidebar-link sidebar-link-important" onClick={() => this.props.logMeOut()}>
            <span className="fas fa-sign-out-alt sidebar-icons" />
            <span className={`${this.props.sideBarOpen ? "sidebar-link-caption" : "show-not"}`}>
              Logout
            </span>
          </li>

          {/*this.renderLink({ label: "Advisor", location: "advisor", icon: "envelope", show: true })*/}
        </ul>
      </div>
    );
  }
}

export default Sidebar;
