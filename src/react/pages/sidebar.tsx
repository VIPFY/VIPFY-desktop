import * as React from "react";
import { Component } from "react";
import s from "../../css/Sidebar.scss";

export type SidebarProps = {
  history: any[];
  setapp: any;
  licences: any;
};

export type SidebarState = {
  app: string;
};

class Sidebar extends Component<SidebarProps, SidebarState> {
  setApp(appname) {
    this.props.setapp(appname);
  }

  goTo(view) {
    let gotoview = "/area/" + view;
    this.props.history.push(gotoview);
  }

  showApps(licences) {
    let appLogos: JSX.Element[] = [];
    console.log("SHOWAPPS", licences);
    if (licences) {
      let i = 0;
      licences.forEach(licence => {
        console.log("L", licence);
        appLogos.push(
          <li
            className="sidebar-link"
            key={`ServiceLogo-${i}`}
            onClick={() => this.setApp(licence.boughtplanid.planid.appid.name.toLowerCase())}>
            <span
              className="service-logo-small"
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${
                  licence.boughtplanid.planid.appid.logo
                })`
              }}
            />
            <span className="sidebar-link-caption">{licence.boughtplanid.planid.appid.name}</span>
          </li>
        );
        i++;
      });
    }

    return appLogos;
  }

  render() {
    console.log("NAVI", this.props);
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
          <li className="sidebar-link">
            <span className="fas fa-envelope sidebar-icons" />
            <span className="sidebar-link-caption">Message Center</span>
          </li>
          <li className="sidebar-link" onClick={() => this.goTo("billing")}>
            <span className="fas fa-dollar-sign sidebar-icons" />
            <span className="sidebar-link-caption">Billing</span>
          </li>
          <li
            className="sidebar-link sidebar-link-important"
            onClick={() => this.goTo("marketplace")}>
            <span className="fas fa-shopping-cart sidebar-icons" />
            <span className="sidebar-link-caption">Marketplace</span>
          </li>
          {this.showApps(this.props.licences.fetchLicences)}
          <li className="sidebar-link sidebar-link-important">
            <span className="fas fa-sign-out-alt sidebar-icons" />
            <span className="sidebar-link-caption">Logout</span>
          </li>
        </ul>
      </div>
    );
  }
}

export default Sidebar;
