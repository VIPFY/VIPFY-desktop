import * as React from "react";
import { Licence } from "../interfaces";
import Tooltip from "react-tooltip-lite";
import ServiceLogo from "./services/ServiceLogo";

interface Props {
  disabled: boolean;
  licence: any;
  openInstances: any;
  sidebarOpen: boolean;
  active: boolean;
  setTeam: Function;
  setInstance: Function;
  viewID: number;
  isSearching: boolean;
  selected: boolean;
  multipleOrbits?: boolean;
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

  stringToColour(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = "#";
    for (let i = 0; i < 3; i++) {
      let value = (hash >> (i * 8)) & 0xff;
      colour += ("00" + value.toString(16)).substr(-2);
    }
    return colour;
  }

  render() {
    const {
      licence,
      openInstances,
      sidebarOpen,
      active,
      disabled,
      setTeam,
      multipleOrbits
    } = this.props;

    let cssClass = "sidebar-link service";
    let buttonClass = "naked-button serviceHolder";
    let label = licence.boughtplanid.alias
      ? licence.boughtplanid.alias
      : licence.boughtplanid.planid.appid.name;

    if (!sidebarOpen) {
      cssClass += "-small";
    }
    if (active) {
      cssClass += " sidebar-active";
    }
    if (openInstances[licence.id]) {
      buttonClass += " selected";
    }

    return (
      <li
        id={licence.id}
        className={cssClass}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        ref={el => (this.el = el)}>
        <button
          disabled={disabled}
          id={licence.id + "button"}
          type="button"
          onMouseDown={() => {
            document.getElementById(licence.id + "button").className =
              "naked-button serviceHolder active";
          }}
          onMouseUp={() => {
            if (
              openInstances &&
              (!openInstances[licence.id] ||
                (openInstances[licence.id] && Object.keys(openInstances[licence.id]).length == 1))
            ) {
              setTeam(licence.id);
            }
            document.getElementById(licence.id + "button").className = buttonClass;
          }}
          onMouseLeave={() => {
            document.getElementById(licence.id + "button").className = buttonClass;
          }}
          className={buttonClass} /*sidebar-link-apps*/
        >
          <Tooltip
            direction="right"
            arrowSize={5}
            useHover={!sidebarOpen}
            content={label}
            className="sidebar-tooltip">
            <div className="naked-button sidebarButton">
              <div className="service-hover">
                <span className="white-background" />
                <ServiceLogo icon={licence.boughtplanid.planid.appid.icon}>
                  {openInstances[licence.id] && <i className="fa fa-circle active-app" />}
                  {multipleOrbits ? (
                    <span className="active-user">
                      <div
                        className="tiny-profile-pic"
                        style={{ backgroundColor: this.stringToColour(label) }}>
                        {label.substring(0, 1)}
                      </div>
                    </span>
                  ) : (
                    ""
                  )}
                </ServiceLogo>
              </div>
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
