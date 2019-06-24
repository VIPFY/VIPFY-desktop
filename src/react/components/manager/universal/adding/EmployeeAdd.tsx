import * as React from "react";
import { Query } from "react-apollo";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";
import { FETCH_EMPLOYEES } from "../../../../queries/departments";

interface Props {
  search: string;
  team: any;
  setOuterState: Function;
  addedEmployees: any[];
  integrateEmployee: any;
}

interface State {
  drag: any;
  newEmpPopup: Boolean;
  popup: Boolean;
  integrateEmployee: any;
  addedEmployees: any[];
  dragdelete: any;
}

class EmployeeAdd extends React.Component<Props, State> {
  state = {
    newEmpPopup: false,
    popup: false,
    drag: null,
    integrateEmployee: null,
    dragdelete: null,
    addedEmployees: []
  };

  setBothStates = s => {
    this.setState(s);
    this.props.setOuterState(s);
  };

  printTeamEmployees(employeedata) {
    let employeesArray: JSX.Element[] = [];
    const interemployees = employeedata.concat(this.props.addedEmployees);
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

      console.log("EMPs", employees, employeedata, this.props.addedEmployees);

      employees.forEach(employee => {
        const oldemployee = false || employeedata.find(t => t.id == employee.id);
        employeesArray.push(
          <div
            key={employee.id}
            className="space"
            draggable={!oldemployee}
            onDragStart={() => this.setBothStates({ dragdelete: employee })}
            onClick={() =>
              this.setBothStates(prevState => {
                const remainingemployees = this.props.addedEmployees.filter(
                  e => e.id != employee.id
                );
                return { addedEmployees: remainingemployees };
              })
            }>
            <PrintEmployeeSquare className="image" employee={employee} />
            <div className="name">{`${employee.firstname} ${employee.lastname}`}</div>
            {oldemployee ? (
              <React.Fragment>
                <div className="greyed" />
                <div className="ribbon ribbon-top-right">
                  <span>Current Team</span>
                </div>
              </React.Fragment>
            ) : (
              <div className="imageHover">
                <i className="fal fa-trash-alt" />
                <span>Click or drag to remove</span>
              </div>
            )}
            {employee.services && employee.services.some(s => !s.setupfinished) && (
              <div className="imageError" style={{ cursor: "pointer" }}>
                <i className="fal fa-exclamation-circle" />
                <span>Not all services configurated</span>
              </div>
            )}
          </div>
        );
      });
    }
    let j = 0;
    if (this.props.integrateEmployee) {
      console.log("INTEGRATE EMP");
      const employee: {
        profilepicture: string;
        firstname: string;
        lastname: string;
        integrating: Boolean;
        id: number;
        services: any[];
      } = this.props.integrateEmployee!;
      employeesArray.push(
        <div className="space" key={employee.id}>
          <PrintEmployeeSquare employee={employee} className="image" />
          <div className="name">{`${employee.firstname} ${employee.lastname}`}</div>
          <div className="imageHover">
            <i className="fal fa-trash-alt" />
            <span>Click or drag to remove</span>
          </div>
          {employee.integrating ? (
            <div className="imageCog">
              <i className="fal fa-cog fa-spin" />
              <span>Editing this membership</span>
            </div>
          ) : (
            ""
          )}
        </div>
      );
      j = 1;
    }
    let i = 0;
    while ((employees.length + j + i) % 4 != 0 || employees.length + j + i < 12 || i == 0) {
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
              if (this.state.drag!.new) {
                this.setBothStates({
                  drag: null,
                  newEmpPopup: true
                });
              }
              this.setBothStates(prevState => {
                return {
                  popup: true,
                  drag: null,
                  integrateEmployee: Object.assign(
                    {},
                    { integrating: true, services: [], ...prevState.drag }
                  )
                };
              });
            }
          }}
          onDragOver={e => {
            e.preventDefault();
          }}>
          <div className="addgrid">{this.printTeamEmployees(this.props.team.employees)}</div>
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
              const available = !(
                this.props.team.employees.find(a => a.id == employee.id) ||
                this.props.addedEmployees.find(a => a.id == employee.id)
              );
              employeeArray.push(
                <div
                  key={employee.id}
                  className="space"
                  draggable={available}
                  onDragStart={() => this.setBothStates({ drag: employee })}
                  onClick={() =>
                    available &&
                    this.setBothStates(() => {
                      return {
                        popup: true,
                        integrateEmployee: Object.assign(
                          {},
                          { integrating: true, services: [], ...employee }
                        )
                      };
                    })
                  }>
                  <PrintEmployeeSquare employee={employee} className="image" />
                  <div className="name">{`${employee.firstname} ${employee.lastname}`}</div>

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
                    this.setBothStates(prevState => {
                      const remainingEmployees = this.props.addedEmployees.filter(
                        e => e.id != this.state.dragdelete!.id
                      );
                      return { addedEmployees: remainingEmployees };
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
                    onClick={() => this.setBothStates({ newEmpPopup: true })}
                    onDragStart={() => this.setBothStates({ drag: { new: true } })}>
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
export default EmployeeAdd;
