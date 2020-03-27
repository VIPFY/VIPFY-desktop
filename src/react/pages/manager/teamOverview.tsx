import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query } from "react-apollo";
import { fetchCompanyTeams } from "../../queries/departments";
import PopupBase from "../../popups/universalPopups/popupBase";
import AddTeamGeneralData from "../../components/manager/addTeamGeneralData";
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import PrintTeamSquare from "../../components/manager/universal/squares/printTeamSquare";
import ColumnEmployees from "../../components/manager/universal/columns/columnEmployee";
import DeleteTeam from "../../components/manager/deleteTeam";

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
  willdeleting: number | null;
}

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

  loading() {
    const amountFakes = Math.random() * 10 + 1;
    const fakeArray: JSX.Element[] = [];

    for (let index = 0; index < amountFakes; index++) {
      fakeArray.push(
        <div className="tableRow" key={`fake-${index}`}>
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
            fetchPolicy="network-only">
            {({ loading, error, data, refetch }) => {
              if (loading) {
                return (
                  <div className="table" key="table">
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
                      <div className="tableEnd"></div>
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
                  <div className="table" key="table">
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
                          {/*<h1>Shared Accounts</h1>*/}
                        </div>
                      </div>
                      <div className="tableEnd"></div>
                    </div>
                    {teams.length > 0 &&
                      teams.map(team => (
                        <div
                          key={team.name}
                          id={team.name}
                          className="tableRow"
                          onClick={() => this.props.moveTo(`dmanager/${team.unitid.id}`)}>
                          <div className="tableMain">
                            <div className="tableColumnBig">
                              <PrintTeamSquare team={team} />
                              <span className="name" title={team.name}>
                                {team.name}
                              </span>
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
                  {this.state.add && (
                    <PopupBase
                      small={true}
                      close={() => this.setState({ add: false })}
                      additionalclassName="formPopup">
                      <AddTeamGeneralData
                        savingFunction={data => {
                          this.setState({ add: false });
                          this.props.moveTo(`dmanager/${data.content.unitid.id}`);
                        }}
                        close={() => this.setState({ add: false })}
                        addteam={this.state.addteam}
                        isadmin={this.props.isadmin}
                      />
                    </PopupBase>
                  )}
                </>
              );
            }}
          </Query>
        </div>
        {this.state.willdeleting && (
          <DeleteTeam
            team={this.state.willdeleting}
            close={() => this.setState({ willdeleting: null })}
          />
        )}
      </div>
    );
  }
}
export default TeamOverview;
