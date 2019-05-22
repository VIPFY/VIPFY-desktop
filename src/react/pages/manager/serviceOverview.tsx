import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchCompanyTeams } from "../../queries/departments";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import AddTeamGeneralData from "../../components/manager/addTeamGeneralData";
import AddTeamEmployeeData from "../../components/manager/addTeamEmployeeData";
import AddTeamServices from "../../components/manager/addTeamServices";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import { fetchCompanyServices } from "../../queries/products";

interface Props {
  moveTo: Function;
}

interface State {
  search: string;
  add: Boolean;
  addStage: number;
  addteam: Object;
  apps: { id: number; name: number; icon: string; needssubdomain: Boolean; options: Object }[];
  addemployees: any[];
  saving: Boolean;
  deleting: number | null;
  willdeleting: number | null;
  keepLicences: { service: number; employee: number }[];
}

const CREATE_TEAM = gql`
  mutation createTeam($teamdata: JSON!, $addemployees: [JSON]!, $apps: [JSON]!) {
    createTeam(teamdata: $teamdata, addemployees: $addemployees, apps: $apps)
  }
`;

const DELETE_TEAM = gql`
  mutation deleteTeam($teamid: ID!, $keepLicences: [JSON!]) {
    deleteTeam(teamid: $teamid, keepLicences: $keepLicences)
  }
`;

class ServiceOverview extends React.Component<Props, State> {
  state = {
    search: "",
    add: false,
    addteam: {},
    addStage: 1,
    apps: [],
    addemployees: [],
    saving: false,
    deleting: null,
    willdeleting: null,
    keepLicences: []
  };

  printRemoveLicences(team) {
    let RLicencesArray: JSX.Element[] = [];

    team.services.forEach((service, int) => {
      team.employees.forEach((employee, int2) => {
        RLicencesArray.push(
          <li key={`${int}-${int2}`}>
            <UniversalCheckbox
              name={`${int}-${int2}`}
              startingvalue={true}
              liveValue={v =>
                v
                  ? this.setState(prevState => {
                      const keepLicencesNew = prevState.keepLicences.splice(
                        prevState.keepLicences.findIndex(
                          l => l.service == service.id && l.employee == employee.id
                        ),
                        1
                      );
                      return {
                        keepLicences: keepLicencesNew
                      };
                    })
                  : this.setState(prevState => {
                      const keepLicencesNew = prevState.keepLicences;
                      keepLicencesNew.push({ service: service.id, employee: employee.id });
                      return {
                        keepLicences: keepLicencesNew
                      };
                    })
              }>
              <span>
                Delete {service.planid.appid.name}-licence of {employee.firstname}{" "}
                {employee.lastname}
              </span>
            </UniversalCheckbox>
          </li>
        );
      });
    });
    return RLicencesArray != [] ? <ul style={{ marginTop: "20px" }}>{RLicencesArray}</ul> : "";
  }

  addService(apps) {
    console.log(apps);
    this.setState({ apps, saving: true, add: false });
  }

  renderTeams(teams) {
    let teamsArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < teams.length; counter++) {
      const team: {
        profilepicture: string;
        internaldata: { letters: string; color: string };
        name: string;
      } = teams[counter];
      if (teams.length > 6 && counter > 4) {
        teamsArray.push(
          <div
            key="moreTeams"
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{teams.length - 5}
          </div>
        );
        break;
      } else {
        teamsArray.push(
          <div
            key={team.name}
            title={team.name}
            className="managerSquare"
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
        );
      }
    }
    return teamsArray;
  }

  renderEmployees(employees) {
    console.log(employees);
    let employeesArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < employees.length; counter++) {
      const employee: {
        profilepicture: string;
        firstname: string;
        lastname: string;
      } = employees[counter];
      if (employees.length > 6 && counter > 4) {
        employeesArray.push(
          <div
            key="moreEmployees"
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{employees.length - 5}
          </div>
        );
        break;
      } else {
        employeesArray.push(
          <div
            key={`Employee-${counter}`}
            className="managerSquare"
            style={
              employee.profilepicture
                ? employee.profilepicture.indexOf("/") != -1
                  ? {
                      backgroundImage: encodeURI(
                        `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                          employee.profilepicture
                        )})`
                      )
                    }
                  : {
                      backgroundImage: encodeURI(
                        `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                          employee.profilepicture
                        })`
                      )
                    }
                : {}
            }>
            {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
          </div>
        );
      }
    }
    return employeesArray;
  }

  addProcess() {
    switch (this.state.addStage) {
      case 1:
        return (
          <AddTeamGeneralData
            continue={data => this.setState({ addteam: data, addStage: 2 })}
            close={() => this.setState({ add: false })}
            addteam={this.state.addteam}
          />
        );
      case 2:
        return (
          <AddTeamEmployeeData
            continue={data => {
              this.setState({ addemployees: data, addStage: 3 });
            }}
            close={() => this.setState({ addStage: 1 })}
            teamname={this.state.addteam.name}
            employees={this.state.addemployees}
          />
        );
      case 3:
        return (
          <AddTeamServices
            continue={apps => this.addService(apps)}
            close={() => this.setState({ addStage: 2 })}
            employees={this.state.addemployees}
            apps={this.state.apps}
            teamname={this.state.addteam.name}
          />
        );
      default:
        return <div />;
    }
  }
  render() {
    return (
      <div className="managerPage">
        <div className="heading">
          <h1>Service Manager</h1>
          <UniversalSearchBox
            getValue={v => {
              this.setState({ search: v });
            }}
          />
        </div>
        <div className="section">
          <div className="heading">
            <h1>Services</h1>
          </div>
          <Query query={fetchCompanyServices}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }

              //Sort teams
              let services: any[] = [];
              let interservices: any[] = [];
              if (data.fetchCompanyServices) {
                interservices = data.fetchCompanyServices;
                console.log("Interservices", interservices, data);
                interservices.sort(function(a, b) {
                  let nameA = a.app.name.toUpperCase();
                  let nameB = b.app.name.toUpperCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  // namen müssen gleich sein
                  return 0;
                });
                if (this.state.search != "") {
                  services = interservices.filter(service => {
                    return service.app.name.toUpperCase().includes(this.state.search.toUpperCase());
                  });
                } else {
                  services = interservices;
                }
                console.log("SERVICES", services);
              }
              return (
                <div className="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      <div className="tableColumnBig">
                        <h1>Name</h1>
                      </div>
                      <div className="tableColumnBig">
                        <h1>Teams</h1>
                      </div>
                      <div className="tableColumnBig">
                        <h1>Single Users</h1>
                      </div>
                    </div>
                    <div className="tableEnd">
                      <UniversalButton
                        type="high"
                        label="Add Service"
                        customStyles={{
                          fontSize: "12px",
                          lineHeight: "24px",
                          fontWeight: "700",
                          marginRight: "16px",
                          width: "92px"
                        }}
                        onClick={() =>
                          this.setState({
                            add: true,
                            addStage: 1,
                            addemployees: [],
                            addteam: {},
                            apps: []
                          })
                        }
                      />
                    </div>
                  </div>
                  {services.length > 0 &&
                    services.map(service => (
                      <div key={service.name} className="tableRow">
                        {console.log("Service", service)}
                        <div className="tableMain">
                          <div className="tableColumnBig">
                            <div
                              title={service.app.name}
                              className="managerSquare"
                              style={{
                                backgroundImage:
                                  service.app.icon.indexOf("/") != -1
                                    ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                                        service.app.icon
                                      )})`
                                    : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                        service.app.icon
                                      )})`,
                                backgroundColor: "unset"
                              }}
                            />
                            <span className="name">{service.app.name}</span>
                          </div>
                          <div className="tableColumnBig">
                            {service.teams ? this.renderTeams(service.teams) : "No single User"}
                          </div>
                          <div className="tableColumnBig">
                            {service.singles
                              ? this.renderEmployees(service.singles)
                              : "No single User"}
                          </div>
                        </div>
                        <div className="tableEnd">
                          <div className="editOptions">
                            <i
                              className="fal fa-external-link-alt"
                              onClick={() => this.props.moveTo(`lmanager/${service.app.id}`)}
                            />
                            <i
                              className="fal fa-trash-alt"
                              onClick={() => this.setState({ willdeleting: service })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              );
            }}
          </Query>
        </div>
        {this.state.add && (
          <PopupBase
            fullmiddle={true}
            customStyles={{ maxWidth: "1152px" }}
            close={() => this.setState({ add: false })}>
            {this.addProcess()}
          </PopupBase>
        )}
        {this.state.saving && (
          <Mutation mutation={CREATE_TEAM}>
            {createTeam => (
              <PopupSelfSaving
                savingmessage="Adding new team"
                savedmessage="New team succesfully added"
                saveFunction={async () => {
                  console.log("SAVING", this.state);
                  await createTeam({
                    variables: {
                      teamdata: this.state.addteam,
                      addemployees: this.state.addemployees,
                      apps: this.state.apps
                    },
                    refetchQueries: [{ query: fetchCompanyTeams }]
                  });
                }}
                closeFunction={() =>
                  this.setState({
                    saving: false,
                    addemployees: [],
                    apps: [],
                    addteam: {},
                    addStage: 1
                  })
                }
              />
            )}
          </Mutation>
        )}
        {this.state.willdeleting && (
          <PopupBase
            fullmiddle={true}
            dialog={true}
            close={() => this.setState({ willdeleting: null })}
            closeable={false}>
            <p>Do you really want to delete the team?</p>
            {this.printRemoveLicences(this.state.willdeleting)}
            <UniversalButton type="low" closingPopup={true} label="Cancel" />
            <UniversalButton
              type="low"
              label="Delete"
              onClick={() => {
                console.log("THISSTATE", this.state);
                this.setState(prevState => {
                  return {
                    willdeleting: null,
                    deleting: prevState.willdeleting!.unitid.id
                  };
                });
              }}
            />
          </PopupBase>
        )}
        {this.state.deleting && (
          <Mutation mutation={DELETE_TEAM}>
            {deleteTeam => (
              <PopupSelfSaving
                savingmessage="Deleting team"
                savedmessage="Team succesfully deleted"
                saveFunction={async () =>
                  await deleteTeam({
                    variables: {
                      teamid: this.state.deleting,
                      keepLicences: this.state.keepLicences
                    },
                    refetchQueries: [{ query: fetchCompanyTeams }]
                  })
                }
                closeFunction={() =>
                  this.setState({
                    deleting: null,
                    keepLicences: []
                  })
                }
              />
            )}
          </Mutation>
        )}
      </div>
    );
  }
}
export default ServiceOverview;
