import * as React from "react";
import { graphql, Query, Mutation } from "react-apollo";
import * as pjson from "pjson";
import * as moment from "moment";
import LoadingDiv from "./LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";
import { GET_USER_CONFIG, fetchLicences } from "../queries/auth";
import { SAVE_LAYOUT } from "../mutations/auth";
import { Licence } from "../interfaces";
import { iconPicFolder } from "../common/constants";
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
  openInstancens: any;
  setInstance: Function;
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

  references: { key; element }[] = [];
  goTo = view => this.props.moveTo(view);

  componentDidMount() {
    if (this.props.layout && this.props.layout.vertical) {
      this.setState({ layout: this.props.layout.vertical });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.layout.vertical.length != this.props.layout.vertical!.length) {
      this.setState({ layout: this.props.layout.vertical! });
    }
  }

  dragStartFunction = (item): void => this.setState({ dragItem: item });
  dragEndFunction = (): void => this.setState({ dragItem: null });

  handleDrop = async (id, licences) => {
    const { dragItem } = this.state;
    console.log("BOOM");
    this.setState({ entered: null });
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
        appLogos.push(
          <SidebarLink
            licence={licence}
            filteredLicences={filteredLicences}
            key={`ServiceLogo-${key}`}
            openInstancens={this.props.openInstancens}
            sideBarOpen={this.props.sideBarOpen}
            active={this.props.location.pathname === `/area/app/${licence.id}`}
            setTeam={this.props.setApp}
            setInstance={this.props.setInstance}
            viewID={this.props.viewID}
            dragItem={this.state.dragItem}
            entered={this.state.entered}
            dragStartFunction={this.dragStartFunction}
            dragOverFunction={e => {
              e.preventDefault();
              this.setState({ entered: licence.id });
            }}
            handleDrop={this.handleDrop}
            dragLeaveFunction={() => this.setState({ entered: null })}
            dragEndFunction={() => {
              this.setState({ entered: null });
              this.dragEndFunction();
            }}
          />
        );
      });
    }

    return <div onDrop={() => this.handleDrop}>{appLogos}</div>;
  };

  addReferences = (key, element, addRenderElement) => {
    this.references.push({ key, element });
    addRenderElement({ key, element });
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
      this.props.location.pathname === `/area/${location}` ||
      `${this.props.location.pathname}/dashboard` === `/area/${location}`
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
      },
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
          <div className={`sidebar${sideBarOpen ? "" : "-small"}`}>
            {console.log("SIDEBAR", context)}
            {/*<div className={`sidebar-logo ${this.props.sideBarOpen ? "" : "sidebar-logo-small"}`} />*/}
            <ul className="sidebar-link-holder">
              <span onClick={() => this.props.toggleSidebar()} className="fal fa-bars barIcon" />
              {sidebarLinks.map(link => this.renderLink(link, context.addRenderElement))}
              <li className="sidebarfree" />
              {this.showApps(this.props.licences.fetchLicences)}
              <li
                className="sidebar-link sidebar-link-important"
                onClick={() => this.props.logMeOut()}>
                <span className="fal fa-sign-out-alt sidebar-icons" />
                <span className={`${sideBarOpen ? "sidebar-link-caption" : "show-not"}`}>
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
