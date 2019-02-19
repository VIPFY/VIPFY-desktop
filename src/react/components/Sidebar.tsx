import * as React from "react";
import { graphql, Query, Mutation } from "react-apollo";
import * as pjson from "pjson";
import LoadingDiv from "./LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";
import { GET_USER_CONFIG, fetchLicences } from "../queries/auth";
import { UPDATE_LAYOUT } from "../mutations/auth";
import { Licence } from "../interfaces";
import { AppContext } from "../common/functions";
import SidebarLink from "./sidebarLink";
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
  saveLayout: Mutation;
  layout: string[] | null;
  moveTo: Function;
  viewID: number;
  openInstances: any;
  setInstance: Function;
  sidebarloaded: Function;
};

interface State {
  dragItem: number | null;
}

class SidebarHolder extends React.Component<SidebarProps, State> {
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

    const newLicences = this.props.licences.map((licence: Licence) => {
      if (licence.id == id) {
        return this.props.licences.find((item: Licence) => item.id == dragItem!);
      } else if (licence.id == dragItem!) {
        return this.props.licences.find((item: Licence) => item.id == id);
      } else {
        return licence;
      }
    });

    try {
      const vertical = newLicences.map(licence => licence.id);
      await this.props.saveLayout({
        variables: { vertical },
        refetchQueries: [{ query: fetchLicences }, { query: GET_USER_CONFIG }],
        update: cache => {
          const data = cache.readQuery({ query: GET_USER_CONFIG });
          data.me.config.vertical = vertical;
          cache.writeQuery({ query: GET_USER_CONFIG, data });
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
    const { sideBarOpen, licences, layout } = this.props;
    let orderedLicences = licences;

    if (layout && layout.length == licences.length) {
      console.log("DICKTATOR", layout, licences.length);

      orderedLicences = layout.map(id => licences.find(item => item.id == id));
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
              {orderedLicences.length > 0 &&
                orderedLicences.map((licence, key) => (
                  <SidebarLink
                    licence={licence}
                    key={`ServiceLogo-${key}`}
                    openInstances={this.props.openInstances}
                    sideBarOpen={this.props.sideBarOpen}
                    active={this.props.location.pathname === `/area/app/${licence.id}`}
                    setTeam={this.props.setApp}
                    setInstance={this.props.setInstance}
                    viewID={this.props.viewID}
                    handleDragStart={dragItem => this.setState({ dragItem })}
                    handleDrop={this.handleDrop}
                  />
                ))}
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

const Sidebar = graphql(UPDATE_LAYOUT, { name: "saveLayout" })(SidebarHolder);

export default props => (
  <Query query={GET_USER_CONFIG}>
    {({ data, loading, error }) => {
      if (loading || props.licences.loading) {
        return <LoadingDiv text="Fetching data..." />;
      }

      if (error || !data) {
        return <ErrorComp error={filterError(error)} />;
      }

      const { licences, ...moreProps } = props;

      return (
        <Sidebar
          {...moreProps}
          licences={props.licences.fetchLicences}
          layout={data.me.config && data.me.config.vertical ? data.me.config.vertical : null}
        />
      );
    }}
  </Query>
);
