import * as React from "react";
import SelfSearchBox from "../components/SelfSearchBox";
import EGeneral from "./egeneral";
import EServices from "./eservices";
import { Query } from "react-apollo";
import { QUERY_SEMIPUBLICUSER } from "../queries/user";
import { fetchDepartmentsData } from "../queries/departments";

interface Props {
  showPopup: Function;
  moveTo: Function;
  isadmin: boolean;
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
    const employeeid = this.props.match.params.userid;
    console.log("ESHOWER", this.props.match, this.props, this.props.match.params.userid);
    return (
      <div className="genericPage employeeManager">
        <Query query={QUERY_SEMIPUBLICUSER} variables={{ unitid: employeeid }}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }

            console.log("SEMIPUBLIC", data);
            return (
              <React.Fragment>
                <div className="genericPageName" style={{ justifyContent: "space-between" }}>
                  <div>
                    <span className="pagePreTitle" onClick={() => this.props.moveTo("emanager")}>
                      Employees
                    </span>
                    <span className="pageArrowTitle">></span>
                    <span className="pageMainTitle">{`${data.adminme.firstname} ${
                      data.adminme.lastname
                    }`}</span>
                  </div>
                  <Query query={fetchDepartmentsData}>
                    {({ loading, error, data }) => {
                      if (loading) {
                        return "Loading...";
                      }
                      if (error) {
                        return `Error! ${error.message}`;
                      }
                      let possibleValues: { searchstring: string; link: string }[] = [];
                      if (data.fetchDepartmentsData) {
                        data.fetchDepartmentsData[0].employees.forEach((employee, k) => {
                          possibleValues.push({
                            searchstring: `${employee.firstname} ${employee.lastname}`,
                            link: `emanager/${employee.id}`
                          });
                        });
                        return (
                          <SelfSearchBox
                            placeholder="Search in Employee Manager"
                            possibleValues={possibleValues}
                            moveTo={this.props.moveTo}
                          />
                        );
                      }
                    }}
                  </Query>
                </div>
                <EGeneral
                  isadmin={this.props.isadmin}
                  showPopup={this.props.showPopup}
                  employeeid={employeeid}
                />

                <EServices
                  employeeid={employeeid}
                  employeename={`${data.adminme.firstname} ${data.adminme.lastname}`}
                />
              </React.Fragment>
            );
          }}
        </Query>
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
        <div className="adminToolButton">
          <button className="naked-button genericButton" onClick={() => this.props.toggleAdmin()}>
            <span className="textButton">
              <i className="fal fa-tools" />
            </span>
            <span className="textButtonBesideLeft">
              {this.props.adminOpen ? "Hide Admintools" : "Show Admintools"}
            </span>
          </button>
        </div>
      </div>
    );
  }
}

export default EShower;
