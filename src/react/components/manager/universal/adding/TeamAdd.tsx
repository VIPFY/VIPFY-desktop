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

  render() {
    return (
      <div className="maingridAddEmployeeTeams">
        <div
          className="addgrid-holder"
          onDrop={e => {
            e.preventDefault();
            if (this.state.drag) {
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
            //ausgrauen von Teams, in denen er schon drin ist  employeeTeams
            teams.forEach(team => {
              const available = !(
                employeeTeams.find(a => a.unitid.id == team.unitid.id) ||
                this.state.addedTeams.find(a => a.unitid.id == team.unitid.id)
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
    );
  }
}
export default EmployeeAdd;
