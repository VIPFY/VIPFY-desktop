import * as React from "react";
import { Query } from "@apollo/client/react/components";
import moment, { now } from "moment";
import { Button, StarRating } from "@vipfy-private/vipfy-ui-lib";
import { fetchDepartmentsData, fetchUserLicences, fetchTeams } from "../../queries/departments";
import AddEmployeePersonalData from "../../components/manager/addEmployeePersonalData";
import PopupBase from "../../popups/universalPopups/popupBase";
import ColumnServices from "../../components/manager/universal/columns/columnServices";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import { AppContext } from "../../common/functions";
import DeleteUser from "../../components/manager/deleteUser";
import { concatName } from "../../common/functions";
import Table from "../../components/Table";
import PageHeader from "../../components/PageHeader";
import Tag from "../../common/Tag";
import { ThingPicture, ThingState, ThingShape, ThingType, UserPicture } from "../../components/ThingPicture";

interface Props {
  moveTo: Function;
  isadmin?: boolean;
}

interface State {
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
                <ThingPicture type={ThingType.User} state={ThingState.Loading} size={32} name="Loading" />
                <span className="name" />
              </div>
            )
          },
          {
            component: () => (
              <div>
                {Math.random() > 0.5 && (
                  <Tag
                    style={{
                      backgroundColor: "#F5F7F9",
                      borderColor: "#F5F7F9",
                      width: "50px"
                    }}></Tag>
                )}
              </div>
            )
          },
          {
            component: () => (
              <div>
                <StarRating stars={Math.round(Math.random() * 4)} maxStars={4} />
              </div>
            )
          },
          {
            component: () => (
              <ColumnTeams {...this.props} teams={[]} teamidFunction={team => team} fake={true} />
            )
          },
          {
            component: () => (
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
            )
          }
        ]
      });
    }

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
                    data={fakeData}
                  />
                );
              }

              if (error) {
                return <div>Error: {error.message}</div>;
              }

              let employees: any[] = [];
              if (data.fetchDepartmentsData && data.fetchDepartmentsData[0].children_data) {
                employees = data.fetchDepartmentsData[0].children_data.filter(e => e && e.id);
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
                      {e.passwordstrength === null ? (
                        "unknown"
                      ) : (
                          <StarRating stars={e.passwordstrength} maxStars={4} />
                        )}
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
                          <UserPicture id={e.id} shape={ThingShape.Circle} size={32} />
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
