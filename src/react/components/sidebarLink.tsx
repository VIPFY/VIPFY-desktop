import * as React from "react";
import { Licence } from "../interfaces";
import * as moment from "moment";

interface Props {
  licence: any;
  openInstances: any;
  sideBarOpen: boolean;
  active: boolean;
  setTeam: Function;
  setInstance: Function;
  viewID: number;
  handleDrop: Function;
  handleDragStart: Function;
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
    const { licence, openInstances, sideBarOpen, active, setTeam } = this.props;

    if (
      !licence ||
      licence.disabled ||
      (licence.endtime ? moment().isAfter(licence.endtime) : false)
    ) {
      return "";
    }

    let cssClass = "sidebar-link";
    if (active) {
      cssClass += " sidebar-active";
    }

    return (
      <li
        className={`${cssClass} ${this.state.dragging ? "hold" : ""} ${
          this.state.entered ? "hovered" : ""
        }`}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        onDrop={() => {
          this.setState({ entered: false });
          this.props.handleDrop(licence.id);
        }}
        draggable={true}
        onDragStart={() => {
          this.props.handleDragStart(licence.id);
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
        <span
          className="service-logo-small"
          style={{
            backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
              licence.boughtplanid.planid.appid.icon
            })`
          }}>
          {licence.boughtplanid.planid.options && licence.boughtplanid.planid.options.external ? (
            <div className="ribbon-small ribbon-small-top-right">
              <span>E</span>
            </div>
          ) : (
            ""
          )}
        </span>

        <span className={sideBarOpen ? "sidebar-link-caption" : "show-not"}>
          {licence.boughtplanid.alias
            ? licence.boughtplanid.alias
            : licence.boughtplanid.planid.appid.name}
        </span>
        {this.state.hover ? this.showInstances(licence) : ""}
      </li>
    );
  }
}

export default SidebarLink;
