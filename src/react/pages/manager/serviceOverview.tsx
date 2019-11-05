import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { fetchCompanyServices } from "../../queries/products";
import { now } from "moment";
import AddServiceGeneralData from "../../components/manager/serviceDetails/addServiceGeneralData";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import ColumnEmployees from "../../components/manager/universal/columns/columnEmployee";
import ManageServiceTeams from "../../components/manager/universal/managing/serviceteams";
import ManageServiceEmployees from "../../components/manager/universal/managing/serviceemployees";
import PrintServiceSquare from "../../components/manager/universal/squares/printServiceSquare";

interface Props {
  moveTo: Function;
}

interface State {
  search: string;
  sort: string;
  sortforward: boolean;
  add: Boolean;
  addStage: number;
  addservice: Object | null;
  teams: { id: number; name: number; profilepicture: string }[];
  addemployees: any[];
  saving: Boolean;
  deleting: number | null;
  willdeleting: number | null;
  keepLicences: { service: number; employee: number }[];
}

const CREATE_SERVICE = gql`
  mutation createService($serviceData: JSON!, $addedTeams: [JSON]!, $addedEmployees: [JSON]!) {
    createService(
      serviceData: $serviceData
      addedTeams: $addedTeams
      addedEmployees: $addedEmployees
    )
  }
`;

const DELETE_SERVICE = gql`
  mutation deleteService($serviceid: ID!) {
    deleteService(serviceid: $serviceid)
  }
`;

class ServiceOverview extends React.Component<Props, State> {
  state = {
    search: "",
    sort: "Name",
    sortforward: true,
    add: false,
    addservice: null,
    addStage: 1,
    teams: [],
    addemployees: [],
    saving: false,
    deleting: null,
    willdeleting: null,
    keepLicences: [],
    currentServices: []
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

  filterMotherfunction(service) {
    if (service.app.name.toUpperCase().includes(this.state.search.toUpperCase())) {
      return true;
    } else if (service.teams.filter(team => this.filterTeams(team)).length > 0) {
      return true;
    } else if (
      service.licences.filter(
        l =>
          l &&
          ((l.unitid != null && l.endtime == null) || l.endtime > now()) &&
          (l.options == null || l.options.teamlicence == null) &&
          this.filterEmployee(l.unitid)
      ).length > 0
    ) {
      return true;
    }
    return false;
  }

  filterEmployee(unitid) {
    if (!unitid) {
      return false;
    }
    return `${unitid.firstname} ${unitid.lastname}`
      .toUpperCase()
      .includes(this.state.search.toUpperCase());
  }

  filterTeams(team) {
    if (team && team.departmentid && team.departmentid.name) {
      return team.departmentid.name.toUpperCase().includes(this.state.search.toUpperCase());
    }
    return false;
  }

  addService(singles) {
    this.setState({ addemployees: singles, saving: true, add: false });
  }

  addProcess(refetch) {
    switch (this.state.addStage) {
      case 1:
        return (
          <PopupBase
            fullmiddle={true}
            customStyles={{ maxWidth: "1152px" }}
            close={() => {
              refetch();
              this.setState({ add: false });
            }}>
            <AddServiceGeneralData
              continue={data => this.setState({ addservice: data, addStage: 2 })}
              close={() => {
                refetch();
                this.setState({ add: false });
              }}
              addservice={this.state.addservice}
              currentServices={this.state.currentServices}
            />
          </PopupBase>
        );
      case 2:
        return (
          /*<AddTeam
            continue={data => {
              this.setState({ teams: data, addStage: 3 });
            }}
            close={() => this.setState({ addStage: 1 })}
            service={this.state.addservice}
            addedTeams={this.state.teams}
            teams={[]}
          />*/
          <ManageServiceTeams
            service={this.state.addservice}
            close={() => {
              //refetch();
              this.setState({ add: false });
            }}>
            <div className="buttonsPopup">
              <UniversalButton
                label="Close"
                type="low"
                onClick={() => {
                  refetch();
                  this.setState({ add: false });
                }}
              />
              <div className="buttonSeperator" />
              <UniversalButton
                label="Manage Employees"
                type="high"
                onClick={() => this.setState({ addStage: 3 })}
              />
            </div>
          </ManageServiceTeams>
        );
      case 3:
        return (
          <ManageServiceEmployees
            service={this.state.addservice}
            close={() => {
              //refetch();
              this.setState({ add: false });
            }}>
            <div className="buttonsPopup">
              <UniversalButton
                label="Close"
                type="low"
                onClick={() => {
                  refetch();
                  this.setState({ add: false });
                }}
              />
            </div>
          </ManageServiceEmployees>
        );
      default:
        return <div />;
    }
  }

  printServices(services) {
    const serviceArray: JSX.Element[] = [];
    services.forEach(service => {
      if (
        service.licences.find(l => l && (l.endtime == null || l.endtime > now())) ||
        (service.app.owner && service.app.owner.id)
      ) {
        serviceArray.push(
          <div
            key={service.name}
            className="tableRow"
            onClick={() => this.props.moveTo(`lmanager/${service.app.id}`)}>
            <div className="tableMain">
              <div className="tableColumnBig">
                <PrintServiceSquare appidFunction={s => s.app} service={service} />
                <span className="name">{service.app.name}</span>
              </div>
              <ColumnTeams teams={service.teams} teamidFunction={team => team.departmentid} />
              <ColumnEmployees
                employees={service.licences}
                checkFunction={l =>
                  l &&
                  ((l.unitid != null && l.endtime == null) || l.endtime > now()) &&
                  (l.options == null || l.options.teamlicence == null)
                }
                employeeidFunction={e => e.unitid}
              />
            </div>
            <div style={{ width: "18px", display: "flex", alignItems: "center" }}>
              {service.app.disabled && (
                <i className="fad fa-exclamation-triangle warningColor" title="App is disabled"></i>
              )}
            </div>
            <div className="tableEnd">
              <div className="editOptions">
                <i className="fal fa-external-link-alt editbuttons" />
                <i
                  className="fal fa-trash-alt editbuttons"
                  onClick={e => {
                    e.stopPropagation();
                    this.setState({ willdeleting: service });
                  }}
                />
              </div>
            </div>
          </div>
        );
      }
    });
    return serviceArray;
  }

  loading() {
    const amountFakes = Math.random() * 10 + 1;
    const fakeArray: JSX.Element[] = [];

    for (let index = 0; index < amountFakes; index++) {
      fakeArray.push(
        <div className="tableRow">
          <div className="tableMain">
            <div className="tableColumnBig">
              <PrintServiceSquare appidFunction={s => s.app} service={{}} fake={true} />
              <span className="name" />
            </div>
            <ColumnTeams teams={[null]} teamidFunction={team => team.departmentid} fake={true} />
            <ColumnEmployees
              employees={[null]}
              employeeidFunction={e => e}
              checkFunction={e => true}
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
          <Query
            pollInterval={60 * 10 * 1000 + 900}
            query={fetchCompanyServices}
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
                          className="tableColumnBig" //onClick={() => this.handleSortClick("Teams")}
                        >
                          <h1>Teams</h1>
                        </div>
                        <div
                          className="tableColumnBig" //onClick={() => this.handleSortClick("Single Users")}
                        >
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
                              addservice: {},
                              apps: []
                            })
                          }
                        />
                      </div>
                    </div>
                    {this.loading()}
                  </div>
                );
              }
              if (error) {
                return `Error! ${error.message}`;
              }

              //Sort teams
              let services: any[] = [];
              let interservices: any[] = [];
              if (data && data.fetchCompanyServices) {
                interservices = data.fetchCompanyServices;
                let sortforward = this.state.sortforward;

                //sortselection
                switch (this.state.sort) {
                  case "Name":
                    interservices.sort(function(a, b) {
                      let nameA = a.app.name.toUpperCase();
                      let nameB = b.app.name.toUpperCase();
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

                  case "Teams":
                    interservices.sort(function(a, b) {
                      let teamsA = a.teams.length;
                      let teamsB = b.teams.length;

                      if (teamsA > teamsB) {
                        if (sortforward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (teamsA < teamsB) {
                        if (sortforward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }
                      //if teamsCount is equal sort by name instant
                      let nameA = a.app.name.toUpperCase();
                      let nameB = b.app.name.toUpperCase();
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

                  case "Single Users":
                    interservices.sort(function(a, b) {
                      let licencesA = a.licences.filter(
                        l =>
                          l &&
                          ((l.unitid != null && l.endtime == null) || l.endtime > now()) &&
                          (l.options == null || l.options.teamlicence == null)
                      ).length;
                      let licencesB = b.licences.filter(
                        l =>
                          l &&
                          ((l.unitid != null && l.endtime == null) || l.endtime > now()) &&
                          (l.options == null || l.options.teamlicence == null)
                      ).length;

                      if (licencesA > licencesB) {
                        if (sortforward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (licencesA < licencesB) {
                        if (sortforward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }
                      //if licencesCount is equal sort by name instant
                      let nameA = a.app.name.toUpperCase();
                      let nameB = b.app.name.toUpperCase();
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

                  default:
                    break;
                }
                if (this.state.search != "") {
                  services = interservices.filter(service => this.filterMotherfunction(service));
                } else {
                  services = interservices;
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
                          <h1>Name</h1>
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
                        </div>
                        <div
                          className="tableColumnBig"
                          //onClick={() => this.handleSortClick("Teams")}
                        >
                          <h1>Teams</h1>
                        </div>
                        <div
                          className="tableColumnBig"
                          //onClick={() => this.handleSortClick("Single Users")}
                        >
                          <h1>Single Users</h1>
                        </div>
                      </div>
                      <div style={{ width: "18px", display: "flex", alignItems: "center" }}></div>
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
                              addservice: null,
                              teams: [],
                              currentServices: data.fetchCompanyServices
                            })
                          }
                        />
                      </div>
                    </div>
                    {services.length > 0 && this.printServices(services)}
                  </div>
                  {this.state.add && this.addProcess(refetch)}
                </>
              );
            }}
          </Query>
        </div>
        {this.state.saving && (
          <Mutation mutation={CREATE_SERVICE}>
            {createService => (
              <PopupSelfSaving
                savingmessage="Adding new service"
                savedmessage="New service succesfully added"
                saveFunction={async () => {
                  await createService({
                    variables: {
                      serviceData: this.state.addservice,
                      addedTeams: this.state.teams,
                      addedEmployees: this.state.addemployees
                    },
                    refetchQueries: [{ query: fetchCompanyServices }]
                  });
                }}
                closeFunction={() =>
                  this.setState({
                    saving: false,
                    addemployees: [],
                    teams: [],
                    addservice: null,
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
            <p>Do you really want to delete the service and all its licences?</p>
            <UniversalButton type="low" closingPopup={true} label="Cancel" />
            <UniversalButton
              type="low"
              label="Delete"
              onClick={() => {
                this.setState(prevState => {
                  return {
                    willdeleting: null,
                    deleting: prevState.willdeleting!.id
                  };
                });
              }}
            />
          </PopupBase>
        )}
        {this.state.deleting && (
          <Mutation mutation={DELETE_SERVICE}>
            {deleteTeam => (
              <PopupSelfSaving
                savingmessage="Deleting service"
                savedmessage="Service succesfully deleted"
                saveFunction={async () =>
                  await deleteTeam({
                    variables: {
                      serviceid: this.state.deleting
                    },
                    refetchQueries: [{ query: fetchCompanyServices }]
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
