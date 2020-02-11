import * as React from "react";
import UniversalButton from "../../../components/universalButtons/universalButton";
import PopupSelfSaving from "../../../popups/universalPopups/selfSaving";
import EmployeeDetails from "./../employeeDetails";
import AssignNewTeamMember from "../universal/adding/assignNewTeamMember";

interface Props {
  isadmin: boolean;
  employees: any[];
  search: string;
  team: any;
  moveTo: Function;
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
          key={employee.id}
          employee={employee}
          team={this.props.team}
          deleteFunction={sO => this.setState({ savingObject: sO })}
          moveTo={this.props.moveTo}
        />
      );
    });
    return (
      <div className="section">
        <div className="heading">
          <h1>Employees</h1>
          <UniversalButton
            type="high"
            label="Assign Employee"
            customStyles={{
              fontSize: "12px",
              lineHeight: "24px",
              fontWeight: "700",
              marginRight: "16px",
              width: "128px"
            }}
            onClick={() => {
              this.setState({ add: true });
            }}
          />
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
            <div className="tableEnd"></div>
          </div>
          {employeeArray}
        </div>
        {this.state.add && (
          <AssignNewTeamMember team={this.props.team} close={() => this.setState({ add: false })} />
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
