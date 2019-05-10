import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalSearchBox from "../universalSearchBox";
import { Query } from "react-apollo";
import { fetchApps } from "../../queries/products";
import PopupAddLicence from "../../popups/universalPopups/addLicence";

interface Props {
  close: Function;
  continue: Function;
  teams: any[];
  apps: any[];
  addusername: string;
}

interface State {
  search: string;
  drag: {
    id: number;
    name: number;
    icon: string;
    needssubdomain: Boolean;
    options: Object;
    integrating?: Boolean;
    error?: Boolean;
    email?: string;
    password?: string;
    subdomain?: string;
  } | null;
  dragremove: {
    id: number;
    name: number;
    icon: string;
    needssubdomain: Boolean;
    options: Object;
    integrating?: Boolean;
    error?: Boolean;
    email?: string;
    password?: string;
    subdomain?: string;
  } | null;
  integrateApp: {
    id: number;
    name: number;
    icon: string;
    needssubdomain: Boolean;
    options: Object;
    integrating?: Boolean;
    error?: Boolean;
    email?: string;
    password?: string;
    subdomain?: string;
  } | null;
  popup: Boolean;
  email: string;
  password: string;
  subdomain: string;
  confirm: Boolean;
  integrating: Boolean;
  integrated: Boolean;
  apps: {
    id: number;
    name: number;
    icon: string;
    needssubdomain: Boolean;
    options: Object;
    integrating?: Boolean;
    error?: Boolean;
    email?: string;
    password?: string;
    subdomain?: string;
  }[];
  teams: any[];
}

class AddEmployeeServices extends React.Component<Props, State> {
  state = {
    search: "",
    drag: null,
    dragremove: null,
    integrateApp: null,
    popup: false,
    email: "",
    password: "",
    subdomain: "",
    confirm: false,
    integrating: true,
    integrated: false,
    apps: this.props.apps || [],
    teams: this.props.teams || []
  };

  printApps(newapps) {
    let ownAppsArray: JSX.Element[] = [];
    let oldapps = [];
    this.state.teams.forEach(
      team =>
        team.services &&
        team.services.forEach(service =>
          oldapps.push({
            ...service.planid.appid,
            setupfinished: service.setupfinished,
            nosetup: !service.setupfinished,
            teamid: team.unitid.id,
            licenceid: service.id
          })
        )
    );
    const apps = oldapps.concat(newapps);
    apps.forEach(app => {
      ownAppsArray.push(
        <div
          key={app.name}
          draggable
          className="space"
          onClick={() => {
            if (app.setupfinished) {
              return;
            } else if (app.nosetup) {
              this.setState({
                popup: true,
                integrateApp: { updateting: true, ...app }
              });
            } else {
              this.setState(prevState => {
                const remainingapps = prevState.apps.filter(
                  e => e.id != app.id || e.email != app.email || e.password != app.password
                );
                return { apps: remainingapps };
              });
            }
          }}
          onDragStart={() => this.setState({ dragremove: app })}>
          <div
            className="image"
            style={{
              backgroundImage:
                app.icon.indexOf("/") != -1
                  ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                      app.icon
                    )})`
                  : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                      app.icon
                    )})`
            }}
          />
          {app.nosetup && (
            <div className="imageError" style={{ cursor: "pointer" }}>
              <i className="fal fa-exclamation-circle" />
              <span>Press to configure Licence</span>
            </div>
          )}
          {app.setupfinished && (
            <>
              <div className="greyed" />
              <div className="ribbon ribbon-top-right">
                <span>Team Configurated</span>
              </div>
            </>
          )}
          {app.integrating && (
            <div className="imageCog">
              <i className="fal fa-cog fa-spin" />
              <span>Editing this licence</span>
            </div>
          )}
          {!(app.setupfinished || app.nosetup) && (
            <>
              <div className="name">{app.name}</div>
              <div className="imageHover">
                <i className="fal fa-trash-alt" />
                <span>Click to remove</span>
              </div>
            </>
          )}
        </div>
      );
    });
    let i = 0;
    while ((this.state.apps.length + i) % 4 != 0 || this.state.apps.length + i < 12 || i == 0) {
      ownAppsArray.push(
        <div className="space">
          <div className="fakeimage" />
          <div className="fakename" />
        </div>
      );
      i++;
    }
    return ownAppsArray;
  }

  render() {
    return (
      <React.Fragment>
        <span className="mutiplieHeading">
          <span className="bHeading">Add Employee </span>
          <span className="mHeading">
            > Personal Data > Teams > <span className="active">Services</span>
          </span>
        </span>
        <span className="secondHolder">Available Services</span>
        <UniversalSearchBox
          placeholder="Search available services"
          getValue={v => this.setState({ search: v })}
        />
        <div className="maingridAddEmployeeTeams">
          <div
            className="addgrid-holder"
            onDrop={e => {
              e.preventDefault();
              if (this.state.drag && this.state.drag!.name) {
                this.setState(prevState => {
                  const newapps = prevState.apps;
                  newapps.push({ integrating: true, ...prevState.drag });
                  return {
                    popup: true,
                    drag: {},
                    integrateApp: prevState.drag,
                    apps: newapps
                  };
                });
              }
            }}
            onDragOver={e => {
              e.preventDefault();
            }}>
            <div className="addgrid">{this.printApps(this.state.apps)}</div>
          </div>
          <Query query={fetchApps}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }
              let appsArray: JSX.Element[] = [];

              let apps = data.allApps.filter(e =>
                e.name.toUpperCase().includes(this.state.search.toUpperCase())
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
                      this.setState(prevState => {
                        const newapps = prevState.apps;
                        newapps.push({ integrating: true, ...app });
                        return {
                          popup: true,
                          apps: newapps,
                          integrateApp: app
                        };
                      })
                    }
                    onDragStart={() => this.setState({ drag: app })}>
                    <div
                      className="image"
                      style={{
                        backgroundImage:
                          app.icon.indexOf("/") != -1
                            ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                                app.icon
                              )})`
                            : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                app.icon
                              )})`
                      }}
                    />
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
                      this.setState(prevState => {
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
                      onDragStart={() => this.setState({ drag: { new: true } })}>
                      <div
                        className="image"
                        style={{ backgroundColor: "#F5F5F5", color: "#20BAA9" }}>
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
        <div className="buttonsPopup">
          <UniversalButton label="Back" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            onClick={() => this.props.continue(this.state.apps, this.state.teams)}
          />
        </div>

        {this.state.popup ? (
          <PopupAddLicence
            employeename={this.props.addusername}
            app={this.state.integrateApp}
            cancel={() =>
              this.setState(prevState => {
                const newapps = prevState.apps;
                if (prevState.integrateApp && !prevState.integrateApp.updateting) {
                  newapps.pop();
                }
                return {
                  drag: null,
                  integrateApp: null,
                  apps: newapps,
                  popup: false
                };
              })
            }
            add={({ email, password, subdomain }) =>
              this.setState(prevState => {
                if (prevState.integrateApp && prevState.integrateApp.updateting) {
                  let teamupdate = prevState.teams;
                  const changeIndex = prevState.teams.findIndex(
                    t => t.unitid.id == prevState.integrateApp.teamid
                  );
                  const serviceIndex = prevState.teams[changeIndex].services.findIndex(
                    s => s.id == prevState.integrateApp.licenceid
                  );
                  teamupdate[changeIndex].services[serviceIndex].setup = {
                    email,
                    password,
                    subdomain
                  };
                  teamupdate[changeIndex].services[serviceIndex].setupfinished = true;
                  return {
                    drag: null,
                    integrateApp: null,
                    popup: false,
                    email: "",
                    password: "",
                    subdomain: "",
                    teams: teamupdate
                  };
                } else {
                  const newapps = prevState.apps;
                  const { integrating } = prevState.integrateApp;
                  newapps.pop();
                  newapps.push({
                    email,
                    password,
                    subdomain,
                    ...prevState.integrateApp
                  });
                  return {
                    drag: null,
                    integrateApp: null,
                    apps: newapps,
                    popup: false,
                    email: "",
                    password: "",
                    subdomain: ""
                  };
                }
              })
            }
          />
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}
export default AddEmployeeServices;
