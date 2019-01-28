import * as React from "react";
import { relative } from "path";

interface Props {
  userdata: any;
  moveTo: Function;
}

interface State {
  hoveritem: string;
}

class EmployeeShower extends React.Component<Props, State> {
  state = {
    hoveritem: ""
  };

  setHoverState = e => {
    this.setState({ hoveritem: e });
  };

  removeHoverState = e => {
    //if (this.state.hoveritem == e) {
    //  setTimeout(() => this.setState({ hoveritem: "" }), 20);
    //}
    this.setState({ hoveritem: "" });
  };

  showServices = () => {
    let numservices = 0;
    let serviceArray: JSX.Element[] = [];
    let additionalServiceArray: JSX.Element[] = [];

    for (let i = 0; i < this.props.userdata.services.length; i++) {
      if (numservices < 5) {
        serviceArray.push(
          <React.Fragment key={`s-${i}`}>
            <div
              style={{
                position: "absolute",
                left: `${40 * i}px`,
                borderRadius: "3px",
                height: "35px",
                width: "35px",
                zIndex: this.state.hoveritem == `s-${i}` ? "auto" : 100
              }}
              onMouseEnter={() => this.setHoverState(`s-${i}`)}
            />
            <div
              style={{
                position: "absolute",
                left: `${40 * i}px`,
                zIndex: this.state.hoveritem == `s-${i}` ? 10 : "auto"
              }}
              onMouseLeave={() => this.removeHoverState(`s-${i}`)}>
              <div
                className="box35"
                style={{
                  backgroundImage: `url('${this.props.userdata.services[i].icon}')`,
                  borderRadius: "3px"
                }}
              />
              <div style={{ position: "relative", height: "5px", width: "35px" }} />
              <div
                className="overText"
                style={{
                  opacity: this.state.hoveritem == `s-${i}` ? 1 : 0
                }}>
                {this.props.userdata.services[i].name}
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        additionalServiceArray.push(
          <div
            key={`s-${i}`}
            className="additionalServices"
            style={{ display: "flex", alignItems: "center" }}>
            <div
              className="box35"
              style={{
                backgroundImage: `url('${this.props.userdata.services[i].icon}')`,
                borderRadius: "3px"
              }}
            />
            <div style={{ marginLeft: "10px" }}>{this.props.userdata.services[i].name}</div>
          </div>
        );
      }
      numservices++;
    }
    return (
      <div className="genericFlexHolder" style={{ gridColumn: 7, gridRow: 4 }}>
        {serviceArray}
        {numservices > 5 ? (
          <React.Fragment>
            <div
              style={{
                position: "absolute",
                left: `${40 * 5}px`,
                borderRadius: "3px",
                height: "35px",
                width: "35px",
                zIndex: this.state.hoveritem == `s-${5}` ? "auto" : 100
              }}
              onMouseEnter={() => this.setHoverState(`s-${5}`)}
            />
            <div
              style={{
                position: "absolute",
                left: `${40 * 5}px`,
                zIndex: this.state.hoveritem == `s-${5}` ? 10 : "auto"
              }}
              onMouseLeave={() => this.removeHoverState(`s-${5}`)}>
              <div
                className="box35 text"
                style={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: "3px"
                }}>
                +{numservices - 5}
              </div>
              <div style={{ position: "relative", height: "5px", width: "35px" }} />
              <div
                className="overText"
                style={{
                  opacity: this.state.hoveritem == `s-${5}` ? 1 : 0
                }}>
                {additionalServiceArray}
              </div>
            </div>
          </React.Fragment>
        ) : (
          ""
        )}
      </div>
    );
  };

  showDepartments = () => {
    let numdepartments = 0;
    let departmentArray: JSX.Element[] = [];
    let additionalDepartmentArray: JSX.Element[] = [];

    for (let i = 0; i < this.props.userdata.departments.length; i++) {
      if (numdepartments < 5) {
        departmentArray.push(
          <React.Fragment key={`d-${i}`}>
            <div
              style={{
                position: "absolute",
                left: `${35 * i}px`,
                height: "35px",
                width: "30px",
                zIndex: this.state.hoveritem == `d-${i}` ? "auto" : 100
              }}
              onMouseEnter={() => this.setHoverState(`d-${i}`)}
            />
            <div
              style={{
                position: "absolute",
                left: `${35 * i}px`,
                zIndex: this.state.hoveritem == `d-${i}` ? 10 : "auto"
              }}
              onMouseLeave={() => this.removeHoverState(`d-${i}`)}>
              <div
                className="hex alias"
                style={{
                  backgroundColor: this.props.userdata.departments[i].color,
                  borderColor: this.props.userdata.departments[i].color
                }}>
                {this.props.userdata.departments[i].alias}
              </div>
              <div style={{ position: "relative", height: "13.66px", width: "30px" }} />
              <div
                className="overText"
                style={{
                  opacity: this.state.hoveritem == `d-${i}` ? 1 : 0
                }}>
                {this.props.userdata.departments[i].name}
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        additionalDepartmentArray.push(
          <div
            key={`d-${i}`}
            className="additionalDepartments"
            style={{ display: "flex", alignItems: "center" }}>
            <div
              className="hex alias"
              style={{
                backgroundColor: this.props.userdata.departments[i].color,
                borderColor: this.props.userdata.departments[i].color,
                marginBottom: "8.66px"
              }}>
              {this.props.userdata.departments[i].alias}
            </div>
            <div style={{ marginLeft: "5px" }}>
              <span style={{ whiteSpace: "nowrap" }}>
                {this.props.userdata.departments[i].name}
              </span>
            </div>
          </div>
        );
      }
      numdepartments++;
    }
    return (
      <div className="genericFlexHolder" style={{ gridColumn: 6, gridRow: 4 }}>
        {departmentArray}
        {numdepartments > 5 ? (
          <React.Fragment>
            <div
              style={{
                position: "absolute",
                left: `${35 * 5}px`,
                borderRadius: "3px",
                height: "35px",
                width: "30px",
                zIndex: this.state.hoveritem == `d-${5}` ? "auto" : 100
              }}
              onMouseEnter={() => this.setHoverState(`d-${5}`)}
            />
            <div
              style={{
                position: "absolute",
                left: `${35 * 5}px`,
                zIndex: this.state.hoveritem == `d-${5}` ? 10 : "auto"
              }}
              onMouseLeave={() => this.removeHoverState(`d-${5}`)}>
              <div
                className="hex text"
                style={{
                  backgroundColor: "#f0f0f0",
                  borderColor: "#f0f0f0"
                }}>
                +{numdepartments - 5}
              </div>
              <div style={{ position: "relative", height: "13.66px", width: "30px" }} />
              <div
                className="overText"
                style={{
                  opacity: this.state.hoveritem == `d-${5}` ? 1 : 0
                }}>
                {additionalDepartmentArray}
              </div>
            </div>
          </React.Fragment>
        ) : (
          ""
        )}
      </div>
    );
  };

  render() {
    return (
      <div className="genericOneLineHolder">
        <div
          className="heading"
          onClick={() => this.props.moveTo("emanager/22")}
          style={{ cursor: "pointer" }}>
          <span>
            {this.props.userdata.name} - {this.props.userdata.position}
          </span>
          <button
            className="naked-button genericButton"
            //onClick={() => this.props.moveTo("emanager/22")}
          >
            <i className="fal fa-info-square" />
          </button>
        </div>
        <div className="headingOneLine" style={{ gridRow: 3, gridColumn: 2 }}>
          User:
        </div>
        <div className="headingOneLine" style={{ gridRow: 3, gridColumn: 6 }}>
          Departments:
        </div>
        <div className="headingOneLine" style={{ gridRow: 3, gridColumn: 7 }}>
          Services:
        </div>
        <div className="headingOneLine" style={{ gridRow: 3, gridColumn: 8 }}>
          Notifications:
        </div>
        {/*<div className="headingOneLine" style={{ gridRow: 3, gridColumn: 9, textAlign: "center" }}>
          More
    </div>*/}
        <div
          className="circle40"
          style={{
            gridRow: 4,
            gridColumn: 2,
            position: "relative",
            backgroundImage: `url('${this.props.userdata.profileimage}')`
          }}
        />

        <div style={{ position: "relative", height: "40px", gridRow: 4, gridColumn: 4 }}>
          {this.props.userdata.online ? (
            <div className="roundedNotification online">Online</div>
          ) : (
            <div className="roundedNotification offline">Offline</div>
          )}
          {this.props.userdata.admin ? (
            <div className="roundedNotification status" style={{ bottom: "0px" }}>
              Admin
            </div>
          ) : (
            ""
          )}
        </div>
        {this.showDepartments()}
        {this.showServices()}
        <div className="genericError" style={{ gridColumn: 8, gridRow: 4 }}>
          <span>{this.props.userdata.notificationmessage}</span>
        </div>
        {/*<div className="moreHolder" style={{ gridColumn: 9, gridRow: 4 }}>
          <i className="fal fa-ellipsis-h-alt" onClick={() => this.props.moveTo("emanager/22")} />
        </div>*/}
      </div>
    );
  }
}
export default EmployeeShower;
