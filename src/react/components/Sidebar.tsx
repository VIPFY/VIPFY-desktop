import * as React from "react";
import { compose, graphql, Query, Mutation } from "react-apollo";
import * as pjson from "pjson";
import * as moment from "moment";
import LoadingDiv from "./LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";
import { GET_USER_CONFIG, fetchLicences } from "../queries/auth";
import { SAVE_LAYOUT } from "../mutations/auth";
import { Licence } from "../interfaces";
import { iconPicFolder } from "../common/constants";

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
};

interface State {
  dragItem: number | null;
  entered: number | null;
  layout: string[];
}

class SidebarHolder extends React.Component<SidebarProps, State> {
  state = {
    dragItem: null,
    entered: null,
    layout: []
  };

  componentDidMount() {
    if (this.props.layout && this.props.layout.vertical) {
      this.setState({ layout: this.props.layout.vertical });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.layout.vertical.length != this.props.layout.vertical.length) {
      this.setState({ layout: this.props.layout.vertical });
    }
  }

  dragStartFunction = (item): void => this.setState({ dragItem: item });
  dragEndFunction = (): void => this.setState({ dragItem: null });

  handleDrop = async (id, licences) => {
    const { dragItem } = this.state;

    const newLicences = licences.map(licence => {
      if (licence.id == id) {
        return licences.find(item => item.id == dragItem!);
      } else if (licence.id == dragItem!) {
        return licences.find(item => item.id == id);
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

      this.setState({ layout: vertical });
    } catch (error) {
      console.log(error);
    }

    return newLicences;
  };

  showApps = (fetchedLicences: Licence[]) => {
    let appLogos: JSX.Element[] = [];
    if (fetchedLicences) {
      let licences = fetchedLicences;

      if (this.state.layout.length > 0) {
        licences = this.state.layout.map(id => licences.find(item => item.id == id));
      }

      const filteredLicences = licences.filter(licence => {
        if (!licence) {
          return false;
        } else if (!licence.endtime) {
          return true;
        } else {
          return moment().isBefore(licence.endtime);
        }
      });

      filteredLicences.forEach((licence, key) => {
        let cssClass = "sidebar-link-app";
        if (this.props.location.pathname === `/area/app/${licence.id}`) {
          cssClass += " sidebar-active";
        }

        appLogos.push(
          <li
            className={`${cssClass}${this.state.dragItem == licence.id ? " hold" : ""}${
              this.state.entered == licence.id ? " hovered" : ""
            }`}
            key={`ServiceLogo-${key}`}
            draggable={true}
            onDragStart={() => this.dragStartFunction(licence.id)}
            onDragOver={e => {
              e.preventDefault();
              this.setState({ entered: licence.id });
            }}
            onDragLeave={() => this.setState({ entered: null })}
            onDragEnd={() => {
              this.setState({ entered: null });
              this.dragEndFunction();
            }}
            onDrop={() => {
              this.setState({ entered: null });
              this.handleDrop(licence.id, filteredLicences);
            }}
            onClick={() => this.props.setApp(licence.id)}>
            <span
              className="service-logo-small"
              style={{
                backgroundImage: `url(${iconPicFolder}${licence.boughtplanid.planid.appid.icon})`
              }}>
              {licence.boughtplanid.planid.options && licence.boughtplanid.planid.options.external && (
                <div className="ribbon-small ribbon-small-top-right">
                  <span>E</span>
                </div>
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
        <li
          key={location}
          className={cssClass}
          onClick={() => this.props.history.push(`/area/${location}`)}>
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
      /*{
        label: "Marketplace",
        location: "marketplace",
        icon: "shopping-cart",
        show: true,
        important: false
      },*/
      {
        label: "External Accounts",
        location: "integrations",
        icon: "shapes",
        show: true,
        important: false
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
        important: false
      } /*,
      {
        label: "AppAdmin",
        location: "appadmin",
        icon: "screwdriver",
        show: true,
        important: false
      }*/
    ];

    return (
      <div className={`sidebar${this.props.sideBarOpen ? "" : "-small"}`}>
        {/*<div className={`sidebar-logo ${this.props.sideBarOpen ? "" : "sidebar-logo-small"}`} />*/}
        <ul className="sidebar-link-holder">
          <span onClick={() => this.props.toggleSidebar()} className="fal fa-bars barIcon" />
          {sidebarLinks.map(link => this.renderLink(link))}
          <li className="sidebarfree" />

          {this.showApps(this.props.licences.fetchLicences)}

          <li className="sidebar-link sidebar-link-important" onClick={this.props.logMeOut}>
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

const Sidebar = graphql(SAVE_LAYOUT, { name: "saveLayout" })(SidebarHolder);

export default props => (
  <Query query={GET_USER_CONFIG}>
    {({ data, loading, error }) => {
      if (loading || props.licences.loading) {
        return <LoadingDiv text="Fetching data..." />;
      }

      if (error || !data) {
        return <ErrorComp error={error} />;
      }
      return <Sidebar {...props} layout={data.me.config} />;
    }}
  </Query>
);
