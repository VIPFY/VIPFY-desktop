import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalSearchBox from "../universalSearchBox";
import { Query } from "react-apollo";
import { fetchCompanyTeams } from "../../queries/departments";
import PopupAddLicence from "../../popups/universalPopups/addLicence";
import PopupBase from "../../popups/universalPopups/popupBase";
import TeamAdd from "./universal/adding/TeamAdd";
import TeamDelete from "./universal/deleting/TeamDelete";

interface Props {
  close: Function;
  continue: Function;
  teams: any[];
  employee: any;
  setOuterState?: Function;
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
  integrateTeam: {
    profilepicture: string;
    internaldata: { color: string; letters: string };
    name: string;
    integrating: Boolean;
  } | null;
  dragdelete: {
    profilepicture: string;
    internaldata: { color: string; letters: string };
    name: string;
    integrating: Boolean;
  } | null;
  addteams: Object[];
  counter: number;
  configureTeamLicences: Boolean;
  saved: Boolean;
  error: string | null;
  saving: Boolean;
  deleteTeam: any;
}

class AddEmployeeTeams extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateTeam: null,
    dragdelete: null,
    addteams: this.props.teams || [],
    counter: 0,
    configureTeamLicences: true,
    saved: false,
    error: null,
    saving: false,
    deleteTeam: null
  };

  setBothStates = s => {
    this.setState(s);
    if (this.props.setOuterState) {
      this.props.setOuterState(s);
    }
  };

  printTeamAddSteps() {
    if (this.state.integrateTeam.services.length == 0) {
      return (
        <div className="buttonsPopup">
          <UniversalButton
            type="low"
            onClick={() =>
              this.setState({
                drag: null,
                integrateTeam: null,
                popup: false
              })
            }
            label="Cancel"
          />
          <div className="buttonSeperator" />
          <UniversalButton
            type="high"
            onClick={() => {
              let oldteams = this.props.teams;
              const integrateTeam = Object.assign({}, this.state.integrateTeam!);
              integrateTeam.setupfinished = true;
              integrateTeam.employees.push({
                id: this.props.employee.id,
                firstname: this.props.employee.parsedName.firstname,
                lastname: this.props.employee.parsedName.lastname,
                integrating: true,
                setupfinished: true
              });
              oldteams.push(integrateTeam);
              this.setBothStates({
                drag: null,
                addteams: oldteams,
                integrateTeam: null,
                popup: false
              });
            }}
            label="Confirm"
          />
        </div>
      );
    } else {
      return (
        <React.Fragment>
          <ul className="checks">
            {this.state.integrateTeam!.services.map(service => {
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
            {this.state.integrateTeam!.licences.map(licence => {
              return (
                <li key={licence.boughtplanid.planid.appid.name}>
                  Teamlicence for <b>{licence.boughtplanid.planid.appid.name}</b> configured
                </li>
              );
            })}
          </ul>
          <div className="buttonsPopup">
            <UniversalButton
              type="low"
              onClick={() =>
                this.setState({
                  drag: null,
                  integrateTeam: null,
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
              onClick={() => {
                let oldteams = this.props.teams;
                const integrateTeam = Object.assign({}, this.state.integrateTeam!);
                integrateTeam.setupfinished = true;
                integrateTeam.employees.push({
                  id: this.props.employee.id,
                  firstname: this.props.employee.parsedName.firstname,
                  lastname: this.props.employee.parsedName.lastname,
                  integrating: true,
                  setupfinished: true
                });
                oldteams.push(integrateTeam);
                this.setBothStates({
                  drag: null,
                  addteams: oldteams,
                  integrateTeam: null,
                  popup: false,
                  counter: 0,
                  configureTeamLicences: true
                });
              }}
              label="Confirm"
            />
          </div>
        </React.Fragment>
      );
    }
  }

  render() {
    console.log("AET", this.props, this.state);
    return (
      <React.Fragment>
        <span className="mutiplieHeading">
          <span className="bHeading">Add Employee </span>
          {/*<span className="mHeading">
            > Personal Data > <span className="active">Teams</span> >{" "}
            <span className="inactive">Services</span>
    </span>*/}
        </span>
        <span className="secondHolder">Available Teams</span>
        <UniversalSearchBox
          placeholder="Search available services"
          getValue={v => this.setState({ search: v })}
        />
        {/* TODO ON CHANGE*/}
        <TeamAdd teams={[]} search={this.state.search} onChange={s => this.setState(s)} />

        <div className="buttonsPopup">
          <UniversalButton label="Close" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            onClick={() => this.props.continue(this.props.teams)}
          />
        </div>
        {this.state.popup && this.state.integrateTeam && (
          <PopupBase
            buttonStyles={{ marginTop: "0px" }}
            fullmiddle={true}
            small={true}
            close={() => {
              this.setState({
                drag: null,
                integrateTeam: null,
                popup: false,
                counter: 0,
                configureTeamLicences: true
              });
            }}>
            <div>
              <h1 className="cleanup lightHeading">
                Add {this.props.employeename} to team {this.state.integrateTeam.name}
              </h1>
            </div>

            {this.printTeamAddSteps()}
          </PopupBase>
        )}

        {this.state.popup && this.state.deleteTeam && (
          <TeamDelete
            employee={this.props.employee}
            team={this.state.deleteTeam}
            setOuterState={s => this.setState(s)}
            savingFunction={so => {
              console.log(
                "SO",
                so,
                this.state,
                this.props,
                this.props.teams.findIndex(s => s.unitid.id == so.teamid)
              );
              const oldteams = this.props.teams;
              this.setBothStates({
                drag: null,
                addteams:
                  oldteams && oldteams.splice(oldteams.findIndex(s => s.unitid.id == so.teamid), 1),
                integrateTeam: null,
                deleteTeam: null,
                popup: false,
                counter: 0
              });
            }}
          />
        )}
        {this.state.configureTeamLicences &&
          this.state.integrateTeam &&
          this.state.integrateTeam!.services.length > 0 && (
            <PopupAddLicence
              nooutsideclose={true}
              app={this.state.integrateTeam!.services[this.state.counter].planid.appid}
              cancel={async () => {
                await this.setState(prevState => {
                  let newcounter = prevState.counter + 1;
                  let currentlicence = Object.assign(
                    {},
                    prevState.integrateTeam!.services[prevState.counter]
                  );
                  currentlicence.setupfinished = false;
                  currentlicence.setup = {};
                  const newintegrateTeam = Object.assign({}, prevState.integrateTeam);
                  let newintegrateTeam2 = newintegrateTeam;
                  newintegrateTeam2.services = newintegrateTeam2.services.map(a =>
                    a.id == currentlicence.id ? currentlicence : a
                  );
                  if (newcounter < prevState.integrateTeam.services.length) {
                    return {
                      ...prevState,
                      counter: newcounter,
                      integrateTeam: newintegrateTeam2
                    };
                  } else {
                    return {
                      ...prevState,
                      configureTeamLicences: false,
                      integrateTeam: newintegrateTeam2
                    };
                  }
                });
              }}
              add={async setup => {
                await this.setState(prevState => {
                  let newcounter = prevState.counter + 1;
                  let currentlicence = Object.assign(
                    {},
                    prevState.integrateTeam!.services[prevState.counter]
                  );
                  currentlicence.setupfinished = true;
                  currentlicence.setup = setup;
                  currentlicence.setup.employeeid = this.props.employee.id;
                  const newintegrateTeam = Object.assign({}, prevState.integrateTeam);
                  let newintegrateTeam2 = newintegrateTeam;
                  newintegrateTeam2.services = newintegrateTeam2.services.map(a =>
                    a.id == currentlicence.id ? currentlicence : a
                  );
                  if (newcounter < prevState.integrateTeam.services.length) {
                    return {
                      ...prevState,
                      counter: newcounter,
                      integrateTeam: newintegrateTeam2
                    };
                  } else {
                    return {
                      ...prevState,
                      configureTeamLicences: false,
                      integrateTeam: newintegrateTeam2
                    };
                  }
                });
              }}
              employeename={this.props.employeename}
              maxstep={this.state.integrateTeam!.services.length}
              currentstep={this.state.counter}
            />
          )}
      </React.Fragment>
    );
  }
}
export default AddEmployeeTeams;
