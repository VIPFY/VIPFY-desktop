import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query } from "react-apollo";
import { FETCH_EMPLOYEES } from "../../queries/departments";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../universalSearchBox";
import EmployeeAdd from "./universal/adding/EmployeeAdd";
import EmployeeGerneralDataAdd from "./universal/adding/employeeGeneralDataAdd";
import EmployeeGerneralDataAdd from "./universal/adding/employeeGeneralDataAdd";
import { parseName } from "humanparser";
import { randomPassword } from "../../common/passwordgen";

interface Props {
  close: Function;
  continue: Function;
  teamname: string;
  employees: any[];
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
  mutation addToTeam($userid: ID!, $teamid: ID!, $services: [SetupService]!) {
    addToTeam(userid: $userid, teamid: $teamid, services: $services)
  }
`;

const UPDATE_PIC = gql`
  mutation onUpdateTeamPic($file: Upload!, $teamid: ID!) {
    updateTeamPic(file: $file, teamid: $teamid) {
      unitid {
        id
      }
      profilepicture
    }
  }
`;

class AddTeamEmployeeData extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateEmployee: null,
    dragdelete: null,
    addedEmployees: this.props.employees || [],
    counter: 0,
    configureTeamLicences: true,
    saved: false,
    error: null,
    saving: false,
    newEmpPopup: false,
    newEmployee: null
  };

  printEmployeeAddSteps() {
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
  }

  render() {
    console.log("STATE", this.state);
    return (
      <>
        <PopupBase
          nooutsideclose={true}
          fullmiddle={true}
          customStyles={{ maxWidth: "1152px" }}
          close={() => this.props.close(null)}>
          <span className="mutiplieHeading">
            <span className="bHeading">Add Team </span>
            {/*<span className="mHeading">
              > General Data > <span className="active">Employees</span> > Services
    </span>*/}
          </span>
          <span className="secondHolder">Available Employees</span>
          <UniversalSearchBox
            placeholder="Search available employees"
            getValue={v => this.setState({ search: v })}
          />

          <EmployeeAdd
            team={{ employees: [], name: this.props.teamname }} //TODO Add Teampicture
            search={this.state.search}
            setOuterState={s => this.setState(s)}
            addedEmployees={this.state.addedEmployees}
            integrateEmployee={this.state.integrateEmployee}
          />

          <UniversalButton label="Back" type="low" closingPopup={true} />

          <UniversalButton
            label="Continue"
            type="high"
            onClick={() => {
              this.props.continue(this.state.addedEmployees);
            }}
          />

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
                    {this.state.integrateEmployee!.lastname} to team {this.props.teamname}
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
      </>
    );
  }
}
export default AddTeamEmployeeData;
