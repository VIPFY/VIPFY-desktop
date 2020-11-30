import * as React from "react";
import gql from "graphql-tag";
import { Query } from "@apollo/client/react/components";
import { Button, ServiceLogo, Tag, PageHeader } from "@vipfy-private/vipfy-ui-lib";

import UniversalButton from "../../components/universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import ColumnEmployees from "../../components/manager/universal/columns/columnEmployee";
import AssignServiceToUser from "../../components/manager/universal/adding/assignServiceToUser";
import DeleteService from "../../components/manager/deleteService";
import { AppContext } from "../../common/functions";
import { WorkAround } from "../../interfaces";
import Table from "../../components/Table";

interface Props {
  moveTo: Function;
  history: any;
}

interface State {
  add: Boolean;
  willdeleting: number | null;
}

const COMPANY_SERVICES_OPTIONS = gql`
  query fetchCompanyServices {
    fetchCompanyServices {
      app {
        id
        name
        icon
        disabled
        options
      }
      orbitids {
        id
        alias
        buytime
        endtime
        accounts {
          id
          alias
          starttime
          endtime
          assignments {
            assignmentid
            starttime
            endtime
            unitid {
              id
              firstname
              lastname
              profilepicture
            }
          }
        }
        teams {
          id
          unitid {
            id
          }
          name
          profilepicture
        }
      }
    }
  }
`;

const headers = [
  {
    headline: "Service Name",
    sortable: true
  },
  {
    headline: "Teams"
  },
  {
    headline: "Users"
  },
  {
    headline: "Status",
    fraction: 3,
    sortable: true
  }
];

class ServiceOverview extends React.Component<Props, State> {
  state = {
    add: false,
    willdeleting: null
  };

  render() {
    const amountFakes = Math.random() * 10 + 1;
    const fakeData = [];

    for (let index = 0; index < amountFakes; index++) {
      fakeData.push({
        id: `fake-${index}`,
        cells: [
          {
            component: () => (
              <div style={{ display: "flex", alignItems: "center" }}>
                <ServiceLogo key={`fake-${index}`} size={32} />
                <span className="name"></span>
              </div>
            )
          },
          {
            component: () => (
              <ColumnTeams teams={[null]} teamidFunction={team => team.departmentid} fake={true} />
            )
          },
          {
            component: () => (
              <ColumnEmployees
                employees={[null]}
                employeeidFunction={e => e}
                checkFunction={e => true}
                fake={true}
              />
            )
          },
          {}
        ]
      });
    }
    return (
      <div className="page">
        <PageHeader
          title="Employee Manager"
          breadCrumbs={[
            { label: "Dashboard", to: "/area" },
            { label: "Employee Manager", to: "/area/emanager" }
          ]}
          buttonConfig={{
            label: "Add Service",
            onClick: () =>
              this.setState({
                add: true
              }),
            innerRef: "addServiceInManager",
            fAIcon: "fa-plus"
          }}
        />
        <div className="section" style={{ boxShadow: "0px 0px 0px" }}>
          <Query<WorkAround, WorkAround>
            pollInterval={60 * 10 * 1000 + 900}
            query={COMPANY_SERVICES_OPTIONS}>
            {({ loading, error, data }) => {
              if (loading) {
                return (
                  <Table
                    key="fake-table-loader"
                    title="Services"
                    headers={headers}
                    searchPlaceHolder="Search Services"
                    data={fakeData}
                  />
                );
              }
              if (error) {
                return <div>Error! {error.message}</div>;
              }

              const tabledata = [];
              let services = data.fetchCompanyServices || [];

              services.forEach(service => {
                // Remove VIPFY App
                if (
                  !service ||
                  !service.app ||
                  service.app.id == "aeb28408-464f-49f7-97f1-6a512ccf46c2"
                ) {
                  return;
                }
                let teamColumn = {};
                let employeeColumn = {};
                let statusColumn = {};

                if (service.app.options && service.app.options.pending) {
                  statusColumn = {
                    component: () => (
                      <Tag style={{ backgroundColor: "#FFC9BE", borderColor: "#FFC9BE" }}>
                        Pending
                      </Tag>
                    ),
                    searchText: "Pending"
                  };
                }

                let users = [];
                let teams = [];

                if (service.orbitids[0]) {
                  service.orbitids.forEach(orbit => {
                    if (orbit.accounts && orbit.accounts[0]) {
                      orbit.accounts.forEach(account => {
                        if (account.assignments && account.assignments[0]) {
                          account.assignments.forEach(assignment => {
                            if (assignment) {
                              if (!users.find(u => u.id == assignment.unitid.id)) {
                                users.push({
                                  id: assignment.unitid.id,
                                  firstname: assignment.unitid.firstname,
                                  lastname: assignment.unitid.lastname,
                                  profilepicture: assignment.unitid.profilpicture
                                });
                              }
                            }
                          });
                        }
                      });
                    }
                    if (orbit.teams && orbit.teams[0]) {
                      orbit.teams.forEach(team => {
                        if (!teams.find(t => t.id == team.unitid.id)) {
                          teams.push({
                            id: team.unitid.id,
                            name: team.name,
                            profilpicture: team.profilpicture
                          });
                        }
                      });
                    }
                  });
                }

                teamColumn = {
                  component: () => (
                    <ColumnTeams
                      {...this.props}
                      teams={teams}
                      teamidFunction={team => team}
                      fake={false}
                    />
                  )
                };

                employeeColumn = {
                  component: () => (
                    <ColumnEmployees
                      {...this.props}
                      employees={users}
                      employeeidFunction={e => e}
                      checkFunction={e => true}
                      fake={false}
                    />
                  )
                };

                tabledata.push({
                  id: service.app.id,
                  onClick: () => this.props.moveTo(`lmanager/${service.app.id}`),
                  cells: [
                    {
                      component: () => (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <ServiceLogo key={service.app.id} icon={service.app.icon} size={32} />
                          <span className="name">{service.app.name}</span>
                        </div>
                      ),
                      searchableText: service.app.name
                    },
                    teamColumn,
                    employeeColumn,
                    statusColumn
                  ]
                });
              });

              return (
                <>
                  <Table
                    key="Table"
                    title="Services"
                    headers={headers}
                    searchPlaceHolder="Search Services"
                    data={tabledata}
                    actionButtonComponent={id => (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {/*<Button
                          label="Assign to User/Team"
                          onClick={() => console.log("ASSIGN User/Team", id)}
                          fAIcon="fa-user-plus"
                        />
                        <Button
                          label="Remove from User/Team"
                          onClick={() => console.log("Remove User/Team", id)}
                          fAIcon="fa-user-minus"
                        />*/}
                        <Button
                          label="Delete Service"
                          onClick={() => this.setState({ willdeleting: id })}
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
                          innerRef={el => addRenderElement({ key: "addServicePopup", element: el })}
                          small={true}
                          nooutsideclose={true}
                          close={() => this.setState({ add: false })}
                          additionalclassName="assignNewAccountPopup"
                          buttonStyles={{ justifyContent: "space-between" }}>
                          <h1>Choose Service</h1>
                          <AssignServiceToUser
                            continue={app => app && this.props.moveTo(`lmanager/${app.id}`)}
                            moveTo={this.props.moveTo}
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
            serviceid={this.state.willdeleting}
            close={() => this.setState({ willdeleting: null })}
          />
        )}
      </div>
    );
  }
}
export default ServiceOverview;
