import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalSearchBox from "../universalSearchBox";

interface Props {
  close: Function;
  continue: Function;
}

interface State {}

class AddEmployeeTeams extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <React.Fragment>
        <span className="mutiplieHeading">
          <span className="bHeading">Add Employee </span>
          <span className="mHeading">
            > Personal Data > <span className="active">Teams</span> >{" "}
            <span className="inactive">Services</span>
          </span>
        </span>
        <span className="secondHolder">Available Teams</span>
        <UniversalSearchBox placeholder="Search available teams" />
        <div className="maingridAddEmployeeTeams">
          <div className="addgrid-holder">
            <div className="addgrid">
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
              <div className="space">
                <div className="fakeimage" />
                <div className="fakename" />
              </div>
            </div>
          </div>
          <div className="addgrid-holder">
            <div className="addgrid">
              <div className="space">
                <div className="image" style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                  <i className="fal fa-plus" />
                </div>
                <div className="name">Add Team</div>
              </div>
              <div className="space">
                <div className="image" style={{ backgroundColor: "#8DCCFA" }}>
                  SU
                </div>
                <div className="name">Support</div>
              </div>
              <div className="space">
                <div className="image" style={{ backgroundColor: "#FD8B29" }}>
                  DE
                </div>
                <div className="name">Development</div>
              </div>
              <div className="space">
                <div className="image" style={{ backgroundColor: "#FFC15D" }}>
                  S
                </div>
                <div className="name">Sales</div>
              </div>
              <div className="space">
                <div className="image" style={{ backgroundColor: "#7B29FD" }}>
                  D
                </div>
                <div className="name">Design</div>
              </div>
              <div className="space">
                <div className="image" style={{ backgroundColor: "#5D76FF" }}>
                  M
                </div>
                <div className="name">Marketing</div>
              </div>
              <div className="space">
                <div className="image" style={{ backgroundColor: "#67A23B" }}>
                  HR
                </div>
                <div className="name">HR</div>
              </div>
              <div className="space">
                <div className="image" style={{ backgroundColor: "#9C13BC" }}>
                  MA
                </div>
                <div className="name">Management</div>
              </div>
            </div>
          </div>
        </div>
        <div className="buttonsPopup">
          <UniversalButton label="Back" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton label="Continue" type="high" onClick={() => this.props.continue()} />
        </div>
      </React.Fragment>
    );
  }
}
export default AddEmployeeTeams;
