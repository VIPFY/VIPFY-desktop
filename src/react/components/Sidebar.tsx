import * as React from "react";
import { Component } from "react";
import pjson = require("pjson");
import { AppContext } from "../common/functions";
import SidebarLink from "./sidebarLink";

export type SidebarProps = {
  history: any[];
  setApp: (licence: number) => void;
  licences: any;
  sideBarOpen: boolean;
  logMeOut: () => void;
  isadmin: boolean;
  toggleSidebar: Function;
  moveTo: Function;
  viewID: number;
  openInstancens: any;
  setInstance: Function;
};

export type SidebarState = {};

class Sidebar extends Component<SidebarProps, SidebarState> {
  references: { key; element }[] = [];
  //goTo = view => this.props.history.push(`/area/${view}`);
  goTo = view => this.props.moveTo(view);

  showApps = licences => {
    let appLogos: JSX.Element[] = [];
    //console.log("PL", this.props, licences);
    if (licences) {
      licences.sort(function(a, b) {
        let nameA = a.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });
      licences.forEach((licence, key) => {
        appLogos.push(
          <SidebarLink
            licence={licence}
            key={`ServiceLogo-${key}`}
            openInstancens={this.props.openInstancens}
            sideBarOpen={this.props.sideBarOpen}
            active={this.props.location.pathname === `/area/app/${licence.id}`}
            setTeam={this.props.setApp}
            setInstance={this.props.setInstance}
            viewID={this.props.viewID}
          />
        );
      });
    }

    return appLogos;
  };

  addReferences = (key, element, addRenderElement) => {
    this.references.push({ key, element });
    addRenderElement({ key, element });
  };

  renderLink = (
    { label, location, icon, show, important, highlight },
    tutorialSteps,
    addRenderElement
  ) => {
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

    /*if (tutorialSteps && highlight === tutorialSteps[0].highlightelement) {
      cssClass += " highlightElement";
    }*/

    if (show) {
      return (
        <React.Fragment>
          <li
            key={location}
            className={cssClass}
            onClick={() => this.goTo(location)}
            ref={el =>
              this.references.find(e => e.key === highlight)
                ? ""
                : this.addReferences(highlight, el, addRenderElement)
            }>
            <span className={`fal fa-${icon} sidebar-icons`} />
            <span className={`${this.props.sideBarOpen ? "sidebar-link-caption" : "show-not"}`}>
              {label}
            </span>
          </li>
          {/*tutorialSteps &&
          highlight === tutorialSteps[0].highlightelement &&
          tutorialSteps[0].steptext ? (
            <div
              className="tutorialPopup"
              style={{
                top: this.references.find(e => e.key === highlight)
                  ? this.references.find(e => e.key === highlight)!.element.offsetTop
                  : "",
                left: this.references.find(e => e.key === highlight)
                  ? this.references.find(e => e.key === highlight)!.element.offsetLeft +
                    this.references.find(e => e.key === highlight)!.element.offsetWidth
                  : ""
              }}>
              <div dangerouslySetInnerHTML={{ __html: tutorialSteps[0].steptext }} />
            </div>
          ) : (
            ""
          )*/}
        </React.Fragment>
      );
    }
  };

  render() {
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
        show: true,
        highlight: "profileelement"
      },
      /*{ label: "Message Center", location: "messagecenter", icon: "envelope", show: true },*/
      {
        label: "Billing",
        location: "billing",
        icon: "file-invoice-dollar",
        show: this.props.isadmin,
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
        show: true,
        important: false,
        highlight: "marketplaceelement"
      },
      {
        label: "External Accounts",
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
        show: true,
        important: false,
        highlight: "appadminelement"
      }
    ];

    return (
      <AppContext.Consumer>
        {context => (
          <div className={`sidebar${this.props.sideBarOpen ? "" : "-small"}`}>
            {/*console.log("SIDEBAR", context)*/}
            {/*<div className={`sidebar-logo ${this.props.sideBarOpen ? "" : "sidebar-logo-small"}`} />*/}
            <ul className="sidebar-link-holder">
              <span onClick={() => this.props.toggleSidebar()} className="fal fa-bars barIcon" />
              {sidebarLinks.map(link =>
                this.renderLink(link, context.data.tutorialSteps, context.addRenderElement)
              )}
              <li className="sidebarfree" />
              {this.showApps(this.props.licences.fetchLicences)}
              <li
                className="sidebar-link sidebar-link-important"
                onClick={() => this.props.logMeOut()}>
                <span className="fal fa-sign-out-alt sidebar-icons" />
                <span className={`${this.props.sideBarOpen ? "sidebar-link-caption" : "show-not"}`}>
                  Logout
                </span>
              </li>

              {/*this.renderLink({ label: "Advisor", location: "advisor", icon: "envelope", show: true })*/}
            </ul>
            <div className="versionnumber">Version {pjson.version}</div>
            {/*console.log("TOP", this.references)*/}
            {/*context.setrenderElements(this.references)*/}
          </div>
        )}
      </AppContext.Consumer>
    );
  }
}

export default Sidebar;
