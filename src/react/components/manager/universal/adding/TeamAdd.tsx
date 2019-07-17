import * as React from "react";
import { Query } from "react-apollo";
import { fetchCompanyTeams } from "../../../../queries/departments";
import PrintTeamSquare from "../squares/printTeamSquare";

interface Props {
  search: string;
  teams: any[];
  onChange: Function;
}

interface State {
  drag: any;
  dragdelete: any;
}

class TeamAdd extends React.Component<Props, State> {
  state = {
    drag: null,
    dragdelete: null
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
            onClick={() => this.props.onChange({ action: "remove", content: team })}>
            <PrintTeamSquare team={team} className="image" />
            <div className="name">{team.name}</div>

            <div className="imageHover">
              <i className="fal fa-trash-alt" />
              <span>Click or drag to remove</span>
            </div>
            {team.saving && (
              <div className="imageCog">
                <i className="fal fa-cog fa-spin" />
                <span>Saving</span>
              </div>
            )}
            {team.integrating && (
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
    while ((teams.length + i) % 4 != 0 || teams.length + i < 12 || i == 0) {
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
            this.setState(prevState => {
              this.props.onChange({ action: "add", content: prevState.drag });
              return { drag: null };
            });
          }}
          onDragOver={e => {
            e.preventDefault();
          }}>
          <div className="addgrid">{this.printMyTeams(this.props.teams)}</div>
        </div>
        <Query pollInterval={60 * 10 * 1000 + 300} query={fetchCompanyTeams}>
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
              const available = !this.props.teams.find(a => a.unitid.id == team.unitid.id);
              teamsArray.push(
                <div
                  key={team.name}
                  className="space"
                  draggable={available}
                  onDragStart={() => this.setState({ drag: team })}
                  onClick={() =>
                    available && this.props.onChange({ action: "add", content: team })
                  }>
                  <PrintTeamSquare team={team} className="image" />
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
                onDrop={e => {
                  e.preventDefault();
                  this.setState(prevState => {
                    this.props.onChange({ action: "remove", content: prevState.dragdelete });
                    return {
                      dragdelete: null
                    };
                  });
                }}>
                <div className="addgrid">
                  <div
                    className="space"
                    draggable
                    onClick={() => this.props.onChange({ action: "add", content: { new: true } })}
                    onDragStart={() => this.setState({ drag: { new: true } })}>
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
