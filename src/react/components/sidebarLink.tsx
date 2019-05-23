import * as React from "react";
import { Licence } from "../interfaces";
import AcceptLicence from "../popups/acceptLicence";
import Tooltip from "react-tooltip-lite";

interface Props {
  licence: any;
  openInstances: any;
  sidebarOpen: boolean;
  active: boolean;
  setTeam: Function;
  setInstance: Function;
  viewID: number;
  handleDrop: Function;
  handleDragStart: Function | null;
  isSearching: boolean;
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
    const label = licence.boughtplanid.alias
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
        onDrop={event => {
          this.setState({ entered: false });
          this.props.handleDrop(
            licence.id,
            event.dataTransfer.getData("text"),
            event.pageY - event.currentTarget.getBoundingClientRect().top <=
              event.currentTarget.getBoundingClientRect().height / 2
          );
          //console.log(event.pageX, event.pageY, event.currentTarget.getBoundingClientRect());
        }}
        draggable={this.props.isSearching}
        onDragStart={event => {
          event.dataTransfer.setData("text", licence.id);
          //this.props.handleDragStart(event);
          this.setState({ dragging: true });
        }}
        onDragOver={e => {
          e.preventDefault();
          this.setState({ entered: true });
        }}
        onDragLeave={() => this.setState({ entered: false })}
        onDragEnd={() => this.setState({ dragging: false })}
        ref={el => (this.el = el)}
        onClick={
          this.props.openInstances &&
          (!this.props.openInstances[licence.id] ||
            (this.props.openInstances[licence.id] &&
              Object.keys(openInstances[licence.id]).length == 1))
            ? () => {
                setTeam(licence.id);
              }
            : () => null
        }>
        <Tooltip direction="right" arrowSize={5} useHover={!sidebarOpen} content={label}>
          <span className="white-background" />
          <span
            className="service-logo-small"
            style={{
              backgroundImage:
                licence.boughtplanid.planid.appid.icon &&
                licence.boughtplanid.planid.appid.icon.indexOf("/") != -1
                  ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                      licence.boughtplanid.planid.appid.icon
                    )})`
                  : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                      licence.boughtplanid.planid.appid.icon
                    )})`
            }}>
            {this.props.openInstances[this.props.licence.id] && (
              <i className="fa fa-circle active-app" />
            )}
          </span>
        </Tooltip>

        <span className={sidebarOpen ? "sidebar-link-caption" : "show-not"}>{label}</span>
        {this.state.hover ? this.showInstances(licence) : ""}
      </li>
    );
  }
}

export default SidebarLink;
