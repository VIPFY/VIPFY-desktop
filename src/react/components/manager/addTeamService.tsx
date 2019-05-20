import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import {
  fetchCompanyTeams,
  fetchTeams,
  fetchUserLicences,
  fetchTeam
} from "../../queries/departments";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../universalSearchBox";
import PopupAddLicence from "../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import { fetchApps } from "../../queries/products";

interface Props {
  team: any;
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
  integrateApp: {
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
  apps: Object[];
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

class AddTeamService extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateApp: null,
    dragdelete: null,
    apps: [],
    counter: 0,
    configureTeamLicences: true,
    saved: false,
    error: null,
    saving: false
  };

  printTeamServices(servicedata) {
    let serviceArray: JSX.Element[] = [];
    const services = servicedata.concat(this.state.apps);
    console.log("SERVICES", services);
    if (services.length > 0) {
      services.sort(function(a, b) {
        let nameA = a.integrating ? a.name.toUpperCase() : a.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.integrating ? b.name.toUpperCase() : b.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });

      services.forEach(service => {
        const oldservice = false || servicedata.find(t => t.id == service.id);
        serviceArray.push(
          <div
            key={service.id}
            className="space"
            draggable={!service}
            onDragStart={() => this.setState({ dragdelete: service })}
            onClick={() =>
              this.setState(prevState => {
                const remainingservices = prevState.apps.filter(e => e.id != service.id);
                return { apps: remainingservices };
              })
            }>
            <div
              className="image"
              style={
                service.icon || service.planid.appid.icon
                  ? {
                      backgroundImage:
                        (service.icon && service.icon.indexOf("/") != -1) ||
                        (!service.icon && service.planid.appid.icon.indexOf("/") != -1)
                          ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                              service.icon || service.planid.appid.icon
                            )})`
                          : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                              service.icon || service.planid.appid.icon
                            )})`,
                      backgroundColor: "unset"
                    }
                  : {}
              }>
              {service.icon || service.planid.appid.icon
                ? ""
                : (service.name && service.name.slice(0, 1)) ||
                  service.planid.appid.name.slice(0, 1)}
              {service.options && service.options.nosetup && (
                <div className="licenceError">
                  <i className="fal fa-exclamation-circle" />
                </div>
              )}
            </div>
            <div className="name">{service.name || service.planid.appid.name}</div>
            {oldservice ? (
              <React.Fragment>
                <div className="greyed" />
                <div className="ribbon ribbon-top-right">
                  <span>Current Teamservice</span>
                </div>
              </React.Fragment>
            ) : (
              <div className="imageHover">
                <i className="fal fa-trash-alt" />
                <span>Click or drag to remove</span>
              </div>
            )}
            {/*employee.services && employee.services.some(s => !s.setupfinished) && (
              <div className="imageError" style={{ cursor: "pointer" }}>
                <i className="fal fa-exclamation-circle" />
                <span>Not all services configurated</span>
              </div>
            )*/}
          </div>
        );
      });
    }
    let j = 0;
    if (this.state.integrateApp) {
      const service: {
        icon: string;
        name: string;
        integrating: Boolean;
        id: number;
      } = this.state.integrateApp!;
      serviceArray.push(
        <div className="space" key={service.id}>
          <div
            className="image"
            style={
              service.icon
                ? {
                    backgroundImage:
                      service.icon.indexOf("/") != -1
                        ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                            service.icon
                          )})`
                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                            service.icon
                          )})`,
                    backgroundColor: "unset"
                  }
                : {}
            }>
            {service.icon ? "" : service.name.slice(0, 1)}
            {service.options && service.options.nosetup && (
              <div className="licenceError">
                <i className="fal fa-exclamation-circle" />
              </div>
            )}
          </div>
          <div className="name">{service.name}</div>
          <div className="imageHover">
            <i className="fal fa-trash-alt" />
            <span>Click or drag to remove</span>
          </div>
          {service.integrating ? (
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
    while ((services.length + j + i) % 4 != 0 || services.length + j + i < 12 || i == 0) {
      serviceArray.push(
        <div className="space" key={`fake-${i}`}>
          <div className="fakeimage" />
          <div className="fakename" />
        </div>
      );
      i++;
    }
    return serviceArray;
  }

  printEmployeeAddSteps() {
    if (this.props.team.services.length == 0) {
      return (
        <div className="buttonsPopup">
          <UniversalButton
            type="low"
            onClick={() =>
              this.setState({
                drag: null,
                integrateApp: null,
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
                let oldservices = prevState.apps;
                oldservices.push(prevState.integrateApp);
                return {
                  drag: null,
                  apps: oldservices,
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
            {this.state.integrateApp!.employees.map(employee => {
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
                  integrateApp: null,
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
                  let oldapps = prevState.apps;
                  oldapps.push(prevState.integrateApp);
                  return {
                    drag: null,
                    apps: oldapps,
                    integrateApp: null,
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
    console.log("STATE", this.state);
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
                <span className="mHeading">Add Services </span>
              </span>
              <span className="secondHolder">Available Services</span>
              <UniversalSearchBox
                placeholder="Search available Services"
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
                          integrateApp: Object.assign(
                            {},
                            { integrating: true, employees: [], ...prevState.drag }
                          )
                        };
                      });
                    }
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                  }}>
                  <div className="addgrid">{this.printTeamServices(this.props.team.services)}</div>
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
                      const oldservice =
                        this.props.team.services.find(s => s.planid.appid.id == app.id) ||
                        this.state.apps.find(s => s.id == app.id);

                      appsArray.push(
                        <div
                          key={app.name}
                          className="space"
                          draggable={!oldservice}
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
                          {oldservice ? (
                            <React.Fragment>
                              <div className="greyed" />
                              <div className="ribbon ribbon-top-right">
                                <span>Teamservice</span>
                              </div>
                            </React.Fragment>
                          ) : (
                            <div className="imageHover">
                              <i className="fal fa-plus" />
                              <span>Click or drag to add</span>
                            </div>
                          )}
                        </div>
                      );
                    });
                    return (
                      <div
                        className="addgrid-holder"
                        onDrop={e => {
                          e.preventDefault();
                          if (this.state.dragdelete) {
                            this.setState(prevState => {
                              const remainingApps = prevState.apps.filter(
                                e => e.id != this.state.dragdelete!.id
                              );
                              return { apps: remainingApps };
                            });
                          }
                        }}
                        onDragOver={e => {
                          e.preventDefault();
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
                          {appsArray}
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
                onClick={() => {
                  this.setState({ saving: true });
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
                    this.state.apps.forEach(async service => {
                      let appdata: {
                        id: string;
                        setup: JSON;
                        setupfinished: Boolean;
                      }[] = [];
                      service.employees.forEach(employee => {
                        appdata.push({
                          id: employee.id,
                          setup: employee.setup,
                          setupfinished: employee.setupfinished
                        });
                      });
                      await addAppToTeam({
                        variables: {
                          serviceid: service.id,
                          teamid: this.props.team.unitid.id,
                          employees: appdata
                        },
                        refetchQueries: [
                          {
                            query: fetchTeam,
                            variables: { teamid: this.props.team.unitid.id }
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
                      integrateApp: null,
                      popup: false,
                      counter: 0,
                      configureTeamLicences: true
                    });
                  }}>
                  <div>
                    <h1 className="cleanup lightHeading">
                      Add {this.state.integrateApp!.name} to team {this.props.team.name}
                    </h1>
                  </div>

                  {this.printEmployeeAddSteps()}
                </PopupBase>
              )}
            </PopupBase>
            {this.state.configureTeamLicences && this.state.integrateApp && (
              <PopupAddLicence
                nooutsideclose={true}
                app={this.state.integrateApp!}
                cancel={async () => {
                  await this.setState(prevState => {
                    let newcounter = prevState.counter + 1;
                    let currentemployee = Object.assign(
                      {},
                      prevState.integrateApp!.employees[prevState.counter]
                    );
                    currentemployee.setupfinished = false;
                    currentemployee.setup = {};
                    currentemployee = {
                      ...this.props.team.employees[prevState.counter],
                      ...currentemployee
                    };
                    const newintegrateApp = Object.assign({}, prevState.integrateApp);
                    let newintegrateApp2 = newintegrateApp;
                    newintegrateApp2.employees = prevState.integrateApp!.employees;
                    newintegrateApp2.employees.push(currentemployee);
                    if (newcounter < prevState.integrateApp!.employees.length) {
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
                    let currentemployee = Object.assign(
                      {},
                      prevState.integrateApp!.employees[prevState.counter]
                    );
                    currentemployee.setupfinished = true;
                    currentemployee.setup = setup;
                    currentemployee = {
                      ...this.props.team.employees[prevState.counter],
                      ...currentemployee
                    };
                    const newintegrateApp = Object.assign({}, prevState.integrateApp);
                    let newintegrateApp2 = newintegrateApp;
                    newintegrateApp2.employees = prevState.integrateApp!.employees;
                    newintegrateApp2.employees.push(currentemployee);
                    if (newcounter < this.props.team!.employees.length) {
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
                employeename={`${this.props.team.employees[this.state.counter].firstname} ${
                  this.props.team.employees[this.state.counter].lastname
                }`}
              />
            )}
          </>
        )}
      </Mutation>
    );
  }
}
export default AddTeamService;
