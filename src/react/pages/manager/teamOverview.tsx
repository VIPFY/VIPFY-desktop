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
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import PrintTeamSquare from "../../components/manager/universal/squares/printTeamSquare";
import PrintEmployeeSquare from "../../components/manager/universal/squares/printEmployeeSquare";
import ColumnEmployees from "../../components/manager/universal/columns/columnEmployee";
import ManageTeamEmployees from "../../components/manager/universal/managing/teamemployees";
import ManageTeamServices from "../../components/manager/universal/managing/teamservices";

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

  addProcess(refetch) {
    switch (this.state.addStage) {
      case 1:
        return (
          <PopupBase
            fullmiddle={true}
            customStyles={{ maxWidth: "1152px" }}
            close={() => this.setState({ add: false })}>
            <AddTeamGeneralData
              savingFunction={data => this.setState({ addteam: data.content, addStage: 2 })}
              close={() => this.setState({ add: false })}
              addteam={this.state.addteam}
            />
          </PopupBase>
        );
      case 2:
        return (
          /* <AddTeamEmployeeData
            continue={data => {
              this.setState({ addemployees: data, addStage: 3 });
            }}
            close={() => this.setState({ addStage: 1 })}
            teamname={this.state.addteam.name}
            employees={this.state.addemployees}
          /> */
          <ManageTeamEmployees
            team={this.state.addteam}
            close={() => this.setState({ add: false })}>
            <div className="buttonsPopup">
              <UniversalButton
                label="Close"
                type="low"
                onClick={() => {
                  this.setState({ add: false });
                  refetch();
                }}
              />
              <div className="buttonSeperator" />
              <UniversalButton
                label="Manage Services"
                type="high"
                onClick={() => this.setState({ addStage: 3 })}
              />
            </div>
          </ManageTeamEmployees>
        );
      case 3:
        return (
          /*<AddTeamServices
            continue={apps => this.addService(apps)}
            close={() => this.setState({ addStage: 2 })}
            employees={this.state.addemployees}
            apps={this.state.apps}
            teamname={this.state.addteam.name}
          />*/
          <ManageTeamServices team={this.state.addteam} close={() => this.setState({ add: false })}>
            <div className="buttonsPopup">
              <UniversalButton
                label="Close"
                type="low"
                onClick={() => {
                  this.setState({ add: false });
                  refetch();
                }}
              />
            </div>
          </ManageTeamServices>
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
            {({ loading, error, data, refetch }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }

              // Sort teams
              let teams: any[] = [];
              let interteams: any[] = [];
              if (data.fetchCompanyTeams) {
                interteams = data.fetchCompanyTeams;
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
              }
              return (
                <>
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
                        <div
                          key={team.name}
                          className="tableRow"
                          onClick={() => this.props.moveTo(`dmanager/${team.unitid.id}`)}>
                          <div className="tableMain">
                            <div className="tableColumnBig">
                              <PrintTeamSquare team={team} />
                              <span className="name">{team.name}</span>
                            </div>
                            <ColumnEmployees
                              employees={team.employees}
                              employeeidFunction={e => e}
                              checkFunction={e => true}
                            />
                            <ColumnServices
                              services={team.services}
                              checkFunction={element =>
                                !element.disabled && !element.planid.appid.disabled
                              }
                              appidFunction={element => element.planid.appid}
                            />
                          </div>
                          <div className="tableEnd">
                            <div className="editOptions">
                              <i className="fal fa-external-link-alt editbuttons" />
                              <i
                                className="fal fa-trash-alt editbuttons"
                                onClick={e => {
                                  e.stopPropagation();
                                  this.setState({ willdeleting: team });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {this.state.add && this.addProcess(refetch)}
                </>
              );
            }}
          </Query>
        </div>
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
