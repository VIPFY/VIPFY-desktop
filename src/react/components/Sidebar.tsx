import * as React from "react";
import { graphql, Query, Mutation } from "react-apollo";
import * as pjson from "pjson";
import LoadingDiv from "./LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";
import { GET_USER_CONFIG, fetchLicences } from "../queries/auth";
import { SAVE_LAYOUT } from "../mutations/auth";
import { Licence } from "../interfaces";
import { AppContext } from "../common/functions";
import SidebarLink from "./sidebarLink";

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
  layout: { vertical: string[] | null };
  moveTo: Function;
  viewID: number;
  openInstances: any;
  setInstance: Function;
  sidebarloaded: Function;
};

interface State {
  dragItem: number | null;
  layout: string[];
  licences: Licence[];
}

class SidebarHolder extends React.Component<SidebarProps, State> {
  state = {
    dragItem: null,
    layout: [],
    licences: []
  };

  //references: { key; element }[] = [];
  goTo = view => this.props.moveTo(view);

  componentDidMount() {
    if (this.props.layout && this.props.layout.vertical) {
      const initialState = { layout: this.props.layout.vertical };

      if (this.props.layout.vertical.length > 0 && this.props.licences) {
        const licences = this.props.layout.vertical.map(id =>
          this.props.licences.find(item => item.id == id)
        );
        initialState.licences = licences;
      }

      this.setState(initialState);
    } else {
      this.setState({ licences: this.props.licences });
    }
    this.props.sidebarloaded();
  }

  componentDidUpdate({ layout }) {
    if (layout && layout.vertical && layout.vertical.length != this.props.layout.vertical!.length) {
      this.setState({ layout: this.props.layout.vertical! });
    }
  }

  handleDrop = async id => {
    const { dragItem, licences } = this.state;

    const newLicences = licences.map((licence: Licence) => {
      if (licence.id == id) {
        return licences.find((item: Licence) => item.id == dragItem!);
      } else if (licence.id == dragItem!) {
        return licences.find((item: Licence) => item.id == id);
      } else {
        return licence;
      }
    });

    try {
      const vertical = newLicences.map(licence => licence.id);
      await this.props.saveLayout({
        variables: { vertical },
        refetchQueries: [{ query: fetchLicences }, { query: GET_USER_CONFIG }]
      });

      this.setState({ layout: vertical, licences: newLicences, dragItem: null });
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
    const { sideBarOpen } = this.props;

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
      /*{
        label: "Billing",
        location: "billing",
        icon: "file-invoice-dollar",
        show: this.props.isadmin,
        highlight: "billingelement"
      },*/
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
      /*{
        label: "Marketplace",
        location: "marketplace",
        icon: "shopping-cart",
        show: true,
        important: false,
        highlight: "marketplaceelement"
      },*/
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
      /*{
        label: "AppAdmin",
        location: "appadmin",
        icon: "screwdriver",
        show: true,
        important: false,
        highlight: "appadminelement"
      },*/
      {
        label: "Admin",
        location: "admin",
        icon: "layer-plus",
        show: this.props.isadmin,
        important: true,
        highlight: "adminelement"
      }
    ];

    return (
      <AppContext.Consumer>
        {context => (
          <div
            className={`sidebar${sideBarOpen ? "" : "-small"}`}
            ref={el => context.addRenderElement({ key: "sidebar", element: el })}>
            <ul className="sidebar-link-holder">
              <span onClick={() => this.props.toggleSidebar()} className="fal fa-bars barIcon" />
              {sidebarLinks.map(link => this.renderLink(link, context.addRenderElement))}
              <li className="sidebarfree" />
              {console.log("Licence", this.state.licences)}
              {this.state.licences.length > 0 &&
                this.state.licences.map((licence, key) => (
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

const Sidebar = graphql(SAVE_LAYOUT, { name: "saveLayout" })(SidebarHolder);

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

      const filteredLicences = props.licences.fetchLicences;
      return <Sidebar {...moreProps} licences={filteredLicences} layout={data.me.config} />;
    }}
  </Query>
);
