import * as React from "react";
import { Component } from "react";

export type SidebarProps = {
  history: any[];
  setapp: (licence: number) => void;
  licences: any;
  sidebaropen: boolean;
  logMeOut: () => void;
};

export type SidebarState = {
  app: string;
};

class Sidebar extends Component<SidebarProps, SidebarState> {
  setApp(licence: number) {
    this.props.setapp(licence);
  }

  goTo(view) {
    let gotoview = "/area/" + view;
    this.props.history.push(gotoview);
  }

  showApps(licences, bool) {
    let appLogos: JSX.Element[] = [];
    if (licences) {
      let i = 0;
      licences.forEach(licence => {
        appLogos.push(
          <li
            className="sidebar-link"
            key={`ServiceLogo-${i}`}
            onClick={() => this.setApp(licence.id)}>
            <span
              className="service-logo-small"
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                  licence.boughtplanid.planid.appid.icon
                })`
              }}
            />
            {bool ? (
              <span className="sidebar-link-caption">{licence.boughtplanid.planid.appid.name}</span>
            ) : (
              ""
            )}
          </li>
        );
        i++;
      });
    }

    return appLogos;
  }

  showBilling() {
    if (this.props.billing) {
      if (!this.props.sidebaropen) {
        return (
          <li className="sidebar-link" onClick={() => this.goTo("billing")}>
            <span className="fas fa-dollar-sign sidebar-icons" />
          </li>
        );
      } else {
        return (
          <li className="sidebar-link" onClick={() => this.goTo("billing")}>
            <span className="fas fa-dollar-sign sidebar-icons" />
            <span className="sidebar-link-caption">Billing</span>
          </li>
        );
      }
    }
  }

  showTeams() {
    if (this.props.teams) {
      if (!this.props.sidebaropen) {
        return (
          <li className="sidebar-link" onClick={() => this.goTo("team")}>
            <span className="fas fa-users-cog sidebar-icons" />
          </li>
        );
      } else {
        return (
          <li className="sidebar-link" onClick={() => this.goTo("team")}>
            <span className="fas fa-users-cog sidebar-icons" />
            <span className="sidebar-link-caption">Teams</span>
          </li>
        );
      }
    }
  }

  showMarketplace() {
    if (this.props.marketplace) {
      if (!this.props.sidebaropen) {
        return (
          <li
            className="sidebar-link sidebar-link-important"
            onClick={() => this.goTo("marketplace")}>
            <span className="fas fa-shopping-cart sidebar-icons" />
          </li>
        );
      } else {
        return (
          <li
            className="sidebar-link sidebar-link-important"
            onClick={() => this.goTo("marketplace")}>
            <span className="fas fa-shopping-cart sidebar-icons" />
            <span className="sidebar-link-caption">Marketplace</span>
          </li>
        );
      }
    }
  }

  showDomains = () => {
    if (this.props.domains) {
      return (
        <li className="sidebar-link sidebar-link-important" onClick={() => this.goTo("domains")}>
          <i className="fas fa-code sidebar-icons" />
          {this.props.sidebaropen ? <span className="sidebar-link-caption">Domains</span> : ""}
        </li>
      );
    }
  };

  render() {
    if (!this.props.sidebaropen) {
      return (
        <div className="sidebar-small">
          <div className="sidebar-logo" />
          <ul className="sidebar-link-holder">
            <li className="sidebar-link" onClick={() => this.goTo("dashboard")}>
              <span className="fas fa-home sidebar-icons" />
            </li>
            <li className="sidebar-link">
              <span className="fas fa-user sidebar-icons" />
            </li>
            <li className="sidebar-link" onClick={() => this.goTo("messagecenter")}>
              <span className="fas fa-envelope sidebar-icons" />
            </li>
            {this.showBilling()}
            {this.showTeams()}
            {this.showMarketplace()}
            {this.showDomains()}
            {this.showApps(this.props.licences.fetchLicences, false)}
            <li
              className="sidebar-link sidebar-link-important"
              onClick={() => this.props.logMeOut()}>
              <span className="fas fa-sign-out-alt sidebar-icons" />
            </li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="sidebar">
          <div className="sidebar-logo" />
          <ul className="sidebar-link-holder">
            <li className="sidebar-link" onClick={() => this.goTo("dashboard")}>
              <span className="fas fa-home sidebar-icons" />
              <span className="sidebar-link-caption">Dashboard</span>
            </li>
            <li className="sidebar-link">
              <span className="fas fa-user sidebar-icons" />
              <span className="sidebar-link-caption">Profile</span>
            </li>
            <li className="sidebar-link" onClick={() => this.goTo("messagecenter")}>
              <span className="fas fa-envelope sidebar-icons" />
              <span className="sidebar-link-caption">Message Center</span>
            </li>
            {this.showBilling()}
            {this.showTeams()}
            {this.showMarketplace()}
            {this.showDomains()}
            {this.showApps(this.props.licences.fetchLicences, true)}
            <li
              className="sidebar-link sidebar-link-important"
              onClick={() => this.props.logMeOut()}>
              <span className="fas fa-sign-out-alt sidebar-icons" />
              <span className="sidebar-link-caption">Logout</span>
            </li>
          </ul>
        </div>
      );
    }
  }
}

export default Sidebar;
