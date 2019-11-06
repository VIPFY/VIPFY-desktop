import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchDepartmentsData, fetchUserLicences, fetchTeams } from "../../queries/departments";
import { now } from "moment";
import AddEmployeePersonalData from "../../components/manager/addEmployeePersonalData";
import AddEmployeeTeams from "../../components/manager/addEmployeeTeams";
import PopupBase from "../../popups/universalPopups/popupBase";
import AddEmployeeServices from "../../components/manager/addEmployeeServices";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { randomPassword } from "../../common/passwordgen";
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import PrintTeamSquare from "../../components/manager/universal/squares/printTeamSquare";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import PrintEmployeeSquare from "../../components/manager/universal/squares/printEmployeeSquare";
import ManageTeams from "../../components/manager/universal/managing/teams";
import ManageServices from "../../components/manager/universal/managing/services";
import DeletePopup from "../../popups/universalPopups/deletePopup";

interface Props {
  moveTo: Function;
  isadmin?: boolean;
}

interface State {
  search: string;
  sort: string;
  sortforward: boolean;
  add: Boolean;
  addStage: number;
  addpersonal: Object;
  apps: { id: number; name: number; icon: string; needssubdomain: Boolean; options: Object }[];
  addteams: any[];
  saving: Boolean;
  deleting: number | null;
  willdeleting: number | null;
}

const CREATE_EMPLOYEE = gql`
  mutation onCreateEmployee(
    $file: Upload
    $addpersonal: JSON!
    $addteams: [JSON]!
    $apps: [JSON]!
  ) {
    createEmployee(file: $file, addpersonal: $addpersonal, addteams: $addteams, apps: $apps)
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation onDeleteEmployee($employeeid: ID!) {
    deleteEmployee(employeeid: $employeeid)
  }
`;

class EmployeeOverview extends React.Component<Props, State> {
  state = {
    search: "",
    sort: "Name",
    sortforward: true,
    add: false,
    addpersonal: {},
    addStage: 1,
    apps: [],
    addteams: [],
    saving: false,
    deleting: null,
    willdeleting: null
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

  filterMotherfunction(employee) {
    if (
      `${employee.firstname} ${employee.lastname}`
        .toUpperCase()
        .includes(this.state.search.toUpperCase())
    ) {
      return true;
    } else if (/* employee.teams.filter(team => this.filterTeams(team)).length > 0 */ false) {
      return true;
    } else if (
      /* employee.services.filter(service => this.filterServices(service)).length > 0 */ false
    ) {
      return true;
    }
    return false;
  }

  filterTeams(team) {
    return team.name.toUpperCase().includes(this.state.search.toUpperCase());
  }

  filterServices(service) {
    if (!service.app) {
      return false;
    }
    return service.app.name.toUpperCase().includes(this.state.search.toUpperCase());
  }

  addUser(apps, addteams) {
    this.setState({ apps, addteams, saving: true, add: false });
  }

  addProcess(refetch) {
    switch (this.state.addStage) {
      case 1:
        return (
          <PopupBase
            //fullmiddle={true}
            small={true}
            //customStyles={{ maxWidth: "1152px" }}
            close={() => this.setState({ add: false })}
            nooutsideclose={true}
            additionalclassName="formPopup deletePopup">
            <AddEmployeePersonalData
              continue={data => {
                this.setState({ addpersonal: data, addStage: 2 });
              }}
              close={() => {
                this.setState({ add: false });
                refetch();
              }}
              addpersonal={this.state.addpersonal}
              isadmin={this.props.isadmin}
            />
          </PopupBase>
        );
      case 2:
        return (
          <ManageTeams
            employee={{
              ...this.state.addpersonal,
              firstname: this.state.addpersonal.name,
              id: this.state.addpersonal.unitid
            }} //TODO CHANGE employeename
            close={() => {
              this.setState({ add: false });
              refetch();
            }}>
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
          </ManageTeams>
        );
      case 3:
        return (
          <ManageServices
            employee={{
              ...this.state.addpersonal,
              firstname: this.state.addpersonal.name,
              id: this.state.addpersonal.unitid
            }} //TODO CHANGE employeename
            close={() => {
              this.setState({ add: false });
              refetch();
            }}>
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
          </ManageServices>
        );
      default:
        return <div />;
    }
  }

  loading() {
    const amountFakes = Math.random() * 10 + 1;
    const fakeArray: JSX.Element[] = [];

    for (let index = 0; index < amountFakes; index++) {
      fakeArray.push(
        <div className="tableRow">
          <div className="tableMain">
            <div className="tableColumnBig" style={{ width: "20%" }}>
              <PrintTeamSquare team={{}} fake={true} />
              <span className="name" />
            </div>
            <div className="tableColumnSmall" style={{ width: "10%" }}>
              <div
                className="status"
                style={{
                  backgroundColor: "#F2F2F2",
                  marginTop: "18px",
                  marginLeft: "0px",
                  width: "40px",
                  height: "16px"
                }}
              />
            </div>
            <ColumnTeams
              {...this.props}
              style={{ width: "20%" }}
              teams={[null]}
              teamidFunction={team => team}
              fake={true}
            />
            <ColumnServices
              style={{ width: "30%" }}
              services={[null]}
              checkFunction={element =>
                !element.disabled &&
                !element.planid.appid.disabled &&
                element.vacationstart <= now() &&
                element.vacationend > now()
              }
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
          <h1>Employee Manager</h1>
          <UniversalSearchBox
            getValue={v => {
              this.setState({ search: v });
            }}
          />
        </div>
        <div className="section">
          <div className="heading">
            <h1>Employees</h1>
          </div>
          <Query query={fetchDepartmentsData} fetchPolicy="network-only">
            {({ loading, error, data, refetch }) => {
              if (loading) {
                return (
                  <div className="table">
                    <div className="tableHeading">
                      <div className="tableMain">
                        <div
                          className="tableColumnBig"
                          style={{ width: "20%" }}
                          onClick={() => this.handleSortClick("Name")}>
                          <h1>Name</h1>
                        </div>
                        <div
                          className="tableColumnSmall"
                          style={{ width: "10%" }}
                          onClick={() => this.handleSortClick("Status")}>
                          <h1>Status</h1>
                        </div>
                        <div
                          className="tableColumnBig"
                          style={{ width: "20%" }}
                          //onClick={() => this.handleSortClick("Teams")}
                        >
                          <h1>Teams</h1>
                        </div>
                        <div
                          className="tableColumnBig"
                          style={{ width: "30%" }}
                          //onClick={() => this.handleSortClick("Services")}
                        >
                          <h1>Services</h1>
                        </div>
                      </div>
                      <div className="tableEnd">
                        <UniversalButton
                          type="high"
                          label="Add Employee"
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
                              addpersonal: {},
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

              // Sort employees
              let employees: any[] = [];
              let interemployees: any[] = [];
              if (data.fetchDepartmentsData && data.fetchDepartmentsData[0].children_data) {
                interemployees = data.fetchDepartmentsData[0].children_data.filter(e => e && e.id);
                let sortforward = this.state.sortforward;

                //Sortselection
                switch (this.state.sort) {
                  case "Name":
                    interemployees.sort(function(a, b) {
                      let nameA = `${a.firstname} ${a.lastname}`.toUpperCase();
                      let nameB = `${b.firstname} ${b.lastname}`.toUpperCase();
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
                  case "Status":
                    interemployees.sort(function(a, b) {
                      let onA = a.isonline;
                      let onB = b.isonline;
                      if (onA && !onB) {
                        if (sortforward) {
                          return -1;
                        } else {
                          return 1;
                        }
                      }
                      if (!onA && onB) {
                        if (sortforward) {
                          return 1;
                        } else {
                          return -1;
                        }
                      }
                      let nameA = `${a.firstname} ${a.lastname}`.toUpperCase();
                      let nameB = `${b.firstname} ${b.lastname}`.toUpperCase();
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
                    break;
                  case "Services":
                    /* interemployees.sort(function(a, b) {
                        let servicesA = data.fetchUsersOwnLicences(a.id);
                        let servicesB = data.fetchUsersOwnLicences(b.id);
                        console.log("Check");

                        return 0;
                      }); */
                    break;

                  default:
                    break;
                }

                if (this.state.search != "") {
                  employees = interemployees.filter(employee => {
                    return `${employee.firstname} ${employee.lastname}`
                      .toUpperCase()
                      .includes(this.state.search.toUpperCase());
                  });
                } else {
                  employees = interemployees;
                }
              }
              return (
                <>
                  <div className="table">
                    <div className="tableHeading">
                      <div className="tableMain">
                        <div
                          className="tableColumnBig"
                          style={{ width: "20%" }}
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
                          className="tableColumnSmall"
                          style={{ width: "10%" }}
                          onClick={() => this.handleSortClick("Status")}>
                          <h1>
                            Status
                            {this.state.sort == "Status" ? (
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
                          className="tableColumnBig"
                          style={{ width: "20%" }}
                          //onClick={() => this.handleSortClick("Teams")}
                        >
                          <h1>
                            Teams
                            {/*this.state.sort == "Teams" ? (
                              this.state.sortforward ? (
                                <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                              ) : (
                                <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                              )
                            ) : (
                              <i
                                className="fas fa-sort"
                                style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                            )*/}
                          </h1>
                        </div>
                        <div
                          className="tableColumnBig"
                          style={{ width: "30%" }}
                          //onClick={() => this.handleSortClick("Services")}
                        >
                          <h1>
                            Services
                            {/*this.state.sort == "Services" ? (
                              this.state.sortforward ? (
                                <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                              ) : (
                                <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                              )
                            ) : (
                              <i
                                className="fas fa-sort"
                                style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                            )*/}
                          </h1>
                        </div>
                      </div>
                      <div className="tableEnd">
                        <UniversalButton
                          type="high"
                          label="Add Employee"
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
                              addpersonal: {},
                              apps: []
                            })
                          }
                        />
                      </div>
                    </div>
                    {employees.length > 0 &&
                      employees.map(employee => (
                        <div
                          key={employee.id}
                          className="tableRow"
                          onClick={() => this.props.moveTo(`emanager/${employee.id}`)}>
                          <div className="tableMain">
                            <div className="tableColumnBig" style={{ width: "20%" }}>
                              <PrintEmployeeSquare employee={employee} className="managerSquare" />
                              <span className="name">
                                {employee.firstname} {employee.lastname}
                              </span>
                              {/* <div
                                className="status"
                                style={
                                  employee.isonline
                                    ? {
                                        backgroundColor: "#29CC94",
                                        float: "right",
                                        marginTop: "18px",
                                        marginLeft: "0px",
                                        width: "56px"
                                      }
                                    : {
                                        backgroundColor: "#DB4D3F",
                                        float: "right",
                                        marginTop: "18px",
                                        marginLeft: "0px",
                                        width: "56px"
                                      }
                                }>
                                {employee.isonline ? "Online" : "Offline"}
                              </div>*/}
                            </div>
                            <div className="tableColumnSmall" style={{ width: "10%" }}>
                              <div
                                className="status"
                                style={
                                  employee.isonline
                                    ? {
                                        backgroundColor: "#29CC94",
                                        marginTop: "18px",
                                        marginLeft: "0px",
                                        width: "100%"
                                      }
                                    : {
                                        backgroundColor: "#DB4D3F",
                                        marginTop: "18px",
                                        marginLeft: "0px",
                                        width: "100%"
                                      }
                                }>
                                {employee.isonline ? "Online" : "Offline"}
                              </div>
                            </div>
                            <Query
                              pollInterval={60 * 10 * 1000 + 600}
                              query={fetchTeams}
                              fetchPolicy="network-only" //TODO make better
                              variables={{ userid: employee.id }}>
                              {({ loading, error, data }) => {
                                if (loading) {
                                  return (
                                    <ColumnTeams
                                      {...this.props}
                                      style={{ width: "20%" }}
                                      teams={data.fetchTeams}
                                      teamidFunction={team => team}
                                      fake={true}
                                    />
                                  );
                                }
                                if (error) {
                                  return `Error! ${error.message}`;
                                }
                                return (
                                  <ColumnTeams
                                    {...this.props}
                                    style={{ width: "20%" }}
                                    teams={data.fetchTeams}
                                    teamidFunction={team => team}
                                    fake={false}
                                  />
                                );
                              }}
                            </Query>
                            <Query
                              pollInterval={60 * 10 * 1000 + 300}
                              query={fetchUserLicences}
                              variables={{ unitid: employee.id }}
                              fetchPolicy="network-only" //TODO make better
                            >
                              {({ loading, error, data }) => {
                                if (loading) {
                                  return (
                                    <ColumnServices
                                      {...this.props}
                                      style={{ width: "30%" }}
                                      services={data.fetchUsersOwnLicences}
                                      checkFunction={element =>
                                        !element.disabled &&
                                        !element.boughtplanid.planid.appid.disabled &&
                                        element.vacationstart <= now() &&
                                        element.vacationend > now()
                                      }
                                      appidFunction={element => element.boughtplanid.planid.appid}
                                      overlayFunction={service =>
                                        service.options &&
                                        service.options.nosetup && (
                                          <div className="licenceError">
                                            <i className="fal fa-exclamation-circle" />
                                          </div>
                                        )
                                      }
                                      fake={true}
                                    />
                                  );
                                }
                                if (error) {
                                  return `Error! ${error.message}`;
                                }
                                return (
                                  <ColumnServices
                                    {...this.props}
                                    style={{ width: "30%" }}
                                    services={data.fetchUsersOwnLicences}
                                    checkFunction={element =>
                                      !element.disabled &&
                                      !element.boughtplanid.planid.appid.disabled &&
                                      element.vacationstart <= now() &&
                                      element.vacationend > now()
                                    }
                                    appidFunction={element => element.boughtplanid.planid.appid}
                                    overlayFunction={service =>
                                      service.options &&
                                      service.options.nosetup && (
                                        <div className="licenceError">
                                          <i className="fal fa-exclamation-circle" />
                                        </div>
                                      )
                                    }
                                    fake={false}
                                    unitid={employee.id}
                                  />
                                );
                              }}
                            </Query>
                          </div>
                          <div className="tableEnd">
                            <div className="editOptions">
                              <i className="fal fa-external-link-alt editbuttons" />
                              {this.props.id != employee.id && (
                                <i
                                  className="fal fa-trash-alt editbuttons"
                                  onClick={e => {
                                    e.stopPropagation();
                                    this.setState({ willdeleting: employee.id });
                                  }}
                                />
                              )}
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
          <Mutation mutation={CREATE_EMPLOYEE}>
            {createEmployee => (
              <PopupSelfSaving
                savingmessage="Adding new employee"
                savedmessage="New employee succesfully added"
                saveFunction={async () => {
                  await createEmployee({
                    variables: {
                      file: this.state.addpersonal.picture,
                      addpersonal: {
                        password: await randomPassword(),
                        ...this.state.addpersonal
                      },
                      addteams: this.state.addteams,
                      apps: this.state.apps
                    },
                    refetchQueries: [{ query: fetchDepartmentsData }]
                  });
                }}
                closeFunction={() =>
                  this.setState({
                    saving: false,
                    addteams: [],
                    apps: [],
                    addpersonal: {},
                    addStage: 1
                  })
                }
              />
            )}
          </Mutation>
        )}
        {this.state.willdeleting && (
          <Mutation mutation={DELETE_EMPLOYEE}>
            {deleteEmployee => (
              <DeletePopup
                key="removeEmployee"
                heading="Remove Employee"
                subHeading="By removing the employee from the company, you remove all accounts aswell"
                services={[]}
                employees={[]}
                close={() => this.setState({ willdeleting: null })}
                submit={() =>
                  deleteEmployee({
                    variables: {
                      employeeid: this.state.willdeleting
                    },
                    refetchQueries: [{ query: fetchDepartmentsData }]
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
export default EmployeeOverview;
