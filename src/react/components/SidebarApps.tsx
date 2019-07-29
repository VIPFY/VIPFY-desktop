import * as React from "react";
import Tooltip from "react-tooltip-lite";
import { graphql } from "react-apollo";
import { UPDATE_LAYOUT } from "../mutations/auth";

import SidebarLink from "./sidebarLink";
import { Licence } from "../interfaces";
import { layoutUpdate } from "../common/functions";
import { fetchLicences } from "../queries/auth";
import IconButton from "../common/IconButton";

interface Props {
  sidebarOpen: boolean;
  licences: Licence[];
  openInstances: any;
  setInstance: Function;
  setApp: (licence: number) => void;
  viewID: number;
  updateLayout: Function;
  header?: string;
  icon?: string;
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

  handleDrop = async (targetId, draggedId) => {
    if (targetId == draggedId) {
      return;
    }

    const { licences } = this.props;
    const newLicences = layoutUpdate(
      // Make sure they have the same order as when rendered
      licences.sort((a, b) => a.sidebar - b.sidebar),
      draggedId,
      targetId
    );

    const layouts = newLicences
      .map(({ id, sidebar }) => ({ id, sidebar }))
      .filter((licence, key) => licence.sidebar != licences[key].sidebar);

    try {
      const update = cache => {
        cache.writeQuery({ query: fetchLicences, data: { fetchLicences: newLicences } });
      };

      const p1 = this.props.updateLayout({
        variables: { layout: layouts[0] },
        update
      });

      const p2 = this.props.updateLayout({
        variables: { layout: layouts[1] },
        update
      });

      await Promise.all([p1, p2]);
    } catch (error) {
      console.error(error);
    }
  };

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
          const licenceid = this.props.licences
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
            })[this.state.selected].id;

          if (
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
    const { clipboard } = require("electron");

    if (licences.length < 1) {
      return null;
    }

    const input = (style = {}) => (
      <div style={{ marginLeft: "8px", width: "calc(100% - 48px)" }}>
        <input
          ref={node => {
            this.searchInput = node;
          }}
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

    console.log("APPS", this.props.licences, this.state);
    return (
      <ul
        style={{ marginTop: "40px" }}
        onKeyDown={e => this.handleArrowKeys(e.key)}
        onBlur={() => this.setState({ selected: -1 })}>
        <li className={`sidebar-link${sidebarOpen ? "" : "-small"}`}>
          <button
            type="button"
            onClick={this.toggleApps}
            className="naked-button itemHolder" /*sidebar-link-apps*/
            style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Tooltip
                useHover={!sidebarOpen}
                distance={7}
                arrowSize={5}
                direction="right"
                content={SortComponent}>
                <div className="naked-button sidebarButton">
                  <i className={`fal fa-${icon ? icon : "th-large"} sidebar-icon`} />
                </div>
              </Tooltip>
              <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>
                {this.props.header ? this.props.header : "My Apps"}
              </span>
            </div>

            <Tooltip
              arrowSize={5}
              distance={12}
              useHover={sidebarOpen}
              content={`${showApps ? "Hide" : "Show"} Apps`}
              direction="right">
              <div className="naked-button sidebarButton showMore">
                <i className={`carret fal fa-angle-right ${showApps ? "open" : ""}`} />
              </div>
            </Tooltip>
          </button>
        </li>

        <li>
          <ul className="sidebar-apps">
            {showApps && (
              <li className={`sidebar-link${sidebarOpen ? "" : "-small"}`} ref={this.wrapper}>
                <button
                  type="button"
                  onClick={() => this.searchInput.focus()}
                  className={`naked-button itemHolder${
                    this.state.selected == -1 ? " selected" : ""
                  }`} /*sidebar-link-apps*/
                >
                  <Tooltip useHover={!sidebarOpen} direction="right" content={input()}>
                    <div className="naked-button sidebarButton">
                      <i className="carret fal fa-search" />
                    </div>
                  </Tooltip>
                  {input(sidebarOpen ? "" : "-hide")}
                  {this.state.context && (
                    <button
                      className="cleanup contextButton"
                      onClick={() => {
                        let value = clipboard.readText();
                        this.setState({ searchString: value, context: false });
                      }}
                      style={{
                        position: "fixed",
                        top: this.state.clientY,
                        left: this.state.clientX,
                        right: "auto",
                        color: "#253647",
                        zIndex: 10000
                      }}>
                      <i className="fal fa-paste" />
                      <span style={{ marginLeft: "8px", fontSize: "12px" }}>Paste</span>
                    </button>
                  )}
                </button>
              </li>
            )}

            {showApps &&
              licences.length > 0 &&
              licences
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
                //.sort((a, b) => a.sidebar - b.sidebar)
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
                .filter((_, index) => (showMoreApps ? true : index < 5))
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
                      handleDragStart={null}
                      handleDrop={this.handleDrop}
                      isSearching={this.state.searchString === ""}
                      selected={this.state.selected == index}
                    />
                  );
                })}
          </ul>
        </li>

        {showApps && licences.length > 5 && (
          <li className={`sidebar-link show-more${sidebarOpen ? "" : "-small"}`}>
            <button
              type="button"
              onClick={() =>
                this.setState(prevState => ({
                  ...prevState,
                  showMoreApps: !prevState.showMoreApps
                }))
              }
              className="naked-button itemHolder" /*sidebar-link-apps*/
              style={{ color: "#ffffff80" }}>
              <Tooltip
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
        )}
      </ul>
    );
  }
}

export default graphql(UPDATE_LAYOUT, { name: "updateLayout" })(SidebarApps);
