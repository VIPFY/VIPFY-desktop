import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchDepartmentsData, fetchUsersOwnLicences, fetchTeams } from "../../queries/departments";
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

interface Props {
  moveTo: Function;
}

interface State {
  search: string;
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
    add: false,
    addpersonal: {},
    addStage: 1,
    apps: [],
    addteams: [],
    saving: false,
    deleting: null,
    willdeleting: null
  };

  addUser(apps, addteams) {
    this.setState({ apps, addteams, saving: true, add: false });
  }

  addProcess(refetch) {
    console.log("ADD", this.props, this.state);
    switch (this.state.addStage) {
      case 1:
        return (
          <AddEmployeePersonalData
            continue={data => {
              this.setState({ addpersonal: data, addStage: 2 });
              refetch();
            }}
            close={() => this.setState({ add: false })}
            addpersonal={this.state.addpersonal}
          />
        );
      case 2:
        return (
          /*  <AddEmployeeTeams
            continue={data => {
              this.setState({ addteams: data, addStage: 3 });
            }}
            close={() => this.setState({ add: false })}
            employee={{
              ...this.state.addpersonal,
              id: this.state.addpersonal.unitid
            }}
            teams={this.state.addteams}
            setOuterState={async s => {
              console.log("OUTER", s);
              await this.setState(s);
              console.log("STATE", this.state);
            }}
          />*/

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
          /* <AddEmployeeServices
            continue={(apps, teams) => this.addUser(apps, teams)}
            close={() => this.setState({ addStage: 2 })}
            teams={this.state.addteams}
            addusername={this.state.addpersonal.name}
            apps={this.state.apps}
          />*/
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
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }

              // Sort employees
              let employees: any[] = [];
              let interemployees: any[] = [];
              if (data.fetchDepartmentsData && data.fetchDepartmentsData[0].children_data) {
                interemployees = data.fetchDepartmentsData[0].children_data.filter(e => e && e.id);

                interemployees.sort(function(a, b) {
                  let nameA = `${a.firstname} ${a.lastname}`.toUpperCase();
                  let nameB = `${b.firstname} ${b.lastname}`.toUpperCase();
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
                  {employees.length > 0 &&
                    employees.map(employee => (
                      <div
                        key={employee.id}
                        className="tableRow"
                        onClick={() => this.props.moveTo(`emanager/${employee.id}`)}>
                        <div className="tableMain">
                          <div className="tableColumnBig">
                            <PrintEmployeeSquare employee={employee} className="managerSquare" />
                            <span className="name">
                              {employee.firstname} {employee.lastname}
                            </span>
                            <div
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
                            </div>
                          </div>
                          <Query
                            query={fetchTeams}
                            fetchPolicy="network-only" //TODO make better
                            variables={{ userid: employee.id }}>
                            {({ loading, error, data }) => {
                              if (loading) {
                                return "Loading...";
                              }
                              if (error) {
                                return `Error! ${error.message}`;
                              }
                              return (
                                <ColumnTeams
                                  teams={data.fetchTeams}
                                  teamidFunction={team => team}
                                />
                              );
                            }}
                          </Query>
                          <Query
                            query={fetchUsersOwnLicences}
                            variables={{ unitid: employee.id }}
                            fetchPolicy="network-only" //TODO make better
                          >
                            {({ loading, error, data }) => {
                              if (loading) {
                                return "Loading...";
                              }
                              if (error) {
                                return `Error! ${error.message}`;
                              }
                              return (
                                <ColumnServices
                                  services={data.fetchUsersOwnLicences}
                                  checkFunction={element =>
                                    !element.disabled &&
                                    !element.boughtplanid.planid.appid.disabled &&
                                    (element.endtime > now() || element.endtime == null)
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
                                />
                              );
                            }}
                          </Query>
                        </div>
                        <div className="tableEnd">
                          <div className="editOptions">
                            <i className="fal fa-external-link-alt editbuttons" />
                            <i
                              className="fal fa-trash-alt editbuttons"
                              onClick={e => {
                                e.stopPropagation();
                                this.setState({ willdeleting: employee.id });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  {this.state.add && (
                    <PopupBase
                      fullmiddle={true}
                      customStyles={{ maxWidth: "1152px" }}
                      close={() => this.setState({ add: false })}>
                      {this.addProcess(refetch)}
                    </PopupBase>
                  )}
                </div>
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
          <PopupBase
            fullmiddle={true}
            dialog={true}
            close={() => this.setState({ willdeleting: null })}
            closeable={false}>
            <p>Do you really want to delete the employee?</p>
            <UniversalButton type="low" closingPopup={true} label="Cancel" />
            <UniversalButton
              type="low"
              label="Delete"
              onClick={() =>
                this.setState(prevState => {
                  return { willdeleting: null, deleting: prevState.willdeleting };
                })
              }
            />
          </PopupBase>
        )}
        {this.state.deleting && (
          <Mutation mutation={DELETE_EMPLOYEE}>
            {deleteEmployee => (
              <PopupSelfSaving
                savingmessage="Deleting employee"
                savedmessage="Employee succesfully deleted"
                saveFunction={async () =>
                  await deleteEmployee({
                    variables: {
                      employeeid: this.state.deleting
                    },
                    refetchQueries: [{ query: fetchDepartmentsData }]
                  })
                }
                closeFunction={() =>
                  this.setState({
                    deleting: null
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
