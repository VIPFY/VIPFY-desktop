import * as React from "react";
import { Query } from "react-apollo";
import { fetchDepartmentsData } from "../../queries/departments";
import { now } from "moment";
import AddEmployeePersonalData from "../../components/manager/addEmployeePersonalData";
import PopupBase from "../../popups/universalPopups/popupBase";
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import EmployeePicture from "../../components/EmployeePicture";
import { AppContext } from "../../common/functions";
import DeleteUser from "../../components/manager/deleteUser";
import { concatName } from "../../common/functions";
import Table from "../../components/Table";
import { WorkAround } from "../../interfaces";
import PageHeader from "../../components/PageHeader";

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
    headline: "Status",
    sortable: true
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
      <div className="managerPage">
        <PageHeader
          title="Employee Manager"
          buttonConfig={{
            label: "Create Employee",
            onClick: () => console.log("TEST"),
            icon: "plus"
          }}
          searchConfig={{
            text: "Search Employees",
            searchValue: v => this.setState({ search: v })
          }}
        />
        <div className="section" style={{ boxShadow: "0px 0px 0px" }}>
          <Query<WorkAround, WorkAround> query={fetchDepartmentsData} fetchPolicy="network-only">
            {({ loading, error = null, data, refetch }) => {
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
                        <div className="tableColumnBig" style={{ width: "20%" }}>
                          <h1>Teams</h1>
                        </div>
                        <div className="tableColumnBig" style={{ width: "30%" }}>
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
              employees.forEach(e =>
                tabledata.push({
                  id: e.id,
                  cells: [
                    {
                      component: (
                        <div>
                          <span className="name" title={concatName(e)}>
                            {e.firstname} {e.lastname}
                          </span>
                        </div>
                      ),
                      searchableText: concatName(e)
                    },
                    {
                      component: (
                        <div
                          className="status"
                          style={
                            e.isonline
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
                          {e.isonline ? "Online" : "Offline"}
                        </div>
                      ),
                      searchableText: e.isonline ? "Online" : "Offline"
                    },
                    {
                      component: <div>teams</div>
                    },
                    {
                      component: <div>Services</div>
                    }
                  ]
                })
              );
              return (
                <>
                  <Table
                    title="Employer"
                    headers={headers}
                    data={tabledata}
                    actionButtonComponent={id => (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <a onClick={() => console.log("CLICKED 1", id)}>Click 1</a>
                        <a onClick={() => confirm(`Really 2 ${id}`)}>Click 2</a>
                      </div>
                    )}></Table>

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
