import * as React from "react";
import UniversalButton from "../../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import {
  fetchCompanyTeams,
  fetchTeams,
  fetchUserLicences,
  fetchTeam
} from "../../../queries/departments";
import gql from "graphql-tag";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../../universalSearchBox";
import PopupAddLicence from "../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../popups/universalPopups/selfSaving";
import { fetchApps, fetchCompanyService } from "../../../queries/products";

interface Props {
  service: any;
  teams: any[];
  close: Function;
  continue?: Function;
  addedTeams?: any[];
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
    name: string;
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
  teams: Object[];
  counter: number;
  configureTeamLicences: Boolean;
  saved: Boolean;
  error: string | null;
  saving: Boolean;
}

const ADD_TO_TEAM = gql`
  mutation addAppToTeam($serviceid: ID!, $teamid: ID!, $employees: [SetupService]!) {
    addAppToTeam(serviceid: $serviceid, teamid: $teamid, employees: $employees)
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

class AddTeam extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateTeam: null,
    dragdelete: null,
    teams: this.props.addedTeams || [],
    counter: 0,
    configureTeamLicences: true,
    saved: false,
    error: null,
    saving: false
  };

  componentWillReceiveProps(props) {
    if (this.props.teams != props.teams) {
      this.setState({ teams: [] });
    }
  }

  printServiceTeams(addedTeams) {
    let teamsArray: JSX.Element[] = [];
    let oldTeams = [];
    if (this.props.teams.length > 0) {
      this.props.teams.forEach(t => {
        oldTeams.push({ ...t.departmentid, oldteam: true });
      });
    }
    const teams = oldTeams.concat(addedTeams);
    if (teams.length > 0) {
      teams.sort(function(a, b) {
        let nameA = a.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });

      teams.forEach(team => {
        teamsArray.push(
          <div
            key={team.name}
            className="space"
            draggable={team.oldteam}
            onDragStart={() => this.setState({ dragdelete: team })}
            onClick={() =>
              this.setState(prevState => {
                const remainingteams = prevState.addedTeams.filter(
                  e => e.unitid.id != team.unitid.id
                );
                return { addedTeams: remainingteams };
              })
            }>
            <div
              className="image"
              style={
                team.profilepicture
                  ? {
                      backgroundImage:
                        team.profilepicture.indexOf("/") != -1
                          ? `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                              team.profilepicture
                            )})`
                          : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                              team.profilepicture
                            )})`,
                      backgroundColor: "unset"
                    }
                  : team.internaldata && team.internaldata.color
                  ? { backgroundColor: team.internaldata.color }
                  : {}
              }>
              {team.profilepicture
                ? ""
                : team.internaldata && team.internaldata.letters
                ? team.internaldata.letters
                : team.name.slice(0, 1)}
            </div>
            <div className="name">{team.name}</div>
            {team.oldteam ? (
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
          </div>
        );
      });
    }
    let j = 0;
    if (this.state.integrateTeam) {
      const team: {
        profilepicture: string;
        internaldata: { color: string; letters: string };
        name: string;
        integrating: Boolean;
      } = this.state.integrateTeam!;
      teamsArray.push(
        <div className="space" key={team.name}>
          <div
            className="image"
            style={
              team.profilepicture
                ? {
                    backgroundImage:
                      team.profilepicture.indexOf("/") != -1
                        ? `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                            team.profilepicture
                          )})`
                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                            team.profilepicture
                          )})`,
                    backgroundColor: "unset"
                  }
                : team.internaldata && team.internaldata.color
                ? { backgroundColor: team.internaldata.color }
                : {}
            }>
            {team.profilepicture
              ? ""
              : team.internaldata && team.internaldata.letters
              ? team.internaldata.letters
              : team.name.slice(0, 1)}
          </div>
          <div className="name">{team.name}</div>
          <div className="imageHover">
            <i className="fal fa-trash-alt" />
            <span>Click or drag to remove</span>
          </div>
          {team.integrating ? (
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
    while ((teams.length + j + i) % 4 != 0 || teams.length + j + i < 12 || i == 0) {
      teamsArray.push(
        <div className="space" key={`fake-${i}`}>
          <div className="fakeimage" />
          <div className="fakename" />
        </div>
      );
      i++;
    }
    return teamsArray;
  }

  printEmployeeAddSteps() {
    if (this.state.integrateTeam.employees.length == 0) {
      return (
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
            onClick={() =>
              this.setState(prevState => {
                let oldteams = prevState.teams;
                oldteams.push({ integrating: null, ...prevState.integrateTeam });
                return {
                  drag: null,
                  teams: oldteams,
                  integrateTeam: null,
                  popup: false,
                  counter: 0,
                  configureTeamLicences: true
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
            {this.state.integrateTeam!.employees &&
              this.state.integrateTeam!.employees.map(employee => {
                return (
                  <li key={employee.id}>
                    Individual Teamlicence for <b>{`${employee.firstname} ${employee.lastname}`}</b>
                    {employee.setupfinished
                      ? " successfully configurated"
                      : employee.setupfinished == null
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
              onClick={() =>
                this.setState(prevState => {
                  let oldteams = prevState.teams;
                  oldteams.push({ integrating: null, ...prevState.integrateTeam });
                  return {
                    drag: null,
                    teams: oldteams,
                    integrateTeam: null,
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
    return (
      <Mutation mutation={ADD_TO_TEAM}>
        {addAppToTeam => (
          <>
            <PopupBase
              nooutsideclose={true}
              fullmiddle={true}
              customStyles={{ maxWidth: "1152px" }}
              close={() => this.props.close(null)}>
              <span className="mutiplieHeading">
                <span className="mHeading">Add Teams </span>
              </span>
              <span className="secondHolder">Available Teams</span>
              <UniversalSearchBox
                placeholder="Search available Teams"
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
                          integrateTeam: Object.assign(
                            {},
                            { integrating: true, teams: [], ...prevState.drag }
                          )
                        };
                      });
                    }
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                  }}>
                  <div className="addgrid">{this.printServiceTeams(this.state.teams)}</div>
                </div>
                <Query query={fetchCompanyTeams}>
                  {({ loading, error, data }) => {
                    if (loading) {
                      return "Loading...";
                    }
                    if (error) {
                      return `Error! ${error.message}`;
                    }
                    let teamsArray: JSX.Element[] = [];

                    let teams = data.fetchCompanyTeams.filter(e =>
                      e.name.toUpperCase().includes(this.state.search.toUpperCase())
                    );

                    teams.sort(function(a, b) {
                      let nameA = a.name.toUpperCase(); // ignore upper and lowercase
                      let nameB = b.name.toUpperCase(); // ignore upper and lowercase
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
                    teams.forEach(team => {
                      const available = !(
                        this.props.teams.find(a => a.departmentid.unitid.id == team.unitid.id) ||
                        this.state.teams.find(a => a.unitid.id == team.unitid.id)
                      );
                      teamsArray.push(
                        <div
                          key={team.name}
                          className="space"
                          draggable={available}
                          onDragStart={() => this.setState({ drag: team })}
                          onClick={() =>
                            available &&
                            this.setState(() => {
                              return {
                                popup: true,
                                integrateTeam: Object.assign({}, { integrating: true, ...team })
                              };
                            })
                          }>
                          <div
                            className="image"
                            style={
                              team.profilepicture
                                ? {
                                    backgroundImage:
                                      team.profilepicture.indexOf("/") != -1
                                        ? `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                            team.profilepicture
                                          )})`
                                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                            team.profilepicture
                                          )})`,
                                    backgroundColor: "unset"
                                  }
                                : team.internaldata && team.internaldata.color
                                ? { backgroundColor: team.internaldata.color }
                                : {}
                            }>
                            {team.profilepicture
                              ? ""
                              : team.internaldata && team.internaldata.letters
                              ? team.internaldata.letters
                              : team.name.slice(0, 1)}
                          </div>
                          <div className="name">{team.name}</div>

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
                      <div className="addgrid-holder">
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
                          {teamsArray}
                        </div>
                      </div>
                    );
                  }}
                </Query>
              </div>
              <UniversalButton
                label={this.props.continue ? "Back" : "Cancel"}
                type="low"
                closingPopup={true}
              />

              <UniversalButton
                label={this.props.continue ? "Continue" : "Save"}
                type="high"
                onClick={() => {
                  if (this.props.continue) {
                    this.props.continue(this.state.teams);
                  } else {
                    this.setState({ saving: true });
                  }
                }}
              />

              {this.state.saving && (
                <PopupSelfSaving
                  savedmessage="The Service has been successfully added"
                  savingmessage="The Service is currently added"
                  closeFunction={() => {
                    this.setState({ saving: false });
                    this.props.close();
                  }}
                  saveFunction={() => {
                    this.state.teams.forEach(team => {
                      let appdata: {
                        id: string;
                        setup: JSON;
                        setupfinished: Boolean;
                      }[] = [];
                      team.employees.forEach(employee => {
                        appdata.push({
                          id: employee.id,
                          setup: employee.setup,
                          setupfinished: employee.setupfinished
                        });
                      });
                      addAppToTeam({
                        variables: {
                          serviceid: this.props.service.id,
                          teamid: team.unitid.id,
                          employees: appdata
                        },
                        refetchQueries: [
                          {
                            query: fetchCompanyService,
                            variables: { serviceid: this.props.service.id }
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
                      integrateTeam: null,
                      popup: false,
                      counter: 0,
                      configureTeamLicences: true
                    });
                  }}>
                  <div>
                    <h1 className="cleanup lightHeading">
                      Add {this.state.integrateTeam!.name} to service {this.props.service.name}
                    </h1>
                  </div>

                  {this.printEmployeeAddSteps()}
                </PopupBase>
              )}
            </PopupBase>
            {this.state.configureTeamLicences &&
              this.state.integrateTeam &&
              this.state.integrateTeam!.employees.length > 0 && (
                <PopupAddLicence
                  nooutsideclose={true}
                  app={this.props.service}
                  cancel={async () => {
                    await this.setState(prevState => {
                      let newcounter = prevState.counter + 1;
                      let currentemployee = Object.assign(
                        {},
                        prevState.integrateTeam.employees[prevState.counter]
                      );
                      currentemployee.setupfinished = false;
                      currentemployee.setup = {};
                      currentemployee = {
                        ...prevState.integrateTeam.employees[prevState.counter],
                        ...currentemployee
                      };
                      const newintegrateApp = Object.assign({}, this.props.service);
                      let newintegrateApp2 = newintegrateApp;
                      newintegrateApp2.employees = [];
                      newintegrateApp2.employees.push(currentemployee);
                      if (newcounter < prevState.integrateTeam!.employees.length) {
                        return {
                          ...prevState,
                          counter: newcounter,
                          integrateApp: newintegrateApp2
                        };
                      } else {
                        return {
                          ...prevState,
                          configureTeamLicences: false,
                          integrateApp: newintegrateApp2
                        };
                      }
                    });
                  }}
                  add={async setup => {
                    await this.setState(prevState => {
                      let newcounter = prevState.counter + 1;
                      let integrateTeam = Object.assign({}, prevState.integrateTeam);
                      integrateTeam.employees[prevState.counter].setupfinished = true;
                      integrateTeam.employees[prevState.counter].setup = setup;
                      if (newcounter < integrateTeam.employees.length) {
                        return {
                          ...prevState,
                          counter: newcounter,
                          integrateTeam
                        };
                      } else {
                        return {
                          ...prevState,
                          configureTeamLicences: false,
                          integrateTeam
                        };
                      }
                    });
                  }}
                  employeename={`${
                    this.state.integrateTeam.employees[this.state.counter].firstname
                  } ${this.state.integrateTeam.employees[this.state.counter].lastname}`}
                />
              )}
          </>
        )}
      </Mutation>
    );
  }
}
export default AddTeam;
