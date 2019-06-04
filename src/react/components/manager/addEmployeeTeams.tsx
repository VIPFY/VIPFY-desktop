import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalSearchBox from "../universalSearchBox";
import { Query } from "react-apollo";
import { fetchCompanyTeams } from "../../queries/departments";
import PopupAddLicence from "../../popups/universalPopups/addLicence";
import PopupBase from "../../popups/universalPopups/popupBase";

interface Props {
  close: Function;
  continue: Function;
  employeename: string;
  teams: any[];
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
  saved: Boolean;
  error: string | null;
  saving: Boolean;
}

class AddEmployeeTeams extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateTeam: null,
    dragdelete: null,
    addedTeams: this.props.teams || [],
    counter: 0,
    configureTeamLicences: true,
    saved: false,
    error: null,
    saving: false
  };

  printMyTeams(teams) {
    let teamsArray: JSX.Element[] = [];

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
            draggable={true}
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
                          : `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_pictures/${encodeURI(
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
                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_pictures/${encodeURI(
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
            onClick={() =>
              this.setState(prevState => {
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
              onClick={() =>
                this.setState(prevState => {
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
    return (
      <React.Fragment>
        <span className="mutiplieHeading">
          <span className="bHeading">Add Employee </span>
          <span className="mHeading">
            > Personal Data > <span className="active">Teams</span> >{" "}
            <span className="inactive">Services</span>
          </span>
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
                    integrateTeam: Object.assign({}, { integrating: true, ...prevState.drag })
                  };
                });
              }
            }}
            onDragOver={e => {
              e.preventDefault();
            }}>
            <div className="addgrid">{this.printMyTeams(this.state.addedTeams)}</div>
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

              let teams = data.fetchCompanyTeams;

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
                const available = !this.state.addedTeams.find(a => a.unitid.id == team.unitid.id);
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
                                  : `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_pictures/${encodeURI(
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
                <div
                  className="addgrid-holder"
                  onDragOver={e => {
                    e.preventDefault();
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    if (this.state.dragdelete) {
                      this.setState(prevState => {
                        const remainingteams = prevState.addedTeams.filter(
                          e => e.unitid.id != this.state.dragdelete!.unitid.id
                        );
                        return { addedTeams: remainingteams };
                      });
                    }
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
                    {teamsArray}
                  </div>
                </div>
              );
            }}
          </Query>
        </div>
        <div className="buttonsPopup">
          <UniversalButton label="Back" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            onClick={() => this.props.continue(this.state.addedTeams)}
          />
        </div>
        {this.state.popup ? (
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
        ) : (
          ""
        )}
        {this.state.configureTeamLicences && this.state.integrateTeam && (
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
          />
        )}
      </React.Fragment>
    );
  }
}
export default AddEmployeeTeams;
