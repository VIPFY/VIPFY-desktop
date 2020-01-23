import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchDepartmentsData, fetchUserLicences, fetchTeams } from "../../queries/departments";
import { now } from "moment";
import AddEmployeePersonalData from "../../components/manager/addEmployeePersonalData";
import PopupBase from "../../popups/universalPopups/popupBase";
import gql from "graphql-tag";
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import PrintEmployeeSquare from "../../components/manager/universal/squares/printEmployeeSquare";
import { AppContext } from "../../common/functions";
import DeleteUser from "../../components/manager/deleteUser";

interface Props {
  moveTo: Function;
  isadmin?: boolean;
}

interface State {
  search: string;
  sort: string;
  sortforward: boolean;
  add: Boolean;
  willdeleting: number | null;
}

class EmployeeOverview extends React.Component<Props, State> {
  state = {
    search: "",
    sort: "Name",
    sortforward: true,
    add: false,
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

  loading() {
    const amountFakes = Math.random() * 10 + 1;
    const fakeArray: JSX.Element[] = [];

    for (let index = 0; index < amountFakes; index++) {
      fakeArray.push(
        <div className="tableRow" key={`trl-${index}`}>
          <div className="tableMain">
            <div className="tableColumnBig" style={{ width: "20%" }}>
              <PrintEmployeeSquare employee={{}} fake={true} />
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
          <AppContext.Consumer>
            {({ addRenderElement }) => {
              return (
                <div className="heading">
                  <h1>Employees</h1>
                  <UniversalButton
                    innerRef={el => addRenderElement({ key: "addEmp", element: el })}
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
                        add: true
                      })
                    }
                  />
                </div>
              );
            }}
          </AppContext.Consumer>
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
                      <div className="tableEnd"></div>
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
                        <div className="tableColumnBig" style={{ width: "20%" }}>
                          <h1>Teams</h1>
                        </div>
                        <div className="tableColumnBig" style={{ width: "30%" }}>
                          <h1>Services</h1>
                        </div>
                      </div>
                      <div className="tableEnd"></div>
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
                                      services={data.fetchUserLicenceAssignments}
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
                                    services={data.fetchUserLicenceAssignments}
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
                                    this.setState({ willdeleting: employee });
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {this.state.add && (
                    <AppContext.Consumer>
                      {({ addRenderElement }) => (
                        <PopupBase
                          innerRef={el => addRenderElement({ key: "addEmpPopup", element: el })}
                          small={true}
                          close={() => this.setState({ add: false })}
                          nooutsideclose={true}
                          additionalclassName="formPopup deletePopup">
                          <AddEmployeePersonalData
                            continue={data => {
                              this.setState({ add: false });
                              this.props.moveTo(`emanager/${data.unitid}`);
                            }}
                            close={() => {
                              this.setState({ add: false });
                              refetch();
                            }}
                            isadmin={this.props.isadmin}
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
          <DeleteUser
            user={this.state.willdeleting}
            close={() => this.setState({ willdeleting: null })}
          />
        )}
      </div>
    );
  }
}
export default EmployeeOverview;
