import * as React from "react";
import Tooltip from "react-tooltip-lite";
import { clipboard } from "electron";
import SidebarLink from "./sidebarLink";
import { Licence } from "../interfaces";

interface Props {
  sidebarOpen: boolean;
  licences: Licence[];
  header?: string;
  icon?: string;
  setApp: Function;
  impersonation?: boolean;
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

  toggleApps = () =>
    this.setState(prevState => ({
      ...prevState,
      showApps: !prevState.showApps
    }));

  handleArrowKeys(key) {
    switch (key) {
      case "ArrowDown":
        if (
          (this.state.showMoreApps &&
            this.state.selected <
              this.props.licences.filter(licence => {
                if (licence.boughtplanid.alias) {
                  return licence.boughtplanid.alias
                    .toUpperCase()
                    .includes(this.state.searchString.toUpperCase());
                } else {
                  return licence.boughtplanid.planid.appid.name
                    .toUpperCase()
                    .includes(this.state.searchString.toUpperCase());
                }
              }).length -
                1) ||
          (!this.state.showMoreApps && this.state.selected < 4)
        ) {
          this.setState(oldstate => ({ ...oldstate, selected: oldstate.selected + 1 }));
        }
        break;
      case "ArrowUp":
        {
          /*if (this.state.selected == 0) {
            this.searchInput.focus();
          }*/
          if (this.state.selected >= 0) {
            this.setState(oldstate => ({ ...oldstate, selected: oldstate.selected - 1 }));
          }
        }
        break;
      case "Enter":
        {
          const licences = this.props.licences
            .filter(licence => {
              if (licence.boughtplanid.alias) {
                return licence.boughtplanid.alias
                  .toUpperCase()
                  .includes(this.state.searchString.toUpperCase());
              } else {
                return licence.boughtplanid.planid.appid.name
                  .toUpperCase()
                  .includes(this.state.searchString.toUpperCase());
              }
            })
            .sort((a, b) => {
              let nameA = a.boughtplanid.planid.appid.name.toUpperCase();
              let nameB = b.boughtplanid.planid.appid.name.toUpperCase();
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }

              // If Appname equals

              let nameC = a.boughtplanid.alias.toUpperCase();
              let nameD = b.boughtplanid.alias.toUpperCase();
              if (nameC < nameD) {
                return -1;
              }
              if (nameC > nameD) {
                return 1;
              }

              return 0;
            });
          const licenceid = licences[this.state.selected] && licences[this.state.selected].id;

          if (
            licenceid &&
            this.props.openInstances &&
            (!this.props.openInstances[licenceid] ||
              (this.props.openInstances[licenceid] &&
                Object.keys(this.props.openInstances[licenceid]).length == 1))
          ) {
            this.props.setApp(licenceid);
          }
        }
        break;
      default:
        break;
    }
  }

  render() {
    const { sidebarOpen, licences, openInstances, icon } = this.props;
    const { showApps, showMoreApps } = this.state;

    if (licences.length < 1) {
      return null;
    }

    const input = (style = {}) => (
      <div style={{ marginLeft: "8px", width: "calc(100% - 48px)" }}>
        <input
          ref={node => (this.searchInput = node)}
          value={this.state.searchString}
          onChange={e => this.setState({ searchString: e.target.value, selected: -1 })}
          placeholder="Search Apps"
          className={`sidebar-search${style ? style : sidebarOpen ? "" : "-tooltip"}`}
          onContextMenu={e => {
            e.preventDefault();
            this.setState({ context: true, clientX: e.clientX, clientY: e.clientY });
          }}
        />
      </div>
    );

    const SortComponent = (
      <div style={{ width: "100px" }}>
        <button className="sidebar-search-tooltip naked-button" onClick={this.toggleApps}>
          <i className={`fal fa-angle-right ${showApps ? "open" : ""}`} />
          <span style={{ fontSize: "10px" }}>{`${showApps ? "Hide" : "Show"} Apps`}</span>
        </button>
      </div>
    );

    const appOrbitCount = [];
    licences.forEach(l =>
      appOrbitCount[l.boughtplanid.planid.appid.id]
        ? appOrbitCount[l.boughtplanid.planid.appid.id].push(l.id)
        : (appOrbitCount[l.boughtplanid.planid.appid.id] = [])
    );

    return (
      <ul
        className="sidebar-main sidebarAppsholder"
        onKeyDown={e => this.handleArrowKeys(e.key)}
        onBlur={() => this.setState({ selected: -1 })}>
        <li>
          <ul className="sidebar-apps">
            {showApps &&
              licences.length > 0 &&
              licences
                .filter(licence => {
                  if (this.props.impersonation && licence.options && licence.options.private) {
                    return false;
                  } else {
                    if (licence.boughtplanid.alias) {
                      return licence.boughtplanid.alias
                        .toUpperCase()
                        .includes(this.state.searchString.toUpperCase());
                    } else {
                      return licence.boughtplanid.planid.appid.name
                        .toUpperCase()
                        .includes(this.state.searchString.toUpperCase());
                    }
                  }
                })
                .sort((a, b) => {
                  let nameA = a.boughtplanid.planid.appid.name.toUpperCase();
                  let nameB = b.boughtplanid.planid.appid.name.toUpperCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }

                  // If Appname equals

                  let nameC = a.boughtplanid.alias.toUpperCase();
                  let nameD = b.boughtplanid.alias.toUpperCase();
                  if (nameC < nameD) {
                    return -1;
                  }
                  if (nameC > nameD) {
                    return 1;
                  }

                  return 0;
                })
                .map((licence, index) => {
                  if (!licence) {
                    return;
                  }
                  const maxValue = licences.reduce((acc, cv) => Math.max(acc, cv.sidebar), 0);

                  // Make sure that every License has an index
                  if (licence.sidebar === null) {
                    licence.sidebar = maxValue + 1;
                  }
                  return (
                    <SidebarLink
                      disabled={false}
                      key={`ServiceLogo-${licence.id}`}
                      licence={licence}
                      openInstances={openInstances}
                      sidebarOpen={sidebarOpen}
                      active={
                        openInstances && openInstances[licence.id]
                          ? openInstances[licence.id][this.props.viewID]
                          : false
                      }
                      setTeam={this.props.setApp}
                      setInstance={this.props.setInstance}
                      viewID={this.props.viewID}
                      isSearching={this.state.searchString === ""}
                      selected={this.state.selected == index}
                      multipleOrbits={
                        appOrbitCount[licence.boughtplanid.planid.appid.id].length > 0
                      }
                    />
                  );
                })}
          </ul>
        </li>

        {/* {showApps && licences.length > 5 && (
          <li className={`sidebar-link show-more${sidebarOpen ? "" : "-small"}`}>
            <button
              type="button"
              onClick={() =>
                this.setState((prevState) => ({
                  ...prevState,
                  showMoreApps: !prevState.showMoreApps,
                }))
              }
              className="naked-button itemHolder" /*sidebar-link-apps
              style={{ color: "#ffffff80" }}>
              <Tooltip
                className="sidebar-tooltip"
                arrowSize={5}
                distance={12}
                useHover={!sidebarOpen}
                direction="right"
                content={`Show ${showMoreApps ? "less" : "more"} Apps`}>
                <div className="naked-button sidebarButton showMore">
                  <i className={`fal fa-angle-down ${showMoreApps ? "open" : ""}`} />
                </div>
              </Tooltip>
              <span className="sidebar-link-caption">
                {`Show ${showMoreApps ? "less" : "more"} Apps`}
              </span>
            </button>
          </li>
        )} */}
      </ul>
    );
  }
}

export default SidebarApps;
