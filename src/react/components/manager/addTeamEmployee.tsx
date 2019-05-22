import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import {
  fetchCompanyTeams,
  fetchTeams,
  fetchUserLicences,
  fetchTeam
} from "../../queries/departments";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../universalSearchBox";
import PopupAddLicence from "../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";

interface Props {
  team: any;
  close: Function;
}

interface State {
  search: string;
  popup: Boolean;
  drag: {
    profilepicture: string;
    internaldata: { color: string; letters: string };
    name: string;
    integrating: Boolean;
  } | null;
  integrateEmployee: {
    profilepicture: string;
    firstname: string;
    lastname: string;
    integrating: Boolean;
    id: number;
    services: any[];
  } | null;
  dragdelete: {
    profilepicture: string;
    firstname: string;
    lastname: string;
    integrating: Boolean;
    id: number;
    services: any[];
  } | null;
  addedEmployees: Object[];
  counter: number;
  configureTeamLicences: Boolean;
  saved: Boolean;
  error: string | null;
  saving: Boolean;
}

const ADD_TO_TEAM = gql`
  mutation addToTeam($userid: ID!, $teamid: ID!, $services: [SetupService]!) {
    addToTeam(userid: $userid, teamid: $teamid, services: $services)
  }
`;

const FETCH_EMPLOYEES = gql`
  {
    fetchEmployees {
      employee {
        id
        firstname
        lastname
        middlename
        profilepicture
      }
    }
  }
`;

class AddTeamEmployee extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateEmployee: null,
    dragdelete: null,
    addedEmployees: [],
    counter: 0,
    configureTeamLicences: true,
    saved: false,
    error: null,
    saving: false
  };

  componentWillReceiveProps(props) {
    if (this.props.team.employees != props.team.employees) {
      this.setState({ addedEmployees: [] });
    }
  }

  printTeamEmployees(employeedata) {
    let employeesArray: JSX.Element[] = [];
    const interemployees = employeedata.concat(this.state.addedEmployees);
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

      console.log("EMPs", employeedata, this.state.addedEmployees);

      employees.forEach(employee => {
        const oldemployee = false || employeedata.find(t => t.id == employee.id);
        employeesArray.push(
          <div
            key={employee.id}
            className="space"
            draggable={!oldemployee}
            onDragStart={() => this.setState({ dragdelete: employee })}
            onClick={() =>
              this.setState(prevState => {
                const remainingemployees = prevState.addedEmployees.filter(
                  e => e.id != employee.id
                );
                return { addedEmployees: remainingemployees };
              })
            }>
            <div
              className="image"
              style={
                employee.profilepicture
                  ? employee.profilepicture.indexOf("/") != -1
                    ? {
                        backgroundImage: encodeURI(
                          `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                            employee.profilepicture
                          )})`
                        )
                      }
                    : {
                        backgroundImage: encodeURI(
                          `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                            employee.profilepicture
                          })`
                        )
                      }
                  : { backgroundColor: "#5D76FF" }
              }>
              {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
            </div>
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
    if (this.state.integrateEmployee) {
      console.log("INTEGRATE EMP");
      const employee: {
        profilepicture: string;
        firstname: string;
        lastname: string;
        integrating: Boolean;
        id: number;
        services: any[];
      } = this.state.integrateEmployee!;
      employeesArray.push(
        <div className="space" key={employee.id}>
          <div
            className="image"
            style={
              employee.profilepicture
                ? employee.profilepicture.indexOf("/") != -1
                  ? {
                      backgroundImage: encodeURI(
                        `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                          employee.profilepicture
                        )})`
                      )
                    }
                  : {
                      backgroundImage: encodeURI(
                        `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                          employee.profilepicture
                        })`
                      )
                    }
                : { backgroundColor: "#5D76FF" }
            }>
            {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
          </div>
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

  printEmployeeAddSteps() {
    if (this.props.team.services.length == 0) {
      return (
        <div className="buttonsPopup">
          <UniversalButton
            type="low"
            onClick={() =>
              this.setState({
                drag: null,
                integrateEmployee: null,
                popup: false
              })
            }
            label="Cancel"
          />
          <div className="buttonSeperator" />
          <UniversalButton
            type="high"
            onClick={() =>
              this.setState(prevState => {
                let oldemployees = prevState.addedEmployees;
                oldemployees.push(prevState.integrateEmployee);
                return {
                  drag: null,
                  addedEmployees: oldemployees,
                  integrateEmployee: null,
                  popup: false
                };
              })
            }
            label="Confirm"
          />
        </div>
      );
    } else {
      return (
        <React.Fragment>
          <ul className="checks">
            {this.state.integrateEmployee!.services.map(service => {
              return (
                <li key={service.planid.appid.name}>
                  Individual Teamlicence for <b>{service.planid.appid.name}</b>
                  {service.setupfinished
                    ? " successfully configurated"
                    : service.setupfinished == null
                    ? "not started"
                    : " not configured"}
                </li>
              );
            })}
            {/*this.props.team!.licences.map(licence => {
              return (
                <li key={licence.boughtplanid.planid.appid.name}>
                  Teamlicence for <b>{licence.boughtplanid.planid.appid.name}</b> configured
                </li>
              );
            })*/}
          </ul>
          <div className="buttonsPopup">
            <UniversalButton
              type="low"
              onClick={() =>
                this.setState({
                  drag: null,
                  integrateEmployee: null,
                  popup: false,
                  counter: 0,
                  configureTeamLicences: true
                })
              }
              label="Cancel"
            />
            <div className="buttonSeperator" />
            <UniversalButton
              type="high"
              onClick={() =>
                this.setState(prevState => {
                  let oldemployees = prevState.addedEmployees;
                  oldemployees.push(prevState.integrateEmployee);
                  return {
                    drag: null,
                    addedEmployees: oldemployees,
                    integrateEmployee: null,
                    popup: false,
                    counter: 0,
                    configureTeamLicences: true
                  };
                })
              }
              label="Confirm"
            />
          </div>
        </React.Fragment>
      );
    }
  }

  render() {
    console.log("STATE", this.state);
    return (
      <Mutation mutation={ADD_TO_TEAM}>
        {addToTeam => (
          <>
            <PopupBase
              nooutsideclose={true}
              fullmiddle={true}
              customStyles={{ maxWidth: "1152px" }}
              close={() => this.props.close(null)}>
              <span className="mutiplieHeading">
                <span className="mHeading">Add Employees </span>
              </span>
              <span className="secondHolder">Available Employees</span>
              <UniversalSearchBox
                placeholder="Search available services"
                getValue={v => this.setState({ search: v })}
              />
              <div className="maingridAddEmployeeTeams">
                <div
                  className="addgrid-holder"
                  onDrop={e => {
                    e.preventDefault();
                    if (this.state.drag) {
                      this.setState(prevState => {
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
                  <div className="addgrid">
                    {this.printTeamEmployees(this.props.team.employees)}
                  </div>
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

                    let employees = data.fetchEmployees.filter(e =>
                      `${e.employee.firstname} ${e.employee.lastname}`
                        .toUpperCase()
                        .includes(this.state.search.toUpperCase())
                    );

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
                        this.state.addedEmployees.find(a => a.id == employee.id)
                      );
                      employeeArray.push(
                        <div
                          key={employee.id}
                          className="space"
                          draggable={available}
                          onDragStart={() => this.setState({ drag: employee })}
                          onClick={() =>
                            available &&
                            this.setState(() => {
                              return {
                                popup: true,
                                integrateEmployee: Object.assign(
                                  {},
                                  { integrating: true, services: [], ...employee }
                                )
                              };
                            })
                          }>
                          <div
                            className="image"
                            style={
                              employee.profilepicture
                                ? employee.profilepicture.indexOf("/") != -1
                                  ? {
                                      backgroundImage: encodeURI(
                                        `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                          employee.profilepicture
                                        )})`
                                      )
                                    }
                                  : {
                                      backgroundImage: encodeURI(
                                        `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                          employee.profilepicture
                                        })`
                                      )
                                    }
                                : { backgroundColor: "#5D76FF" }
                            }>
                            {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
                          </div>
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
                            this.setState(prevState => {
                              const remainingEmployees = prevState.addedEmployees.filter(
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
                          {/*<div
                                  className="space"
                                  draggable
                                  onDragStart={() => this.setState({ drag: { new: true } })}>
                                  <div
                                    className="image"
                                    style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                                    <i className="fal fa-plus" />
                                  </div>
                                  <div className="name">Add Teams</div>
                                </div>*/}
                          {employeeArray}
                        </div>
                      </div>
                    );
                  }}
                </Query>
              </div>
              <UniversalButton label="Cancel" type="low" closingPopup={true} />

              <UniversalButton
                label="Save"
                type="high"
                onClick={() => {
                  this.setState({ saving: true });
                }}
              />

              {this.state.saving && (
                <PopupSelfSaving
                  savedmessage="The Team has been successfully added"
                  savingmessage="The Team is currently added"
                  closeFunction={() => {
                    this.setState({ saving: false });
                    this.props.close();
                  }}
                  saveFunction={() => {
                    this.state.addedEmployees.forEach(async employee => {
                      let servicesdata: {
                        id: string;
                        setup: JSON;
                        setupfinished: Boolean;
                      }[] = [];
                      employee.services.forEach(service => {
                        servicesdata.push({
                          id: service.id,
                          setup: service.setup,
                          setupfinished: service.setupfinished
                        });
                      });
                      await addToTeam({
                        variables: {
                          userid: employee.id,
                          teamid: this.props.team.unitid.id,
                          services: servicesdata
                        },
                        refetchQueries: [
                          {
                            query: fetchTeam,
                            variables: { teamid: this.props.team.unitid.id }
                          }
                        ]
                      });
                    });
                  }}
                />
              )}

              {this.state.popup && (
                <PopupBase
                  buttonStyles={{ marginTop: "0px" }}
                  fullmiddle={true}
                  small={true}
                  close={() => {
                    this.setState({
                      drag: null,
                      integrateEmployee: null,
                      popup: false,
                      counter: 0,
                      configureTeamLicences: true
                    });
                  }}>
                  <div>
                    <h1 className="cleanup lightHeading">
                      Add {this.state.integrateEmployee!.firstname}{" "}
                      {this.state.integrateEmployee!.lastname} to team {this.props.team.name}
                    </h1>
                  </div>

                  {this.printEmployeeAddSteps()}
                </PopupBase>
              )}
            </PopupBase>
            {this.state.configureTeamLicences &&
              this.props.team!.services.length > 0 &&
              this.state.integrateEmployee && (
                <PopupAddLicence
                  nooutsideclose={true}
                  app={this.props.team!.services[this.state.counter].planid.appid}
                  cancel={async () => {
                    await this.setState(prevState => {
                      let newcounter = prevState.counter + 1;
                      let currentlicence = Object.assign(
                        {},
                        this.props.team!.services[prevState.counter]
                      );
                      currentlicence.setupfinished = false;
                      currentlicence.setup = {};
                      const newintegrateEmployee = Object.assign({}, prevState.integrateEmployee);
                      let newintegrateEmployee2 = newintegrateEmployee;
                      newintegrateEmployee2.services = prevState.integrateEmployee!.services;
                      newintegrateEmployee2.services.push(currentlicence);
                      if (newcounter < this.props.team.services.length) {
                        return {
                          ...prevState,
                          counter: newcounter,
                          integrateEmployee: newintegrateEmployee2
                        };
                      } else {
                        return {
                          ...prevState,
                          configureTeamLicences: false,
                          integrateEmployee: newintegrateEmployee2
                        };
                      }
                    });
                  }}
                  add={async setup => {
                    await this.setState(prevState => {
                      let newcounter = prevState.counter + 1;
                      let currentlicence = Object.assign(
                        {},
                        this.props.team!.services[prevState.counter]
                      );
                      currentlicence.setupfinished = true;
                      currentlicence.setup = setup;
                      console.log("Current Licence", currentlicence);
                      const newintegrateEmployee = Object.assign({}, prevState.integrateEmployee);
                      let newintegrateEmployee2 = newintegrateEmployee;
                      newintegrateEmployee2.services = prevState.integrateEmployee!.services;
                      newintegrateEmployee2.services.push(currentlicence);
                      if (newcounter < this.props.team!.services.length) {
                        return {
                          ...prevState,
                          counter: newcounter,
                          integrateEmployee: newintegrateEmployee2
                        };
                      } else {
                        return {
                          ...prevState,
                          configureTeamLicences: false,
                          integrateEmployee: newintegrateEmployee2
                        };
                      }
                    });
                  }}
                  employeename={`${this.state.integrateEmployee!.firstname} ${
                    this.state.integrateEmployee!.lastname
                  }`}
                />
              )}
          </>
        )}
      </Mutation>
    );
  }
}
export default AddTeamEmployee;
