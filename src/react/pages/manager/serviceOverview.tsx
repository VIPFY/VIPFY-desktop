import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { fetchCompanyServices } from "../../queries/products";
import { now } from "moment";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import ColumnEmployees from "../../components/manager/universal/columns/columnEmployee";
import PrintServiceSquare from "../../components/manager/universal/squares/printServiceSquare";
import AssignServiceToUser from "../../components/manager/universal/adding/assignServiceToUser";
import moment from "moment";
import DeleteService from "../../components/manager/deleteService";
import { AppContext } from "../../common/functions";

interface Props {
  moveTo: Function;
}

interface State {
  search: string;
  sort: string;
  sortforward: boolean;
  add: Boolean;
  deleting: number | null;
  willdeleting: number | null;
  keepLicences: { service: number; employee: number }[];
}

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
    } /*else if (service.teams && service.teams.filter(team => this.filterTeams(team)).length > 0) {
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
    }*/
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

  printServices(services) {
    const serviceArray: JSX.Element[] = [];
    services.forEach(service => {
      if (service.app.id == 66) {
        return;
      }
      const teams = [];
      const accounts = [];
      const singleAccounts = [];

      service.orbitids.forEach(element => {
        element.teams.forEach(team => {
          if (team != null) {
            teams.push(team);
          }
        });
      });

      service.orbitids.forEach(element => {
        if (element.endtime == null || moment(element.endtime).toDate() < new Date()) {
          element.accounts.forEach(account => {
            if (
              account != null &&
              (account.endtime == null || moment(account.endtime).toDate() > new Date()) &&
              moment(account.starttime).toDate() < new Date()
            ) {
              accounts.push(account);
              account.assignments.forEach(checkunit => {
                if (
                  checkunit &&
                  (checkunit.endtime == null || moment(checkunit.endtime).toDate() > new Date()) &&
                  !singleAccounts.find(
                    s => s && s && checkunit.unitid && s.id == checkunit.unitid.id
                  )
                ) {
                  singleAccounts.push(checkunit.unitid);
                }
              });
            }
          });
        }
      });

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
            <div className="tableColumnSmall">
              <div
                className="managerSquare"
                style={{ backgroundColor: "white", color: "#253647", fontWeight: "normal" }}>
                {service.orbitids.length}
              </div>
              <div
                className="managerSquare"
                style={{ backgroundColor: "white", color: "#253647", fontWeight: "normal" }}>
                {accounts.length}
              </div>
            </div>
            <ColumnTeams teams={teams} teamidFunction={team => team} />
            <ColumnEmployees
              employees={singleAccounts}
              checkFunction={
                l => true
                /* l &&
                ((l.unitid != null && l.endtime == null) || l.endtime > now()) &&
                (l.options == null || l.options.teamlicence == null)*/
              }
              employeeidFunction={e => e}
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
            <div className="tableColumnBig"></div>
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
            <AppContext.Consumer>
              {({ addRenderElement }) => (
                <UniversalButton
                  innerRef={el => addRenderElement({ key: "addService", element: el })}
                  type="high"
                  label="Add Service"
                  customStyles={{
                    fontSize: "12px",
                    lineHeight: "24px",
                    fontWeight: "700",
                    marginRight: "16px",
                    width: "120px"
                  }}
                  onClick={() =>
                    this.setState({
                      add: true
                    })
                  }
                />
              )}
            </AppContext.Consumer>
          </div>
          <Query pollInterval={60 * 10 * 1000 + 900} query={fetchCompanyServices}>
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
                        <div className="tableColumnSmall">
                          <h1>Orbits/Accounts</h1>
                        </div>
                        <div className="tableColumnBig">
                          <h1>Teams</h1>
                        </div>
                        <div className="tableColumnBig">
                          <h1>Single Users</h1>
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
                        <div className="tableColumnSmall">
                          <h1>Orbits/Accounts</h1>
                        </div>
                        <div className="tableColumnBig">
                          <h1>Teams</h1>
                        </div>
                        <div className="tableColumnBig">
                          <h1>Single Users</h1>
                        </div>
                      </div>
                      <div style={{ width: "18px", display: "flex", alignItems: "center" }}></div>
                      <div className="tableEnd"></div>
                    </div>
                    {services.length > 0 && this.printServices(services)}
                  </div>
                  {this.state.add && (
                    <AppContext.Consumer>
                      {({ addRenderElement }) => (
                        <PopupBase
                          innerRef={el => addRenderElement({ key: "addServicePopup", element: el })}
                          small={true}
                          nooutsideclose={true}
                          close={() => this.setState({ add: false })}
                          additionalclassName="assignNewAccountPopup"
                          buttonStyles={{ justifyContent: "space-between" }}>
                          <h1>Choose Service</h1>
                          <AssignServiceToUser
                            continue={app => app && this.props.moveTo(`lmanager/${app.id}`)}
                          />
                          <UniversalButton
                            innerRef={el => addRenderElement({ key: "cancel", element: el })}
                            type="low"
                            label="Cancel"
                            onClick={() => this.setState({ add: false })}
                          />
                        </PopupBase>
                      )}
                    </AppContext.Consumer>
                  )}
                </>
              );
            }}
          </Query>
        </div>

        {this.state.willdeleting && (
          <DeleteService
            service={this.state.willdeleting}
            close={() => this.setState({ willdeleting: null })}
          />
          /*<PopupBase
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
          </PopupBase>*/
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
