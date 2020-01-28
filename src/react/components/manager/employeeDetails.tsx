import * as React from "react";
import PrintEmployeeSquare from "./universal/squares/printEmployeeSquare";
import RemoveTeamMember from "./removeTeamMember";
import { concatName } from "../../common/functions";

interface Props {
  employee: any;
  team: any;
  moveTo: Function;
}

interface State {
  delete: Boolean;
}

const INITAL_STATE = {
  delete: false
};

class EmployeeDetails extends React.Component<Props, State> {
  state = INITAL_STATE;

  printMails(emails) {
    if (emails.length == 1 && emails[0] != null) {
      return emails[0].email;
    }
    if (emails.length == 0 && emails[1] == null) {
      return "No email";
    }
    return (
      <div>
        <div style={{ lineHeight: "28px" }}>{emails[0].email}</div>
        <div style={{ lineHeight: "28px" }}>{emails[1].email}</div>
      </div>
    );
  }

  printPhones(allphones) {
    if (allphones.length == 0 || allphones[1] == null) {
      return "No phone";
    }
    const phones = allphones.filter(phone => phone.tags == null || phone.tags[0] != "private");
    if (phones.length == 1 && phones[0] != null) {
      return phones[0].number;
    }
    if (phones.length == 0 || phones[1] == null) {
      return "No phone";
    }
    return (
      <div>
        <div style={{ lineHeight: "28px" }}>{phones[0].number}</div>
        <div style={{ lineHeight: "28px" }}>{phones[1].number}</div>
      </div>
    );
  }

  render() {
    const employee = this.props.employee;
    return (
      <div className="tableRow" onClick={() => this.props.moveTo(`emanager/${employee.id}`)}>
        <div className="tableMain">
          <div className="tableColumnSmall">
            <PrintEmployeeSquare employee={employee} />
            <span className="name" title={concatName(employee)}>
              {employee.firstname} {employee.lastname}
            </span>
          </div>
          <div className="tableColumnSmall content">
            <div
              className="employeeOnlineBig"
              style={{ backgroundColor: employee.isonline ? "#29CC94" : "#DB4D3F" }}>
              {`O${employee.isonline ? "n" : "ff"}line`}
            </div>
          </div>
          <div className="tableColumnSmall content">{this.printMails(employee.emails)}</div>
          <div className="tableColumnSmall content">{this.printPhones(employee.phones)}</div>
          <div className="tableColumnSmall content">{employee.position}</div>
        </div>
        <div className="tableEnd">
          <div className="editOptions">
            <i className="fal fa-external-link-alt editbuttons" />
            <i
              className="fal fa-trash-alt editbuttons"
              onClick={e => {
                e.stopPropagation();
                this.setState({ delete: true });
              }}
            />
          </div>
        </div>

        {this.state.delete && (
          <RemoveTeamMember
            employee={this.props.employee}
            team={this.props.team}
            close={() => this.setState({ delete: false })}
          />
        )}
      </div>
    );
  }
}
export default EmployeeDetails;
