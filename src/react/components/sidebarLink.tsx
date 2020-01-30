import * as React from "react";
import { Licence } from "../interfaces";
import Tooltip from "react-tooltip-lite";
import { getBgImageApp } from "../common/images";

interface Props {
  licence: any;
  openInstances: any;
  sidebarOpen: boolean;
  active: boolean;
  setTeam: Function;
  setInstance: Function;
  viewID: number;
  isSearching: boolean;
  selected: boolean;
}

interface State {
  hover: boolean;
  dragging: boolean;
  entered: boolean;
}

class SidebarLink extends React.Component<Props, State> {
  state = {
    hover: false,
    dragging: false,
    entered: false
  };

  showInstances = (licence: Licence) => {
    if (this.props.openInstances && this.props.openInstances[licence.id]) {
      const instances = Object.keys(this.props.openInstances[licence.id]);
      if (instances.length > 1) {
        return (
          <React.Fragment>
            <div
              style={{
                position: "fixed",
                top: this.el ? this.el.getBoundingClientRect().top : "0px",
                left: this.el ? this.el.getBoundingClientRect().left : "0px",
                width: this.el ? this.el.getBoundingClientRect().width + 15 : "0px",
                height: this.el ? this.el.getBoundingClientRect().height : "0px"
              }}
            />
            <div
              className="instanceHolder"
              style={{
                top: this.el ? this.el.getBoundingClientRect().top - 5 : "0px",
                left: this.el
                  ? this.el.getBoundingClientRect().left +
                    this.el.getBoundingClientRect().width +
                    15
                  : "0px"
              }}>
              {instances.map(e => {
                return (
                  <div
                    key={this.props.openInstances[licence.id][e].instanceId}
                    className="instance"
                    style={{
                      backgroundColor:
                        this.props.viewID === this.props.openInstances[licence.id][e].instanceId
                          ? "#20BAA9"
                          : ""
                    }}
                    onClick={() =>
                      this.props.viewID === this.props.openInstances[licence.id][e].instanceId
                        ? null
                        : this.props.setInstance(this.props.openInstances[licence.id][e].instanceId)
                    }>
                    {this.props.openInstances[licence.id][e].instanceTitle}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        );
      }
    }
  };

  render() {
    const { licence, openInstances, sidebarOpen, active, setTeam } = this.props;

    let cssClass = "sidebar-link";
    let label = licence.boughtplanid.alias
      ? licence.boughtplanid.alias
      : licence.boughtplanid.planid.appid.name;

    if (!sidebarOpen) {
      cssClass += "-small";
    }
    if (active) {
      cssClass += " sidebar-active";
    }

    return (
      <li
        id={licence.id}
        className={`${cssClass} ${this.state.dragging ? "hold" : ""} ${
          this.state.entered ? "hovered" : ""
        }`}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        ref={el => (this.el = el)}>
        <button
          type="button"
          onClick={
            this.props.openInstances &&
            (!this.props.openInstances[licence.id] ||
              (this.props.openInstances[licence.id] &&
                Object.keys(openInstances[licence.id]).length == 1))
              ? () => {
                  setTeam(licence.id);
                }
              : () => null
          }
          className={`naked-button itemHolder${
            this.props.selected ? " selected" : ""
          }`} /*sidebar-link-apps*/
        >
          <Tooltip direction="right" arrowSize={5} useHover={!sidebarOpen} content={label}>
            <div className="naked-button sidebarButton">
              <span className="white-background" />
              <span
                className="service-logo-small"
                style={{
                  backgroundImage:
                    licence.boughtplanid.planid.appid.icon &&
                    getBgImageApp(licence.boughtplanid.planid.appid.icon, 24)
                }}>
                {this.props.openInstances[this.props.licence.id] && (
                  <i className="fa fa-circle active-app" />
                )}
              </span>
            </div>
          </Tooltip>

          <span className={`sidebar-link-caption ${sidebarOpen ? "" : "invisible"}`}>{label}</span>
          {this.state.hover ? this.showInstances(licence) : ""}
        </button>
      </li>
    );
  }
}

export default SidebarLink;
