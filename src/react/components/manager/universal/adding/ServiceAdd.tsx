import * as React from "react";
import { Query } from "react-apollo";
import { fetchCompanyTeams } from "../../../../queries/departments";
import PrintTeamSquare from "../squares/printTeamSquare";
import { fetchApps } from "../../../../queries/products";
import PrintServiceSquare from "../squares/printServiceSquare";

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
  saving: any[];
}

class ServiceAdd extends React.Component<Props, State> {
  state = {
    newTeamPopup: false,
    popup: false,
    drag: null,
    integrateTeam: null,
    dragdelete: null,
    addedTeams: [],
    saving: []
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
              if (this.state.drag!.new) {
                this.setBothStates({
                  drag: null,
                  newAppPopup: true
                });
              }
              this.setBothStates(prevState => {
                return {
                  popup: true,
                  drag: {},
                  integrateApp: Object.assign({}, { integrating: true, ...prevState.drag })
                };
              });
            }
          }}
          onDragOver={e => {
            e.preventDefault();
          }}>
          <div className="addgrid">{this.printApps(this.props.apps)}</div>
        </div>
        <Query pollInterval={60 * 10 * 1000 + 600} query={fetchApps}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }
            let appsArray: JSX.Element[] = [];

            let apps = data.allApps.filter(e =>
              e.name.toUpperCase().includes(this.props.search.toUpperCase())
            );

            apps.sort(function(a, b) {
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

            apps.forEach(app => {
              appsArray.push(
                <div
                  key={app.name}
                  className="space"
                  draggable
                  onClick={() =>
                    this.setBothStates(prevState => {
                      return {
                        popup: true,
                        integrateApp: Object.assign({}, { integrating: true, app })
                      };
                    })
                  }
                  onDragStart={() => this.setBothStates({ drag: app })}>
                  <PrintServiceSquare service={app} appidFunction={s => s} className="image" />
                  <div className="name">{app.name}</div>
                  <div className="imageHover">
                    <i className="fal fa-plus" />
                    <span>Click or drag to add</span>
                  </div>
                </div>
              );
            });
            return (
              <div
                className="addgrid-holder"
                onDrop={e => {
                  e.preventDefault();
                  if (this.state.dragremove) {
                    this.setBothStates(prevState => {
                      const remainingapps = prevState.apps.filter(
                        e =>
                          e.id != this.state.dragremove.id ||
                          e.email != this.state.dragremove.email ||
                          e.password != this.state.dragremove.password
                      );
                      return { apps: remainingapps };
                    });
                  }
                }}
                onDragOver={e => {
                  e.preventDefault();
                }}>
                <div className="addgrid">
                  <div
                    className="space"
                    draggable
                    onDragStart={() => this.setBothStates({ drag: { new: true } })}>
                    <div className="image" style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
                      <i className="fal fa-plus" />
                    </div>
                    <div className="name">Add Service</div>
                  </div>
                  {appsArray}
                </div>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}
export default ServiceAdd;
