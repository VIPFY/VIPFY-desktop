import * as React from "react";
import Tooltip from "react-tooltip-lite";
import { graphql } from "react-apollo";
import { UPDATE_LAYOUT } from "../mutations/auth";

import SidebarLink from "./sidebarLink";
import { Licence } from "../interfaces";
import { layoutUpdate } from "../common/functions";
import { fetchLicences } from "../queries/auth";

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
}

class SidebarApps extends React.Component<Props, State> {
  state = { searchString: "", showApps: true, showMoreApps: false };

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

  render() {
    const { sidebarOpen, licences, openInstances, icon } = this.props;
    const { showApps, showMoreApps } = this.state;

    const input = (
      <input
        value={this.state.searchString}
        onChange={e => this.setState({ searchString: e.target.value })}
        placeholder="Search Apps"
        className={`sidebar-search${sidebarOpen ? "" : "-tooltip"}`}
      />
    );

    const SortComponent = (
      <button className="sidebar-search-tooltip naked-button" onClick={this.toggleApps}>
        <i className={`fal fa-angle-right ${showApps ? "open" : ""}`} />
        <span style={{ fontSize: "10px" }}>{`${showApps ? "Hide" : "Show"} Apps`}</span>
      </button>
    );

    return (
      <ul>
        <li className={`sidebar-link${sidebarOpen ? "" : "-small"}`} style={{ marginTop: "40px" }}>
          <button
            type="button"
            onClick={this.toggleApps}
            className={`naked-button sidebar-link-apps${sidebarOpen ? "" : "-small"}`}>
            <Tooltip
              useHover={!sidebarOpen}
              distance={4}
              arrowSize={5}
              direction="right"
              content={SortComponent}>
              <i className={`fal fa-${icon ? icon : "th-large"} sidebar-icon`} />
            </Tooltip>

            {sidebarOpen && (
              <React.Fragment>
                <span
                  style={{ marginLeft: "7px", flex: 1, textAlign: "start" }}
                  className="sidebar-link-caption">
                  {this.props.header ? this.props.header : "My Apps"}
                </span>
                <Tooltip
                  arrowSize={5}
                  distance={12}
                  useHover={sidebarOpen}
                  content={`${showApps ? "Hide" : "Show"} Apps`}
                  direction="right">
                  <i className={`carret fal fa-angle-right ${showApps ? "open" : ""}`} />
                </Tooltip>
              </React.Fragment>
            )}
          </button>
        </li>

        <li>
          <ul>
            {showApps && sidebarOpen && (
              <li style={sidebarOpen ? { marginLeft: "11px" } : {}} className="sidebar-link">
                <Tooltip useHover={!sidebarOpen} direction="right" content={input}>
                  <i className="fal fa-search" />
                </Tooltip>
                {input}
              </li>
            )}

            {showApps &&
              licences.length > 0 &&
              licences
                .sort((a, b) => a.sidebar - b.sidebar)
                .filter((_, index) => (showMoreApps ? true : index < 5))
                .map(licence => {
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
                    />
                  );
                })}
          </ul>
        </li>

        {showApps && licences.length > 5 && (
          <li className={`show-more${sidebarOpen ? "" : "-small"}`}>
            <Tooltip
              useHover={!sidebarOpen}
              direction="right"
              distance={1}
              content={`Show ${showMoreApps ? "less" : "more"} Apps`}>
              <button
                type="button"
                onClick={() =>
                  this.setState(prevState => ({
                    ...prevState,
                    showMoreApps: !prevState.showMoreApps
                  }))
                }
                style={sidebarOpen ? { width: "92%" } : {}}
                className="naked-button">
                <i className={`fal fa-angle-down ${showMoreApps ? "open" : ""}`} />

                <span className={`${sidebarOpen ? "sidebar-link-caption" : "show-not"}`}>
                  {`Show ${showMoreApps ? "less" : "more"} Apps`}
                </span>
              </button>
            </Tooltip>
          </li>
        )}
      </ul>
    );
  }
}

export default graphql(UPDATE_LAYOUT, { name: "updateLayout" })(SidebarApps);
