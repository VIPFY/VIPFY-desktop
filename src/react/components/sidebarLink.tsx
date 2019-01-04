import * as React from "react";

interface Props {
  licence: any;
  openInstancens: any;
  sideBarOpen: boolean;
  active: boolean;
  setTeam: Function;
  setInstance: Function;
  viewID: number;
  dragItem: number | null;
  entered: number | null;
  dragStartFunction: Function;
}

interface State {
  hover: boolean;
}

class SidebarLink extends React.Component<Props, State> {
  state = {
    hover: false
  };

  showInstances = licence => {
    if (this.props.openInstancens && this.props.openInstancens[licence.id]) {
      const instances = Object.keys(this.props.openInstancens[licence.id]);
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
                    key={this.props.openInstancens[licence.id][e].instanceId}
                    className="instance"
                    style={{
                      backgroundColor:
                        this.props.viewID === this.props.openInstancens[licence.id][e].instanceId
                          ? "#20BAA9"
                          : ""
                    }}
                    onClick={() =>
                      this.props.viewID === this.props.openInstancens[licence.id][e].instanceId
                        ? null
                        : this.props.setInstance(
                            this.props.openInstancens[licence.id][e].instanceId
                          )
                    }>
                    {this.props.openInstancens[licence.id][e].instanceTitle}
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
    const { licence, openInstancens, sideBarOpen, active, setTeam } = this.props;
    //console.log(this.props);
    let cssClass = "sidebar-link";
    if (active) {
      cssClass += " sidebar-active";
    }

    return (
      <li
        className={`${cssClass}${this.props.dragItem == licence.id ? " hold" : ""}${
          this.props.entered == licence.id ? " hovered" : ""
        }`}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        onDrop={() => this.props.handleDrop(licence.id, this.props.filteredLicences)}
        draggable={true}
        onDragStart={() => this.props.dragStartFunction(licence.id)}
        onDragOver={e => this.props.dragOverFunction(e)}
        onDragLeave={() => this.props.dragLeaveFunction}
        onDragEnd={() => this.props.dragEndFunction}
        ref={el => (this.el = el)}
        onClick={
          this.props.openInstancens &&
          (!this.props.openInstancens[licence.id] ||
            (this.props.openInstancens[licence.id] &&
              Object.keys(openInstancens[licence.id]).length == 1))
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
