import * as React from "react";
import { Query } from "react-apollo";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";
import { FETCH_EMPLOYEES } from "../../../../queries/departments";

interface Props {
  search: string;
  employees: any[];
  onChange: Function;
}

interface State {
  drag: any;
  dragdelete: any;
}

class EmployeeGrid extends React.Component<Props, State> {
  state = {
    drag: null,
    dragdelete: null
  };

  printTeamEmployees(interemployees) {
    let employeesArray: JSX.Element[] = [];
    let employees = [];
    if (interemployees.length > 0) {
      interemployees.sort(function(a, b) {
        let nameA = `${a.firstname} ${a.lastname}`.toUpperCase(); // ignore upper and lowercase
        let nameB = `${b.firstname} ${b.lastname}`.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });

      employees = interemployees.filter(e => e.id);

      employees.forEach(employee => {
        employeesArray.push(
          <div
            key={employee.id}
            className="space"
            draggable={true}
            onDragStart={() => this.setState({ dragdelete: employee })}
            onClick={() => this.props.onChange({ action: "remove", content: employee })}>
            <PrintEmployeeSquare className="image" employee={employee} size={88} />
            <div className="name" title={`${employee.firstname} ${employee.lastname}`}>{`${
              employee.firstname
            } ${employee.lastname}`}</div>
            {employee.current ? (
              <React.Fragment>
                <div className="greyed" />
                <div className="ribbon ribbon-top-right">
                  <span>Current Team</span>
                </div>
              </React.Fragment>
            ) : (
              <div className="imageHover">
                <i className="fal fa-trash-alt" />
                <span>Click to remove</span>
              </div>
            )}
            {employee.services && employee.services.some(s => !s.setupfinished) && (
              <div className="imageError" style={{ cursor: "pointer" }}>
                <i className="fal fa-exclamation-circle" />
                <span>Not all services configurated</span>
              </div>
            )}
            {employee.integrating && (
              <div className="imageCog">
                <i className="fal fa-cog fa-spin" />
                <span>Editing this membership</span>
              </div>
            )}
          </div>
        );
      });
    }
    let i = 0;
    while ((employees.length + i) % 4 != 0 || employees.length + i < 12 || i == 0) {
      employeesArray.push(
        <div className="space" key={`fake-${i}`}>
          <div className="fakeimage" />
          <div className="fakename" />
        </div>
      );
      i++;
    }
    return employeesArray;
  }

  render() {
    return (
      <div className="maingridAddEmployeeTeams">
        <div
          className="addgrid-holder"
          onDrop={e => {
            e.preventDefault();
            if (this.state.drag) {
              this.setState(prevState => {
                this.props.onChange({ action: "add", content: prevState.drag });
                return { drag: null };
              });
            }
          }}
          onDragOver={e => {
            e.preventDefault();
          }}>
          <div className="addgrid">{this.printTeamEmployees(this.props.employees)}</div>
        </div>
        <Query query={FETCH_EMPLOYEES}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }

            let employeeArray: JSX.Element[] = [];

            let employees = this.props.search
              ? data.fetchEmployees.filter(e =>
                  `${e.employee.firstname} ${e.employee.lastname}`
                    .toUpperCase()
                    .includes(this.props.search.toUpperCase())
                )
              : data.fetchEmployees.filter(e => true);

            employees.sort(function(a, b) {
              let nameA = `${a.employee.firstname} ${a.employee.lastname}`.toUpperCase(); // ignore upper and lowercase
              let nameB = `${b.employee.firstname} ${b.employee.lastname}`.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }

              // namen müssen gleich sein
              return 0;
            });
            //ausgrauen von Teams, in denen er schon drin ist  employeeTeams
            employees.forEach(e => {
              const employee = e.employee;
              const available = !this.props.employees.find(a => a.id == employee.id);
              employeeArray.push(
                <div
                  key={employee.id}
                  className="space"
                  draggable={available}
                  onDragStart={() => this.setState({ drag: employee })}
                  onClick={() =>
                    available && this.props.onChange({ action: "add", content: employee })
                  }>
                  <PrintEmployeeSquare employee={employee} className="image" size={88} />
                  <div className="name" title={`${employee.firstname} ${employee.lastname}`}>{`${
                    employee.firstname
                  } ${employee.lastname}`}</div>

                  {available ? (
                    <div className="imageHover">
                      <i className="fal fa-plus" />
                      <span>Click or drag to add</span>
                    </div>
                  ) : (
                    <React.Fragment>
                      <div className="greyed" />
                      <div className="ribbon ribbon-top-right">
                        <span>Member</span>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              );
            });
            return (
              <div
                className="addgrid-holder"
                onDrop={e => {
                  e.preventDefault();
                  if (this.state.dragdelete) {
                    this.setState(prevState => {
                      this.props.onChange({ action: "remove", content: prevState.dragdelete });
                      return { dragdelete: null };
                    });
                  }
                }}
                onDragOver={e => {
                  e.preventDefault();
                }}>
                <div className="addgrid">
                  <div
                    className="space"
                    draggable
                    onDragStart={() => this.setState({ drag: { new: true } })}
                    onClick={() => this.props.onChange({ action: "add", content: { new: true } })}>
                    <div className="image" style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                      <i className="fal fa-plus" />
                    </div>
                    <div className="name">Create Employee</div>
                  </div>
                  {employeeArray}
                </div>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}
export default EmployeeGrid;
