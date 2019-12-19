import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchCompanyTeams } from "../../queries/departments";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import AddTeamGeneralData from "../../components/manager/addTeamGeneralData";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import PrintTeamSquare from "../../components/manager/universal/squares/printTeamSquare";
import ColumnEmployees from "../../components/manager/universal/columns/columnEmployee";
import DeletePopup from "../../popups/universalPopups/deletePopup";

interface Props {
  moveTo: Function;
}

interface State {
  search: string;
  sort: string;
  sortforward: boolean;
  add: Boolean;
  addStage: number;
  addteam: Object;
  apps: { id: number; name: number; icon: string; needssubdomain: Boolean; options: Object }[];
  addemployees: any[];
  saving: Boolean;
  deleting: number | null;
  willdeleting: number | null;
  keepLicences: { service: number; employee: number }[];
  isadmin?: boolean;
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
    sort: "Name",
    sortforward: true,
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

  handleSortClick(sorted) {
    if (sorted != this.state.sort) {
      this.setState({ sortforward: true, sort: sorted });
    } else {
      this.setState(oldstate => {
        return { sortforward: !oldstate.sortforward };
      });
    }
  }

  filterMotherfunction(team) {
    if (team.name.toUpperCase().includes(this.state.search.toUpperCase())) {
      return true;
    } else if (team.employees.filter(employee => this.filterEmployee(employee)).length > 0) {
      return true;
    } else if (team.services.filter(service => this.filterServices(service)).length > 0) {
      return true;
    }
    return false;
  }

  filterEmployee(employee) {
    return `${employee.firstname} ${employee.lastname}`
      .toUpperCase()
      .includes(this.state.search.toUpperCase());
  }

  filterServices(service) {
    if (!service.app) {
      return false;
    }
    return service.app.name.toUpperCase().includes(this.state.search.toUpperCase());
  }

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
    this.setState({ apps, saving: true, add: false });
  }

  addProcess(refetch) {
    /*switch (this.state.addStage) {
      case 1:*/
    return (
      <PopupBase
        small={true}
        close={() => this.setState({ add: false })}
        additionalclassName="formPopup">
        <AddTeamGeneralData
          savingFunction={data => {
            console.log("DATA", data);
            this.setState({ add: false });
            this.props.moveTo(`dmanager/${data.content.unitid.id}`);
          }}
          close={() => this.setState({ add: false })}
          addteam={this.state.addteam}
          isadmin={this.props.isadmin}
        />
      </PopupBase>
    );
  }

  loading() {
    const amountFakes = Math.random() * 10 + 1;
    const fakeArray: JSX.Element[] = [];

    for (let index = 0; index < amountFakes; index++) {
      fakeArray.push(
        <div className="tableRow">
          <div className="tableMain">
            <div className="tableColumnBig">
              <PrintTeamSquare team={{}} fake={true} />
              <span className="name" />
            </div>
            <ColumnEmployees
              employees={[null]}
              employeeidFunction={e => e}
              checkFunction={e => true}
              fake={true}
            />
            <ColumnServices
              services={[null]}
              checkFunction={element => !element.disabled && !element.planid.appid.disabled}
              appidFunction={element => element.planid.appid}
              fake={true}
            />
          </div>
          <div className="tableEnd" />
        </div>
      );
    }
    return fakeArray;
  }

  getKeepLicences(values) {
    const keepLicences = [];
    Object.keys(values).forEach(s => {
      values[s].forEach(i => {
        keepLicences.push({ service: s.substring(2), employee: i });
      });
    });
    return keepLicences;
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
          <Query
            pollInterval={60 * 10 * 1000 + 600}
            query={fetchCompanyTeams}
            fetchPolicy="cache-and-network">
            {({ loading, error, data, refetch }) => {
              if (loading) {
                return (
                  <div className="table">
                    <div className="tableHeading">
                      <div className="tableMain">
                        <div
                          className="tableColumnBig"
                          onClick={() => this.handleSortClick("Name")}>
                          <h1>Name</h1>
                        </div>
                        <div
                          className="tableColumnBig" //onClick={() => this.handleSortClick("Employees")}
                        >
                          <h1>Employees</h1>
                        </div>
                        <div
                          className="tableColumnBig" //onClick={() => this.handleSortClick("Services")}
                        >
                          <h1>Services</h1>
                        </div>
                      </div>
                      <div className="tableEnd">
                        {/*<UniversalButton
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
                        />*/}
                      </div>
                    </div>
                    {this.loading()}
                  </div>
                );
              }
              if (error) {
                return `Error! ${error.message}`;
              }

              // Sort teams
              let teams: any[] = [];
              let interteams: any[] = [];
              if (data && data.fetchCompanyTeams) {
                interteams = data.fetchCompanyTeams;
                let sortforward = this.state.sortforward;

                //sortselection
                switch (this.state.sort) {
                  case "Name":
                    interteams.sort(function(a, b) {
                      let nameA = a.name.toUpperCase();
                      let nameB = b.name.toUpperCase();
                      if (nameA < nameB) {
                        if (sortforward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (nameA > nameB) {
                        if (sortforward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }
                      // namen müssen gleich sein
                      return 0;
                    });
                    break;

                  case "Employees":
                    interteams.sort(function(a, b) {
                      let memberCountA = a.employees.length;
                      let memberCountB = b.employees.length;
                      if (memberCountA > memberCountB) {
                        if (sortforward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (memberCountA < memberCountB) {
                        if (sortforward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }
                      //if memberCount is equal sort by name instant
                      let nameA = a.name.toUpperCase();
                      let nameB = b.name.toUpperCase();
                      if (nameA < nameB) {
                        if (sortforward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (nameA > nameB) {
                        if (sortforward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }
                      //memberCount and name equal
                      return 0;
                    });

                    break;
                  case "Services":
                    interteams.sort(function(a, b) {
                      let serviceCountA = a.services.length;
                      let serviceCountB = b.services.length;
                      if (serviceCountA > serviceCountB) {
                        if (sortforward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (serviceCountA < serviceCountB) {
                        if (sortforward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }
                      //if serviceCount is equal sort by name instant
                      let nameA = a.name.toUpperCase();
                      let nameB = b.name.toUpperCase();
                      if (nameA < nameB) {
                        if (sortforward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (nameA > nameB) {
                        if (sortforward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }
                      //serviceCount and name equal
                      return 0;
                    });

                    break;

                  default:
                    break;
                }
                if (this.state.search != "") {
                  teams = interteams.filter(team => this.filterMotherfunction(team));
                } else {
                  teams = interteams;
                }
              }
              return (
                <>
                  <div className="table">
                    <div className="tableHeading">
                      <div className="tableMain">
                        <div
                          className="tableColumnBig"
                          onClick={() => this.handleSortClick("Name")}>
                          <h1>
                            Name
                            {this.state.sort == "Name" ? (
                              this.state.sortforward ? (
                                <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                              ) : (
                                <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                              )
                            ) : (
                              <i
                                className="fas fa-sort"
                                style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                            )}
                          </h1>
                        </div>
                        <div
                          className="tableColumnBig" //onClick={() => this.handleSortClick("Employees")}
                        >
                          <h1>Employees</h1>
                        </div>
                        <div
                          className="tableColumnBig" //onClick={() => this.handleSortClick("Services")}
                        >
                          <h1>Orbits</h1>
                        </div>
                        <div
                          className="tableColumnBig" //onClick={() => this.handleSortClick("Services")}
                        >
                          <h1>Shared Accounts</h1>
                        </div>
                      </div>
                      <div className="tableEnd">
                        {/*<UniversalButton
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
                        />*/}
                      </div>
                    </div>
                    {teams.length > 0 &&
                      teams.map(team => (
                        <div
                          id={team.name}
                          className="tableRow"
                          onClick={() => this.props.moveTo(`dmanager/${team.unitid.id}`)}>
                          {console.log("TEAM", team)}
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
                            <ColumnServices
                              services={team.licences}
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
          <Mutation mutation={DELETE_TEAM}>
            {deleteTeam => (
              <DeletePopup
                key="deleteTeam"
                heading="Delete Team"
                subHeading={`If you delete ${
                  this.state.willdeleting!.name
                }, you delete the following services of the following people`}
                employees={this.state.willdeleting!.employees}
                services={this.state.willdeleting!.services}
                main="service"
                close={() => this.setState({ willdeleting: null })}
                submit={values =>
                  deleteTeam({
                    variables: {
                      teamid: this.state.willdeleting!.unitid.id,
                      keepLicences: this.getKeepLicences(values)
                    },
                    refetchQueries: [{ query: fetchCompanyTeams }]
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
