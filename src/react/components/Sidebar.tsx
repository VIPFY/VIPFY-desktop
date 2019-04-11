import * as React from "react";
import { graphql } from "react-apollo";
import * as pjson from "pjson";
import { fetchLicences } from "../queries/auth";
import { UPDATE_LAYOUT } from "../mutations/auth";
import { Licence } from "../interfaces";
import { AppContext, layoutChange } from "../common/functions";
import SidebarLink from "./sidebarLink";
import config from "../../configurationManager";
import * as moment from "moment";

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
  views: any[];
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
    }
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
      {
        label: "Domains",
        location: "domains",
        icon: "atlas",
        show: config.showDomains,
        important: false
      },
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

    const filteredLicences = licences.filter(licence => {
      if (licence.disabled || (licence.endtime && moment().isAfter(licence.endtime))) {
        return false;
      }

      return true;
    });
    filteredLicences
      .sort((a, b) => {
        if (a.layoutvertical === null) {
          return 1;
        }

        if (b.layoutvertical === null) {
          return -1;
        }

        if (a.layoutvertical < b.layoutvertical) {
          return -1;
        }

        if (a.layoutvertical > b.layoutvertical) {
          return 1;
        }

        return 0;
      })
      .sort(function(a, b) {
        let nameA = a.boughtplanid.alias
          ? a.boughtplanid.alias.toUpperCase()
          : a.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.boughtplanid.alias
          ? b.boughtplanid.alias.toUpperCase()
          : b.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });

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
              {filteredLicences.length > 0 &&
                filteredLicences.map((licence, key) => {
                  const maxValue = filteredLicences.reduce(
                    (acc, cv) => Math.max(acc, cv.layoutvertical),
                    0
                  );

                  // Make sure that every License has an index
                  if (licence.layoutvertical === null) {
                    licence.layoutvertical = maxValue + 1;
                  }
                  return (
                    <SidebarLink
                      key={`ServiceLogo-${licence.id}`}
                      licence={licence}
                      openInstances={this.props.openInstances}
                      sideBarOpen={this.props.sideBarOpen}
                      active={
                        this.props.openInstances && this.props.openInstances[licence.id]
                          ? this.props.openInstances[licence.id][this.props.viewID]
                          : false
                      }
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
