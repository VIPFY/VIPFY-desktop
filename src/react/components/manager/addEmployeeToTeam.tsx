import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchCompanyTeams, fetchTeams, fetchUsersOwnLicences } from "../../queries/departments";
import moment = require("moment");
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../universalSearchBox";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupAddLicence from "../../popups/universalPopups/addLicence";

interface Props {
  employeeid: number;
  employeename: string;
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
  addedTeams: Object[];
  counter: number;
  configureTeamLicences: Boolean;
}

const ADD_TO_TEAM = gql`
  mutation addToTeam($userid: ID!, $teamid: ID!, $services: [SetupService]!) {
    addToTeam(userid: $userid, teamid: $teamid, services: $services)
  }
`;

class AddEmployeeToTeam extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateTeam: null,
    dragdelete: null,
    addedTeams: [],
    counter: 0,
    configureTeamLicences: true
  };

  printMyTeams(teamsdata) {
    let teamsArray: JSX.Element[] = [];
    const teams = teamsdata.concat(this.state.addedTeams);
    console.log("My Teams", teams, this.state);
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
        const oldteam = teamsdata.find(t => t.unitid.id == team.unitid.id);
        teamsArray.push(
          <div
            className="space"
            draggable={oldteam}
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
                          ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
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
            {oldteam ? (
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
    if (this.state.integrateTeam) {
      const team: {
        profilepicture: string;
        internaldata: { color: string; letters: string };
        name: string;
        integrating: Boolean;
      } = this.state.integrateTeam!;
      teamsArray.push(
        <div className="space">
          <div
            className="image"
            style={
              team.profilepicture
                ? {
                    backgroundImage:
                      team.profilepicture.indexOf("/") != -1
                        ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
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
    }
    return teamsArray;
  }

  printTeamAddSteps() {
    console.log("printTeamAddSteps", this.state.integrateTeam.services);
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
            onClick={() =>
              this.setState(prevState => {
                console.log("PREVSTATE", prevState);
                let oldteams = prevState.addedTeams;
                oldteams.push(prevState.integrateTeam);
                return {
                  drag: null,
                  addedTeams: oldteams,
                  integrateTeam: null,
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
          {this.state.configureTeamLicences ? (
            <PopupAddLicence
              nooutsideclose={true}
              app={this.state.integrateTeam.services[this.state.counter].planid.appid}
              cancel={() =>
                this.setState(prevState => {
                  let newcounter = prevState.counter + 1;
                  let currentlicence = Object.assign(
                    {},
                    prevState.integrateTeam.services[prevState.counter]
                  );
                  currentlicence.setupfinished = false;
                  const newintegrateTeam = Object.assign({}, prevState.integrateTeam);
                  let newintegrateTeam2 = newintegrateTeam;
                  newintegrateTeam2.services = newintegrateTeam2.services.map(a =>
                    a.id == currentlicence.id ? currentlicence : a
                  );
                  if (newcounter < prevState.integrateTeam.services.length) {
                    return { counter: newcounter, integrateTeam: newintegrateTeam2 };
                  } else {
                    return { configureTeamLicences: false, integrateTeam: newintegrateTeam2 };
                  }
                })
              }
              add={setup =>
                this.setState(prevState => {
                  let newcounter = prevState.counter + 1;
                  let currentlicence = Object.assign(
                    {},
                    prevState.integrateTeam.services[prevState.counter]
                  );
                  currentlicence.setupfinished = true;
                  currentlicence.setup = setup;
                  const newintegrateTeam = Object.assign({}, prevState.integrateTeam);
                  let newintegrateTeam2 = newintegrateTeam;
                  newintegrateTeam2.services = newintegrateTeam2.services.map(a =>
                    a.id == currentlicence.id ? currentlicence : a
                  );
                  console.log("AFTER", newintegrateTeam2, currentlicence);
                  if (newcounter < prevState.integrateTeam.services.length) {
                    return { counter: newcounter, integrateTeam: newintegrateTeam2 };
                  } else {
                    return { configureTeamLicences: false, integrateTeam: newintegrateTeam2 };
                  }
                })
              }
              employeename={this.props.employeename}
            />
          ) : (
            ""
          )}
          <ul className="checks">
            {this.state.integrateTeam!.services.map(service => {
              return (
                <li>
                  Individual Teamlicence for <b>{service.planid.appid.name}</b>
                  {service.setupfinished ? " successfully configurated" : " not configured"}
                </li>
              );
            })}
            {this.state.integrateTeam!.licences.map(licence => {
              return (
                <li>
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
              onClick={() =>
                this.setState(prevState => {
                  console.log("PREVSTATE", prevState);
                  let oldteams = prevState.addedTeams;
                  oldteams.push(prevState.integrateTeam);
                  return {
                    drag: null,
                    addedTeams: oldteams,
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
    const employeeid = this.props.employeeid;
    console.log("Add teams");
    return (
      <Query query={fetchTeams} variables={{ userid: employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          const employeeTeams = data.fetchTeams;
          return (
            <Mutation
              mutation={ADD_TO_TEAM}
              refetchQueries={[
                { query: fetchUsersOwnLicences, variables: { unitid: this.props.employeeid } },
                { query: fetchTeams, variables: { userid: this.props.employeeid } },
                { query: fetchCompanyTeams }
              ]}>
              {addToTeam => (
                <PopupBase
                  nooutsideclose={true}
                  fullmiddle={true}
                  customStyles={{ maxWidth: "1152px" }}
                  close={() => this.props.close()}>
                  <span className="mutiplieHeading">
                    <span className="mHeading">Add Teams </span>
                  </span>
                  <span className="secondHolder">Available Teams</span>
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
                              integrateTeam: Object.assign(
                                {},
                                { integrating: true, ...prevState.drag }
                              )
                            };
                          });
                        }
                      }}
                      onDragOver={e => {
                        e.preventDefault();
                      }}>
                      <div className="addgrid">{this.printMyTeams(data.fetchTeams)}</div>
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
                        console.log("Avaible Teams", teams);
                        //ausgrauen von Teams, in denen er schon drin ist  employeeTeams
                        teams.forEach(team => {
                          const available = !(
                            employeeTeams.find(a => a.unitid.id == team.unitid.id) ||
                            this.state.addedTeams.find(a => a.unitid.id == team.unitid.id)
                          );
                          console.log("Avaiable", team.name, available);
                          teamsArray.push(
                            <div
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
                                            ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
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
                              <div
                                className="space"
                                draggable
                                onDragStart={() => this.setState({ drag: { new: true } })}>
                                <div
                                  className="image"
                                  style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                                  <i className="fal fa-plus" />
                                </div>
                                <div className="name">Add Teams</div>
                              </div>
                              {teamsArray}
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
                    closingPopup={true}
                    onClick={async () => {
                      console.log("SAVE", this.state.addedTeams);
                      try {
                        this.state.addedTeams.forEach(async team => {
                          console.log("TEAM", team);
                          let servicesdata: {
                            id: string;
                            setup: JSON;
                            setupfinished: Boolean;
                          }[] = [];
                          team.services.forEach(service => {
                            servicesdata.push({
                              id: service.id,
                              setup: service.setup,
                              setupfinished: service.setupfinished
                            });
                          });
                          await addToTeam({
                            variables: {
                              userid: this.props.employeeid,
                              teamid: team.unitid.id,
                              services: servicesdata
                            }
                          });
                        });
                        //this.setState({ updated: true, networkedit: false });
                      } catch (err) {
                        //this.setState({ networkedit: false });
                        console.log("err");
                        throw err;
                      }
                      console.log("SAVE", this.state.addedTeams);
                    }}
                  />

                  {this.state.popup ? (
                    <PopupBase
                      buttonStyles={{ marginTop: "0px" }}
                      fullmiddle={true}
                      small={true}
                      close={() => {
                        this.setState({
                          drag: null,
                          integrateTeam: null,
                          popup: false
                        });
                      }}>
                      <div>
                        <h1 className="cleanup lightHeading">
                          Add {this.props.employeename} to team {this.state.integrateTeam.name}
                        </h1>
                      </div>

                      {this.printTeamAddSteps()}
                    </PopupBase>
                  ) : (
                    ""
                  )}
                </PopupBase>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}
export default AddEmployeeToTeam;
