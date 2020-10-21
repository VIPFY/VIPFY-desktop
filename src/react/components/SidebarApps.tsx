import * as React from "react";
import SidebarLink from "./sidebarLink";
import { Licence } from "../interfaces";
import Tooltip from "react-tooltip-lite";

interface Props {
  sidebarOpen: boolean;
  licences: Licence[];
  header?: string;
  icon?: string;
  setApp: Function;
  impersonation?: boolean;
  maybeAddHighlightReference: Function;
  addRenderElement: Function;
  goTo: Function;
}

interface State {
  showApps: boolean;
  showMoreApps: boolean;
  searchString: string;
  context: Boolean;
  clientX: number;
  clientY: number;
  selected: number;
}

class SidebarApps extends React.Component<Props, State> {
  state = {
    searchString: "",
    showApps: true,
    showMoreApps: false,
    context: false,
    clientX: 0,
    clientY: 0,
    selected: -1
  };

  wrapper = React.createRef();

  componentDidMount() {
    document.addEventListener("mousedown", e => this.handleClickOutside(e));
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", e => this.handleClickOutside(e));
  }

  handleClickOutside(event) {
    if (
      this.state.context &&
      this.wrapper &&
      this.wrapper.current &&
      !this.wrapper.current.contains(event.target)
    ) {
      this.setState({ context: false });
    }
  }

  render() {
    const { sidebarOpen, licences, openInstances, icon } = this.props;
    const { showApps, showMoreApps } = this.state;

    if (licences.length < 1) {
      return null;
    }

    const appOrbitCount = [];
    licences.forEach(l => {
      if (this.props.openServices.find(os => os == l.id)) {
        appOrbitCount[l.boughtplanid.planid.appid.id]
          ? appOrbitCount[l.boughtplanid.planid.appid.id].push(l.id)
          : (appOrbitCount[l.boughtplanid.planid.appid.id] = []);
      }
    });
    const appservices = [];
    this.props.openServices.forEach(os => {
      if (os != "browser") {
        appservices.push(os);
      }
    });
    const { licence, active } = this.props;

    let cssClass = "sidebar-link service";
    let buttonClass = "naked-button serviceHolder";

    if (!sidebarOpen) {
      cssClass += "-small";
    }
    if (active) {
      cssClass += " sidebar-active";
    }

    const browserButtonClass =
      this.props.location.pathname == "/area/browser/browser"
        ? `${buttonClass} selected`
        : buttonClass;
    const openServiceButtonClass =
      this.props.location.pathname.startsWith("/area/dashboard") ||
      this.props.location.pathname == "/area"
        ? `${buttonClass} selected`
        : buttonClass;
    return (
      <ul className="sidebar-main sidebarAppsholder" onBlur={() => this.setState({ selected: -1 })}>
        <li>
          <ul className="sidebar-apps">
            <li
              id="browser"
              className={cssClass}
              ref={el =>
                this.props.maybeAddHighlightReference(
                  "browser",
                  "browserelement",
                  el,
                  this.props.addRenderElement
                )
              }>
              <button
                id="browserbutton"
                type="button"
                onMouseDown={() => {
                  document.getElementById("browserbutton").className =
                    "naked-button serviceHolder active";
                }}
                onMouseUp={() => {
                  this.props.setApp("browser");
                  document.getElementById("browserbutton").className = browserButtonClass;
                }}
                onMouseLeave={() => {
                  document.getElementById("browserbutton").className = browserButtonClass;
                }}
                className={browserButtonClass} /*sidebar-link-apps*/
              >
                <Tooltip
                  direction="right"
                  arrowSize={5}
                  useHover={!sidebarOpen}
                  content="The Web"
                  className="sidebar-tooltip">
                  <div className="naked-button sidebarButton">
                    <div className="service-hover">
                      <i className="fad fa-globe" style={{ fontSize: "32px" }} />
                    </div>
                  </div>
                </Tooltip>

                <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
                  The Web
                </span>
              </button>
            </li>
            {appservices.map(os => (
              <SidebarLink
                disabled={false}
                key={`ServiceLogo-${os}`}
                licence={this.props.licences.find(l => l.id == os)}
                openInstances={openInstances}
                sidebarOpen={sidebarOpen}
                active={false}
                setTeam={this.props.setApp}
                setInstance={this.props.setInstance}
                viewID={this.props.viewID}
                isSearching={this.state.searchString === ""}
                selected={this.props.showService == os}
                multipleOrbits={
                  this.props.licences.find(l => l.id == os) &&
                  appOrbitCount[
                    this.props.licences.find(l => l.id == os).boughtplanid.planid.appid.id
                  ] &&
                  appOrbitCount[
                    this.props.licences.find(l => l.id == os).boughtplanid.planid.appid.id
                  ].length > 0
                }
              />
            ))}
            {/*} <li
              id="openService"
              className={cssClass}
              ref={el =>
                this.props.maybeAddHighlightReference(
                  "dashboard",
                  "dashboardelement",
                  el,
                  this.props.addRenderElement
                )
              }>
              <button
                id="openServicebutton"
                type="button"
                onMouseDown={() => {
                  document.getElementById("openServicebutton").className =
                    "naked-button serviceHolder active";
                }}
                onMouseUp={() => {
                  this.props.goTo("dashboard");
                  document.getElementById("openServicebutton").className = openServiceButtonClass;
                }}
                onMouseLeave={() => {
                  document.getElementById("openServicebutton").className = openServiceButtonClass;
                }}
                className={openServiceButtonClass}>
                <Tooltip
                  direction="right"
                  arrowSize={5}
                  useHover={!sidebarOpen}
                  content="Open service"
                  className="sidebar-tooltip">
                  <div className="naked-button sidebarButton">
                    <div className="service-hover">
                      <i className="fal fa-plus" style={{ fontSize: "20px" }} />
                    </div>
                  </div>
                </Tooltip>

                <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
                  Open Service
                </span>
              </button>
              </li>*/}
          </ul>
        </li>
      </ul>
    );
  }
}

export default SidebarApps;
