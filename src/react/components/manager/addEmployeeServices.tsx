import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalSearchBox from "../universalSearchBox";
import { Query } from "react-apollo";
import { fetchApps } from "../../queries/products";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import PopupAddLicence from "../../popups/universalPopups/addLicence";

interface Props {
  close: Function;
  continue: Function;
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
}

class AddEmployeeServices extends React.Component<Props, State> {
  state = {
    search: "",
    drag: null,
    dragremove: null,
    integrateApp: {},
    popup: false,
    email: "",
    password: "",
    subdomain: "",
    confirm: false,
    integrating: true,
    integrated: false,
    apps: this.props.apps || []
  };

  printApps() {
    let ownAppsArray: JSX.Element[] = [];
    this.state.apps.forEach(app => {
      ownAppsArray.push(
        <div
          draggable
          className="space"
          onClick={() =>
            this.setState(prevState => {
              const remainingapps = prevState.apps.filter(
                e => e.id != app.id || e.email != app.email || e.password != app.password
              );
              return { apps: remainingapps };
            })
          }
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
          {app.error ? (
            <div className="imageError">
              <i className="fal fa-exclamation-circle" />
              <span>Press to configure Licence</span>
            </div>
          ) : (
            ""
          )}
          {app.integrating ? (
            <div className="imageCog">
              <i className="fal fa-cog fa-spin" />
              <span>Editing this licence</span>
            </div>
          ) : (
            ""
          )}
          <div className="name">{app.name}</div>
          <div className="imageHover">
            <i className="fal fa-trash-alt" />
            <span>Click to remove</span>
          </div>
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
    console.log("STATE", this.state);
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
                console.log("DROP", this.state.drag);
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
            <div className="addgrid">{this.printApps()}</div>
          </div>
          <Query query={fetchApps}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }
              console.log("Apps", data.allApps);
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
            onClick={() => this.props.continue(this.state.apps)}
          />
        </div>

        {this.state.popup ? (
          <PopupAddLicence
            employeename={this.props.addusername}
            app={this.state.integrateApp}
            cancel={() =>
              this.setState(prevState => {
                const newapps = prevState.apps;
                newapps.pop();
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
