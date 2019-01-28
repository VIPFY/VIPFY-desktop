import * as React from "react";
import SelfSearchBox from "../components/SelfSearchBox";
import EGeneral from "./egeneral";
import EServices from "./eservices";

interface Props {
  showPopup: Function;
  moveTo: Function;
}

interface State {
  show: Boolean;
}

class EShower extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = () => {
    this.setState(prevState => {
      return { show: !prevState.show };
    });
  };

  render() {
    const employeedata = {
      name: "Nils Vossebein"
    };
    console.log("ESHOWER", this.props);
    return (
      <div className="genericPage employeeManager">
        <div className="genericPageName" style={{ justifyContent: "space-between" }}>
          <div>
            <span className="pagePreTitle" onClick={() => this.props.moveTo("emanager")}>
              Employees
            </span>
            <span className="pageArrowTitle">></span>
            <span className="pageMainTitle">{employeedata.name}</span>
          </div>
          <SelfSearchBox placeholder="Search in Employee Manager" />
        </div>
        <EGeneral />

        <EServices />
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggle()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
              //onClick={this.toggle}
            />
            <span>Assigned Departments</span>
          </div>
          <div className={`inside ${this.state.show ? "in" : "out"}`}>
            <div className="inside-padding">
              <div className="appExplain">
                <div />
                <div>Departmentname:</div>
                <div>Number of members</div>
              </div>
              <div className="appExplain">
                <div
                  className="hex"
                  style={{ backgroundColor: "#20baa9", borderColor: "#20baa9" }}
                  ref={e => (this.element = e)}>
                  <span>M</span>
                  {console.log("TESTING", this)
                  /*<div
                className="titleBox"
                style={{
                  top: this.element ? this.calculateTop(this.element, -10) : "",
                  left: this.element ? this.calculateLeft(this.element, 0, 2) : ""
                }}>
                Marketing
            </div>*/
                  }
                </div>
                <div>Marketing</div>
                <div>20 more members</div>
              </div>
              <div className="appExplain">
                <div className="hex" style={{ backgroundColor: "#c73544", borderColor: "#c73544" }}>
                  P
                </div>
                <div>Production</div>
                <div>10 more members</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EShower;
