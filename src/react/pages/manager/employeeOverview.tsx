import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Link } from "react-router-dom";
import { Query } from "react-apollo";
import {
  fetchDepartmentsData,
  fetchUsersOwnLicences,
  fetchTeams,
  fetchCompanyTeams
} from "../../queries/departments";
import { now } from "moment";
import AddEmployeePersonalData from "../../components/manager/addEmployeePersonalData";
import AddEmployeeTeams from "../../components/manager/addEmployeeTeams";
import PopupBase from "../../popups/universalPopups/popupBase";
import AddEmployeeServices from "../../components/manager/addEmployeeServices";

interface Props {
  moveTo: Function;
}

interface State {
  search: string;
  add: Boolean;
  addStage: number;
  addpersonal: Object;
  apps: { id: number; name: number; icon: string; needssubdomain: Boolean; options: Object }[];
}

class EmployeeOverview extends React.Component<Props, State> {
  state = {
    search: "",
    add: false,
    addpersonal: {},
    addStage: 1,
    apps: []
  };

  addUser(services) {
    this.setState({ apps: services, add: false });
  }

  renderSerives(services) {
    let sortedservices: any[] = [];
    services.forEach(element => {
      if (
        !element.disabled &&
        !element.boughtplanid.planid.appid.disabled &&
        (element.endtime > now() || element.endtime == null)
      ) {
        sortedservices.push(element);
      }
    });
    let serviceArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < sortedservices.length; counter++) {
      const service = sortedservices[counter];
      if (sortedservices.length > 6 && counter > 4) {
        serviceArray.push(
          <div
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{sortedservices.length - 5}
          </div>
        );
        break;
      } else {
        serviceArray.push(
          <div
            title={service.boughtplanid.planid.appid.name}
            className="managerSquare"
            style={
              service.boughtplanid.planid.appid.icon
                ? {
                    backgroundImage:
                      service.boughtplanid.planid.appid.icon.indexOf("/") != -1
                        ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                            service.boughtplanid.planid.appid.icon
                          )})`
                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                            service.boughtplanid.planid.appid.icon
                          )})`,
                    backgroundColor: "unset"
                  }
                : {}
            }>
            {service.boughtplanid.planid.appid.icon
              ? ""
              : service.boughtplanid.planid.appid.name.slice(0, 1)}
          </div>
        );
      }
    }
    return serviceArray;
  }

  renderTeams(teams) {
    //console.log("Inside", teams);
    let teamsArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < teams.length; counter++) {
      const team: {
        profilepicture: string;
        internaldata: { letters: string; color: string };
        name: string;
      } = teams[counter];
      if (teams.length > 6 && counter > 4) {
        teamsArray.push(
          <div
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{teams.length - 5}
          </div>
        );
        break;
      } else {
        teamsArray.push(
          <div
            title={team.name}
            className="managerSquare"
            style={
              team.profilepicture
                ? {
                    backgroundImage:
                      team.profilepicture.indexOf("/") != -1
                        ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                            team.profilepicture
                          )})`
                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                            team.profilepicture
                          )})`,
                    backgroundColor: "unset"
                  }
                : team.internaldata && team.internaldata.color
                ? { backgroundColor: team.internaldata.color }
                : {}
            }>
            {team.profilepicture
              ? ""
              : team.internaldata && team.internaldata.letters
              ? team.internaldata.letters
              : team.name.slice(0, 1)}
          </div>
        );
      }
    }
    return teamsArray;
  }

  addProcess() {
    switch (this.state.addStage) {
      case 1:
        return (
          <AddEmployeePersonalData
            continue={data => this.setState({ addpersonal: data, addStage: 2 })}
            close={() => this.setState({ add: false })}
            addpersonal={this.state.addpersonal}
          />
        );
      case 2:
        return (
          <AddEmployeeTeams
            continue={() => this.setState({ addStage: 3 })}
            close={() => this.setState({ addStage: 1 })}
          />
        );
      case 3:
        return (
          <AddEmployeeServices
            continue={data => this.addUser(data)}
            close={() => this.setState({ addStage: 2 })}
            apps={this.state.apps}
            addusername={this.state.addpersonal.name}
          />
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
              //console.log("Search", v);
              this.setState({ search: v });
            }}
          />
        </div>
        <div className="section">
          <div className="heading">
            <h1>Employees</h1>
          </div>
          <Query query={fetchDepartmentsData}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }
              //onsole.log("fetchDepartmentData", data);

              //Sort employees
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
                          this.setState({ add: true, addStage: 1, addpersonal: {}, apps: [] })
                        }
                      />
                    </div>
                  </div>
                  {employees.length > 0 &&
                    employees.map(employee => (
                      <div
                        className="tableRow"
                        onClick={() => this.props.moveTo(`emanager/${employee.id}`)}>
                        <div className="tableMain">
                          <div className="tableColumnBig">
                            <div
                              className="managerSquare"
                              style={
                                employee.profilepicture
                                  ? employee.profilepicture.indexOf("/") != -1
                                    ? {
                                        backgroundImage: encodeURI(
                                          `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                            employee.profilepicture
                                          )})`
                                        )
                                      }
                                    : {
                                        backgroundImage: encodeURI(
                                          `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                            employee.profilepicture
                                          })`
                                        )
                                      }
                                  : {}
                              }>
                              {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
                            </div>
                            <span className="name">
                              {employee.firstname} {employee.lastname}
                            </span>
                            <div
                              className="employeeOnline"
                              style={
                                employee.isonline
                                  ? { backgroundColor: "#29CC94" }
                                  : { backgroundColor: "#DB4D3F" }
                              }
                            />
                          </div>
                          <div className="tableColumnBig">
                            <Query query={fetchTeams} variables={{ userid: employee.id }}>
                              {({ loading, error, data }) => {
                                if (loading) {
                                  return "Loading...";
                                }
                                if (error) {
                                  return `Error! ${error.message}`;
                                }
                                //console.log("Teams", data);
                                return data.fetchTeams
                                  ? this.renderTeams(data.fetchTeams)
                                  : "No teams yet";
                              }}
                            </Query>
                            {/*<Query query={fetchCompanyTeams}>
                              {({ loading, error, data }) => {
                                if (loading) {
                                  return "Loading...";
                                }
                                if (error) {
                                  return `Error! ${error.message}`;
                                }
                                console.log("CompanyTeams", data);
                                return <div>CompanyTeams</div>;
                              }}
                            </Query>*/}
                          </div>
                          <div className="tableColumnBig">
                            <Query
                              query={fetchUsersOwnLicences}
                              variables={{ unitid: employee.id }}>
                              {({ loading, error, data }) => {
                                if (loading) {
                                  return "Loading...";
                                }
                                if (error) {
                                  return `Error! ${error.message}`;
                                }
                                //console.log("Services", data);
                                return data.fetchUsersOwnLicences
                                  ? this.renderSerives(data.fetchUsersOwnLicences)
                                  : "No services yet";
                              }}
                            </Query>
                          </div>
                        </div>
                        <div className="tableEnd">
                          <div className="editOptions">
                            <i className="fal fa-external-link-alt" />
                            <i className="fal fa-trash-alt" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              );
            }}
          </Query>
        </div>
        {this.state.add ? (
          <PopupBase
            fullmiddle={true}
            customStyles={{ maxWidth: "1152px" }}
            close={() => this.setState({ add: false })}>
            {this.addProcess()}
          </PopupBase>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default EmployeeOverview;
