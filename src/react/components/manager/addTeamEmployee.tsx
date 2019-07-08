import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { FETCH_EMPLOYEES, fetchTeam } from "../../queries/departments";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../universalSearchBox";
import PopupAddLicence from "../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import PrintEmployeeSquare from "./universal/squares/printEmployeeSquare";
import EmployeeGerneralDataAdd from "./universal/adding/employeeGeneralDataAdd";
import { parseName } from "humanparser";
import { randomPassword } from "../../common/passwordgen";
import EmployeeAdd from "./universal/adding/EmployeeAdd";

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
  newEmpPopup: Boolean;
  newEmployee: any;
}

const ADD_TO_TEAM = gql`
  mutation addToTeam(
    $userid: ID!
    $teamid: ID!
    $services: [SetupService]!
    $newEmployeeInfo: JSON
  ) {
    addToTeam(
      userid: $userid
      teamid: $teamid
      services: $services
      newEmployeeInfo: $newEmployeeInfo
    )
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
    saving: false,
    newEmpPopup: false,
    newEmployee: null
  };

  componentWillReceiveProps(props) {
    if (this.props.team.employees != props.team.employees) {
      this.setState({ addedEmployees: [] });
    }
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
                <li key={service.planid.appid.name} style={{ fontSize: "12px" }}>
                  {service.setupfinished ? (
                    <i
                      className="fal fa-check-circle"
                      style={{ color: "#20BAA9", marginRight: "4px" }}
                    />
                  ) : (
                    <i
                      className="fal fa-times-circle"
                      style={{ color: "#FF2700", marginRight: "4px" }}
                    />
                  )}
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
    console.log("STATE", this.state, this.props);
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
                placeholder="Search available employees"
                getValue={v => this.setState({ search: v })}
              />
              <EmployeeAdd
                team={this.props.team}
                search={this.state.search}
                setOuterState={s => this.setState(s)}
                addedEmployees={this.state.addedEmployees}
                integrateEmployee={this.state.integrateEmployee}
              />
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
                  savedmessage="The employee has been successfully added"
                  savingmessage="The employee is currently added"
                  closeFunction={() => {
                    this.setState({ saving: false });
                    this.props.close();
                  }}
                  saveFunction={async () => {
                    const addpromises: any[] = [];
                    this.state.addedEmployees.forEach(employee => {
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
                      addpromises.push(
                        addToTeam({
                          variables: {
                            userid: employee.id,
                            teamid: this.props.team.unitid.id,
                            services: servicesdata,
                            newEmployeeInfo: employee
                          },
                          refetchQueries: [
                            {
                              query: fetchTeam,
                              variables: { teamid: this.props.team.unitid.id }
                            }
                          ]
                        })
                      );
                    });
                    await Promise.all(addpromises);
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
                  {this.state.integrateEmployee && (
                    <div>
                      <h1 className="cleanup lightHeading">
                        Add {this.state.integrateEmployee!.firstname}{" "}
                        {this.state.integrateEmployee!.lastname} to team {this.props.team.name}
                      </h1>
                    </div>
                  )}

                  {this.printEmployeeAddSteps()}
                </PopupBase>
              )}

              {this.state.newEmpPopup && (
                <PopupBase
                  buttonStyles={{ marginTop: "0px" }}
                  fullmiddle={true}
                  close={() => {
                    this.setState({
                      drag: null,
                      newEmpPopup: false,
                      integrateEmployee: null,
                      configureTeamLicences: true,
                      newEmployee: null
                    });
                  }}>
                  <span>
                    <span className="bHeading">Add Employee </span>
                  </span>
                  <EmployeeGerneralDataAdd
                    addpersonal={null}
                    setOuterState={s =>
                      this.setState(prevState => {
                        console.log("STATE UPDATE", this.state, prevState);
                        return { newEmployee: { ...prevState.newEmployee, ...s } };
                      })
                    }
                  />
                  <div className="buttonsPopup">
                    <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />
                    <div className="buttonSeperator" />
                    <UniversalButton
                      label="Confirm"
                      type="high"
                      disabled={
                        !this.state.newEmployee ||
                        this.state.newEmployee!.name == "" ||
                        this.state.newEmployee!.name == null ||
                        this.state.newEmployee!.wmail1 == "" ||
                        this.state.newEmployee!.wmail1 == null ||
                        (this.state.newEmployee!.wmail1 &&
                          !this.state.newEmployee!.wmail1.includes("@"))
                      }
                      onClick={async () => {
                        const newpassword = await randomPassword();

                        this.setState(prevState => {
                          const name = parseName(prevState.newEmployee.name);
                          return {
                            drag: null,
                            popup: true,
                            newEmpPopup: false,
                            integrateEmployee: Object.assign({
                              new: true,
                              password: newpassword,
                              firstname: name.firstName,
                              lastname: name.lastName,
                              integrating: true,
                              services: [],
                              ...prevState.newEmployee,
                              profilepicture: null,
                              id: "new"
                            }),
                            configureTeamLicences: true,
                            newEmployee: null
                          };
                        });
                      }}
                    />
                  </div>
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
                  employee={this.state.integrateEmployee!}
                  maxstep={this.props.team.services.length}
                  currentstep={this.state.counter}
                />
              )}
          </>
        )}
      </Mutation>
    );
  }
}
export default AddTeamEmployee;
