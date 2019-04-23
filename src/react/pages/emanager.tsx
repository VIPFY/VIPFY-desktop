import * as React from "react";
import SelfSearchBox from "../components/SelfSearchBox";
import EmployeeShower from "../components/EmployeeShower";
import { fetchDepartmentsData } from "../queries/departments";
import { Query } from "react-apollo";
import EmployeeDetails from "./manager/employeeDetails";
import EmployeeOverview from "./manager/employeeOverview";

interface Props {
  showPopup: Function;
  moveTo: Function;
  toggleAdmin: Function;
  adminOpen: boolean;
}

interface State {
  show: Boolean;
}

class EManager extends React.Component<Props, State> {
  state = {
    show: true
  };

  element: HTMLDivElement | null = null;
  timeout = null;

  calculateTop = (element, addedmargin, middle = 1) => {
    let top = addedmargin + element.offsetTop + (middle * element.offsetHeight) / 2;
    if (element.offsetParent != document.body) {
      top += this.calculateTop(element.offsetParent, 0, 0);
    }
    return top;
  };

  calculateLeft = (element, addedmargin, middle = 1, right = false) => {
    let left = addedmargin + element.offsetLeft + (middle * element.offsetWidth) / 2;
    if (element.offsetParent != document.body) {
      left += this.calculateLeft(element.offsetParent, 0, 0);
    }
    if (right) {
      left -= 230;
    }
    return left;
  };

  render() {
    return <EmployeeDetails />;
    return (
      <div className="genericPage employeeManager">
        <Query query={fetchDepartmentsData} pollInterval={30000}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }
            let employeeArray: JSX.Element[] = [];
            let possibleValues: { searchstring: string; link: string }[] = [];

            console.log("DATA", data);
            if (data.fetchDepartmentsData) {
              data.fetchDepartmentsData[0].employees.forEach((employee, k) => {
                employeeArray.push(
                  <EmployeeShower
                    key={k}
                    moveTo={this.props.moveTo}
                    userdata={{
                      profileimage: `https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                        employee.profilepicture
                      }`,
                      name: `${employee.firstname} ${employee.lastname}`,
                      id: employee.id,
                      position: null,
                      online: employee.isonline,
                      admin: employee.isadmin,
                      departments: [
                        /*{ alias: "MG", name: "Marketing", color: "#9ad2e4" },
                        { alias: "MA", name: "Management", color: "#8436b0" },
                        { alias: "FE", name: "Entwicklung", color: "#ff8c45" },
                        { alias: "D", name: "Domains", color: "#5145e3" },
                        { alias: "UX", name: "UX-Design", color: "#2d84e6" },
                        { alias: "Z", name: "Zusatz", color: "#29cc94" },
                        { alias: "A", name: "Alles ein bisschen", color: "#df3f19" }*/
                      ],
                      notificationmessage: null
                    }}
                  />
                );
                possibleValues.push({
                  searchstring: `${employee.firstname} ${employee.lastname}`,
                  link: `emanager/${employee.id}`
                });
              });
            }

            return (
              <React.Fragment>
                <div className="genericPageName" style={{ justifyContent: "space-between" }}>
                  <span className="pageMainTitle">Employees</span>
                  <SelfSearchBox
                    placeholder="Search in Employee Manager"
                    possibleValues={possibleValues}
                    moveTo={this.props.moveTo}
                  />
                </div>
                {employeeArray}
              </React.Fragment>
            );
          }}
        </Query>

        {/*<div className="adminToolButton">
          <button className="naked-button genericButton" onClick={() => this.props.toggleAdmin()}>
            <span className="textButton">
              <i className="fal fa-tools" />
            </span>
            <span className="textButtonBesideLeft">
              {this.props.adminOpen ? "Hide Admintools" : "Show Admintools"}
            </span>
          </button>
        </div>*/}
      </div>
    );
  }
}

export default EManager;
