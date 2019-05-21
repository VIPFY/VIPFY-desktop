import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchUsersOwnLicences, fetchCompanyTeams } from "../../queries/departments";
import { now } from "moment";
import AddEmployeePersonalData from "../../components/manager/addEmployeePersonalData";
import AddEmployeeTeams from "../../components/manager/addEmployeeTeams";
import PopupBase from "../../popups/universalPopups/popupBase";
import AddEmployeeServices from "../../components/manager/addEmployeeServices";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { randomPassword } from "../../common/passwordgen";
import AddTeamGeneralData from "../../components/manager/addTeamGeneralData";
import AddTeamEmployee from "../../components/manager/addTeamEmployee";
import AddTeamEmployeeData from "../../components/manager/addTeamEmployeeData";
import AddTeamServices from "../../components/manager/addTeamServices";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";

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
    createTeam(team: $teamdata, addemployees: $addemployees, apps: $apps)
  }
`;

const DELETE_TEAM = gql`
  mutation deleteTeam($teamid: ID!, $keepLicences: [JSON!]) {
    deleteTeam(teamid: $teamid, keepLicences: $keepLicences)
  }
`;

class TeamOverview extends React.Component<Props, State> {
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

  renderSerives(services) {
    let sortedservices: any[] = [];
    services.forEach(element => {
      if (!element.disabled && !element.planid.appid.disabled) {
        sortedservices.push(element);
      }
    });
    let serviceArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < sortedservices.length; counter++) {
      const service = sortedservices[counter];
      if (sortedservices.length > 6 && counter > 4) {
        serviceArray.push(
          <div
            key="moreSerivces"
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{sortedservices.length - 5}
          </div>
        );
        break;
      } else {
        serviceArray.push(
          <div
            key={service.id}
            title={service.planid.appid.name}
            className="managerSquare"
            style={
              service.planid.appid.icon
                ? {
                    backgroundImage:
                      service.planid.appid.icon.indexOf("/") != -1
                        ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                            service.planid.appid.icon
                          )})`
                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                            service.planid.appid.icon
                          )})`,
                    backgroundColor: "unset"
                  }
                : {}
            }>
            {service.planid.appid.icon ? "" : service.planid.appid.name.slice(0, 1)}
          </div>
        );
      }
    }
    return serviceArray;
  }

  renderEmployees(employees) {
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
          <h1>Team Manager</h1>
          <UniversalSearchBox
            getValue={v => {
              this.setState({ search: v });
            }}
          />
        </div>
        <div className="section">
          <div className="heading">
            <h1>Teams</h1>
          </div>
          <Query query={fetchCompanyTeams}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }

              //Sort teams
              let teams: any[] = [];
              let interteams: any[] = [];
              if (data.fetchCompanyTeams) {
                interteams = data.fetchCompanyTeams;
                console.log("Interteams", interteams, data);
                interteams.sort(function(a, b) {
                  let nameA = a.name.toUpperCase();
                  let nameB = b.name.toUpperCase();
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
                  teams = interteams.filter(team => {
                    return team.name.toUpperCase().includes(this.state.search.toUpperCase());
                  });
                } else {
                  teams = interteams;
                }
                console.log("TEAMS", teams);
              }
              return (
                <div className="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      <div className="tableColumnBig">
                        <h1>Name</h1>
                      </div>
                      <div className="tableColumnBig">
                        <h1>Employees</h1>
                      </div>
                      <div className="tableColumnBig">
                        <h1>Services</h1>
                      </div>
                    </div>
                    <div className="tableEnd">
                      <UniversalButton
                        type="high"
                        label="Add Team"
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
                  {teams.length > 0 &&
                    teams.map(team => (
                      <div key={team.name} className="tableRow">
                        {console.log("TEAM", team)}
                        <div className="tableMain">
                          <div className="tableColumnBig">
                            <div
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
                            <span className="name">{team.name}</span>
                          </div>
                          <div className="tableColumnBig">
                            {team.employees
                              ? this.renderEmployees(team.employees)
                              : "No services yet"}
                          </div>
                          <div className="tableColumnBig">
                            {team.services ? this.renderSerives(team.services) : "No services yet"}
                          </div>
                        </div>
                        <div className="tableEnd">
                          <div className="editOptions">
                            <i
                              className="fal fa-external-link-alt"
                              onClick={() => this.props.moveTo(`dmanager/${team.unitid.id}`)}
                            />
                            <i
                              className="fal fa-trash-alt"
                              onClick={() => this.setState({ willdeleting: team })}
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
export default TeamOverview;
