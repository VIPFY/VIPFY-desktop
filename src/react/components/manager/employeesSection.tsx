import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import {
  fetchTeams,
  fetchUserLicences,
  fetchUsersOwnLicences,
  fetchTeam
} from "../../queries/departments";
import moment = require("moment");
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import AddEmployeeToTeam from "./addEmployeeToTeam";
import CoolCheckbox from "../CoolCheckbox";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import PopupSaving from "../../popups/universalPopups/saving";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import AddTeamEmployee from "./addTeamEmployee";
import EmployeeDetails from "./employeeDetails";

interface Props {
  employees: any[];
  search: string;
  team: any;
}

interface State {
  delete: Boolean;
  confirm: Boolean;
  network: Boolean;
  deleted: Boolean;
  add: Boolean;
  keepLicences: number[];
  deleteerror: string | null;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
}

class EmployeeSection extends React.Component<Props, State> {
  state = {
    delete: false,
    confirm: false,
    network: false,
    deleted: false,
    add: false,
    keepLicences: [],
    deleteerror: null,
    savingObject: null
  };

  render() {
    console.log("RERENDER EMPLOYEE");
    let employees: any[] = [];
    let interemployees: any[] = [];
    if (this.props.employees) {
      interemployees = this.props.employees;

      interemployees.sort(function(a, b) {
        let nameA = `${a.firstname} ${a.lastname}`.toUpperCase();
        let nameB = `${b.firstname} ${b.lastname}`.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // namen müssen gleich sein
        return 0;
      });
      if (this.props.search && this.props.search != "") {
        employees = interemployees.filter(a => {
          return `${a.firstname} ${a.lastname}`
            .toUpperCase()
            .includes(this.props.search.toUpperCase());
        });
      } else {
        employees = interemployees;
      }
    }

    const employeeArray: JSX.Element[] = [];

    employees.forEach((employee, k) => {
      employeeArray.push(
        <EmployeeDetails
          employee={employee}
          team={this.props.team}
          deleteFunction={sO => this.setState({ savingObject: sO })}
        />
      );
    });
    return (
      <div className="section">
        <div className="heading">
          <h1>Employees</h1>
        </div>
        <div className="table">
          <div className="tableHeading">
            <div className="tableMain">
              <div className="tableColumnSmall">
                <h1>User</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Online</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Workmail</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Workphone</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Position</h1>
              </div>
            </div>
            <div className="tableEnd">
              <UniversalButton
                type="high"
                label="Add Employee"
                customStyles={{
                  fontSize: "12px",
                  lineHeight: "24px",
                  fontWeight: "700",
                  marginRight: "16px",
                  width: "92px"
                }}
                onClick={() => {
                  this.setState({ add: true });
                }}
              />
            </div>
          </div>
          {employeeArray}
        </div>
        {this.state.add && (
          <AddTeamEmployee
            close={sO => {
              this.setState({ add: false, savingObject: sO });
            }}
            team={this.props.team}
          />
        )}
        {this.state.savingObject && (
          <PopupSelfSaving
            savedmessage={this.state.savingObject!.savedmessage}
            savingmessage={this.state.savingObject!.savingmessage}
            closeFunction={() => {
              this.setState({ savingObject: null });
            }}
            saveFunction={async () => await this.state.savingObject!.saveFunction()}
            maxtime={5000}
          />
        )}
      </div>
    );
  }
}
export default EmployeeSection;
