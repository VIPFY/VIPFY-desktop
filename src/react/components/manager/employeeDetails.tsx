import * as React from "react";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { fetchTeam } from "../../queries/departments";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import DeletePopup from "../../popups/universalPopups/deletePopup";
import { concatName } from "../../common/functions";
import PrintEmployeeSquare from "./universal/squares/printEmployeeSquare";

interface Props {
  employee: any;
  team: any;
  deleteFunction: Function;
  moveTo: Function;
}

interface State {
  keepLicences: number[];
  delete: Boolean;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
}

const REMOVE_EMPLOYEE_FROM_TEAM = gql`
  mutation removeFromTeam($teamid: ID!, $userid: ID!, $keepLicences: [ID!]) {
    removeFromTeam(teamid: $teamid, userid: $userid, keepLicences: $keepLicences)
  }
`;

class EmployeeDetails extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
    savingObject: null
  };

  printRemoveLicences(employee) {
    let RLicencesArray: JSX.Element[] = [];
    this.props.team.services.forEach((service, int) => {
      RLicencesArray.push(
        <li key={int}>
          <UniversalCheckbox
            name={service.id}
            startingvalue={true}
            liveValue={v =>
              v
                ? this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences.splice(
                      prevState.keepLicences.findIndex(l => l == service.id),
                      1
                    );

                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
                : this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences;
                    keepLicencesNew.push(service.id);

                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
            }>
            <span>Delete licence of {service.planid.appid.name}</span>
          </UniversalCheckbox>
        </li>
      );
    });
    return RLicencesArray != [] ? <ul style={{ marginTop: "20px" }}>{RLicencesArray}</ul> : "";
  }

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
    const team = this.props.team;
    return (
      <Mutation mutation={REMOVE_EMPLOYEE_FROM_TEAM} key={employee.id}>
        {removeFromTeam => (
          <div className="tableRow" onClick={() => this.props.moveTo(`emanager/${employee.id}`)}>
            <div className="tableMain">
              <div className="tableColumnSmall">
                <PrintEmployeeSquare employee={employee} />
                <span className="name">
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
              <DeletePopup
                key="deleteEmployee"
                heading="Remove Access"
                subHeading={`If you remove access to ${team.name} for ${concatName(
                  employee
                )}, you remove the following services`}
                employees={[employee]}
                services={this.props.team.services}
                main="employee"
                close={() => this.setState({ delete: false })}
                submit={values => {
                  removeFromTeam({
                    variables: {
                      teamid: this.props.team.unitid.id,
                      userid: employee!.id,
                      keepLicences: values[`m-${employee!.id}`]
                    },
                    refetchQueries: [
                      {
                        query: fetchTeam,
                        variables: { teamid: this.props.team.unitid.id }
                      }
                    ]
                  });
                  this.setState({ delete: false });
                }}
              />
            )}
          </div>
        )}
      </Mutation>
    );
  }
}

export default EmployeeDetails;
