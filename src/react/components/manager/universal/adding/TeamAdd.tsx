import * as React from "react";
import { Query } from "react-apollo";
import { fetchCompanyTeams } from "../../../../queries/departments";
import PrintTeamSquare from "../squares/printTeamSquare";

interface Props {
  search: string;
  teams: any[];
  setOuterState: Function;
  addedTeams: any[];
  integrateTeam: any;
}

interface State {
  drag: any;
  newTeamPopup: Boolean;
  popup: Boolean;
  integrateTeam: any;
  addedTeams: any[];
  dragdelete: any;
}

class TeamAdd extends React.Component<Props, State> {
  state = {
    newTeamPopup: false,
    popup: false,
    drag: null,
    integrateTeam: null,
    dragdelete: null,
    addedTeams: []
  };

  setBothStates = s => {
    this.setState(s);
    this.props.setOuterState(s);
  };

  printMyTeams(teamsdata) {
    let teamsArray: JSX.Element[] = [];
    const teams = teamsdata.concat(this.props.addedTeams);
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
            key={team.name}
            className="space"
            draggable={oldteam}
            onDragStart={() => this.setBothStates({ dragdelete: team })}
            onClick={() =>
              this.setBothStates(prevState => {
                const remainingteams = prevState.addedTeams.filter(
                  e => e.unitid.id != team.unitid.id
                );
                return { addedTeams: remainingteams };
              })
            }>
            <PrintTeamSquare team={team} className="iamge" />
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
                          : `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepictures/${encodeURI(
                              team.profilepicture
                            )})`,
                      backgroundColor: "unset"
                    }
                  : team.internaldata && team.internaldata.color
                  ? { backgroundColor: team.internaldata.color }
                  : { backgroundColor: "#5D76FF" }
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
    let j = 0;
    if (this.props.integrateTeam) {
      const team: {
        profilepicture: string;
        internaldata: { color: string; letters: string };
        name: string;
        integrating: Boolean;
      } = this.props.integrateTeam!;
      teamsArray.push(
        <div className="space" key={team.name}>
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
                : { backgroundColor: "#5D76FF" }
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
          {team.integrating && (
            <div className="imageCog">
              <i className="fal fa-cog fa-spin" />
              <span>Editing this membership</span>
            </div>
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
                  newTeamPopup: true
                });
              }
              this.setBothStates(prevState => {
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
          <div className="addgrid">{this.printMyTeams(this.props.teams)}</div>
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
              e.name.toUpperCase().includes(this.props.search.toUpperCase())
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
                this.props.teams.find(a => a.unitid.id == team.unitid.id) ||
                this.props.addedTeams.find(a => a.unitid.id == team.unitid.id)
              );
              teamsArray.push(
                <div
                  key={team.name}
                  className="space"
                  draggable={available}
                  onDragStart={() => this.setBothStates({ drag: team })}
                  onClick={() =>
                    available &&
                    this.setBothStates(() => {
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
                                : `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepictures/${encodeURI(
                                    team.profilepicture
                                  )})`,
                            backgroundColor: "unset"
                          }
                        : team.internaldata && team.internaldata.color
                        ? { backgroundColor: team.internaldata.color }
                        : { backgroundColor: "#5D76FF" }
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
                    onClick={() => this.setBothStates({ newTeamPopup: true })}
                    onDragStart={() => this.setBothStates({ drag: { new: true } })}>
                    <div className="image" style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                      <i className="fal fa-plus" />
                    </div>
                    <div className="name">Create Team</div>
                  </div>
                  {teamsArray}
                </div>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}
export default TeamAdd;
