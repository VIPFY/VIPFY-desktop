import * as React from "react";
import { Query } from "@apollo/client/react/components";
import moment, { now } from "moment";
import { Button } from "@vipfy-private/vipfy-ui-lib";
import { fetchDepartmentsData, fetchUserLicences, fetchTeams } from "../../queries/departments";
import AddEmployeePersonalData from "../../components/manager/addEmployeePersonalData";
import PopupBase from "../../popups/universalPopups/popupBase";
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import EmployeePicture from "../../components/EmployeePicture";
import { AppContext, showStars } from "../../common/functions";
import DeleteUser from "../../components/manager/deleteUser";
import { concatName } from "../../common/functions";
import Table from "../../components/Table";
import PageHeader from "../../components/PageHeader";
import Tag from "../../common/Tag";

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

const headers = [
  {
    headline: "Name",
    sortable: true
  },
  {
    headline: "Last Active",
    sortable: true,
    fraction: 3
  },
  {
    headline: "Security",
    fraction: 3
  },
  {
    headline: "Teams"
  },
  {
    headline: "Services"
  }
];

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
              <EmployeePicture employee={{}} fake={true} />
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
      <div className="page">
        <PageHeader
          title="Employee Manager"
          buttonConfig={{
            label: "Create Employee",
            onClick: () => this.setState({ add: true }),
            innerRef: "addEmp",
            fAIcon: "fa-user-plus"
          }}
        />
        <div className="section" style={{ boxShadow: "0px 0px 0px" }}>
          <Query query={fetchDepartmentsData} fetchPolicy="network-only">
            {({ loading, error = null, data, refetch }) => {
              if (loading) {
                return (
                  <Table
                    key="fake-table-loader"
                    title="Employer"
                    headers={headers}
                    searchPlaceHolder="Search Employees"
                    data={[]}
                  />
                );
              }

              if (error) {
                return <div>Error: {error.message}</div>;
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
                    interemployees.sort(function (a, b) {
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
                    interemployees.sort(function (a, b) {
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
                      let nameA = moment(a.lastactive).isValid()
                        ? moment(a.lastactive).toISOString()
                        : "";
                      let nameB = moment(b.lastactive).isValid()
                        ? moment(b.lastactive).toISOString()
                        : "";
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

              const tabledata = [];
              employees.forEach(e => {
                let lastActiveColumn = {};
                let securityColumn = {};
                let teamColumn = {};
                let serviceColumn = {};

                if (moment(e.lastactive).add(5, "m").isSameOrAfter()) {
                  lastActiveColumn = {
                    component: () => (
                      <Tag
                        style={{
                          backgroundColor: "#29CC94",
                          borderColor: "#29CC94",
                          color: "white"
                        }}
                        tooltip={e.lastactive}>
                        Online
                      </Tag>
                    ),
                    searchableText: moment(e.lastactive).toISOString()
                  };
                } else {
                  lastActiveColumn = {
                    component: () => (
                      <div>
                        {moment(e.lastactive).isValid() ? (
                          <Tag
                            tooltip={moment(e.lastactive).format("dddd, MMMM Do YYYY, h:mm:ss a")}>
                            {moment(e.lastactive).fromNow()}
                          </Tag>
                        ) : (
                          <Tag style={{ backgroundColor: "#C9D1DA" }}>Never</Tag>
                        )}
                      </div>
                    ),
                    searchableText: moment(e.lastactive).isValid()
                      ? moment(e.lastactive).toISOString()
                      : moment("2018-10-01").toISOString()
                  };
                }
                securityColumn = {
                  component: () => (
                    <div title={`Password Length: ${e.passwordlength}`}>
                      {e.passwordstrength === null ? "unknown" : showStars(e.passwordstrength, 4)}
                    </div>
                  ),
                  searchableText: e.passwordstrength.toString()
                };

                teamColumn = {
                  component: () => (
                    <Query query={fetchTeams} variables={{ userid: e.id }}>
                      {({ loading, error = null, data }) => {
                        if (loading) {
                          return (
                            <ColumnTeams
                              {...this.props}
                              teams={[]}
                              teamidFunction={team => team}
                              fake={true}
                            />
                          );
                        }
                        if (error) {
                          return <div>Error! {error.message}</div>;
                        }
                        return (
                          <ColumnTeams
                            {...this.props}
                            teams={data.fetchTeams}
                            teamidFunction={team => team}
                            fake={false}
                          />
                        );
                      }}
                    </Query>
                  )
                };

                serviceColumn = {
                  component: () => (
                    <Query query={fetchUserLicences} variables={{ unitid: e.id }}>
                      {({ loading, error = null, data }) => {
                        if (loading) {
                          return (
                            <ColumnServices
                              {...this.props}
                              services={[]}
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
                          return <div>Error! {error.message}</div>;
                        }
                        return (
                          <ColumnServices
                            {...this.props}
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
                            unitid={e.id}
                          />
                        );
                      }}
                    </Query>
                  )
                };

                tabledata.push({
                  id: e.id,
                  onClick: () => this.props.moveTo(`emanager/${e.id}`),
                  cells: [
                    {
                      component: () => (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <EmployeePicture employee={e} circle={true} />
                          <span className="name" title={concatName(e)}>
                            {e.firstname} {e.lastname}
                          </span>
                        </div>
                      ),
                      searchableText: concatName(e)
                    },
                    lastActiveColumn,
                    securityColumn,
                    teamColumn,
                    serviceColumn
                  ]
                });
              });
              return (
                <>
                  <Table
                    key="Table"
                    title="Employer"
                    headers={headers}
                    searchPlaceHolder="Search Employees"
                    data={tabledata}
                    actionButtonComponent={id => (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Button
                          label="Assign to Service"
                          onClick={() => console.log("ASSIGN SERVICE", id)}
                          fAIcon="fa-file-plus"
                        />
                        <Button
                          label="Remove from Service"
                          onClick={() => console.log("Remove SERVICE", id)}
                          fAIcon="fa-file-minus"
                        />
                        <Button
                          label="Assign to Team"
                          onClick={() => console.log("ASSIGN Team", id)}
                          fAIcon="fa-user-plus"
                        />
                        <Button
                          label="Remove from Team"
                          onClick={() => console.log("Remove Team", id)}
                          fAIcon="fa-user-minus"
                        />
                        <Button
                          label="Remove Employee"
                          onClick={() => console.log("Remove Team", id)}
                          fAIcon="fa-trash-alt"
                        />
                      </div>
                    )}
                    actionTagButtonComponent={id => (
                      <div className="table-header-action-buttons">
                        <p
                          className="tag tag-table-header-buttons"
                          onClick={() => console.log("choosen ids", id)}>
                          Delete
                        </p>
                        <p
                          className="tag tag-table-header-buttons"
                          onClick={() => console.log("choosen ids", id)}>
                          Insert
                        </p>
                      </div>
                    )}
                  />
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
