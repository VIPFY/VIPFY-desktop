import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import ServiceDetails from "../../components/manager/serviceDetails";
import { Query } from "react-apollo";
import { fetchUserLicences } from "../../queries/departments";
import { now } from "moment";
import { QUERY_SEMIPUBLICUSER } from "../../queries/user";

interface Props {}

interface State {}

class EmployeeDetails extends React.Component<Props, State> {
  state = {};

  employeeDetails = {
    name: "Nils Vossebein",
    online: true,
    picture: "02112018-np3ag-markus-mueller-jpeg",
    teams: [
      {
        name: "Marketing",
        color: "#5D76FF",
        begin: "05.02.2018",
        ending: "open",
        price: "5$/Month",
        usage: 20
      },
      {
        name: "Management",
        short: "MA",
        color: "#9C13BC",
        begin: "05.02.2018",
        ending: "open",
        price: "5$/Month",
        usage: 20
      }
    ]
  };
  render() {
    return (
      <div className="managerPage">
        <div className="heading">
          <h1>
            Employee Manager<h2>></h2>
            <h2>Nils Vossebein</h2>
          </h1>

          <UniversalSearchBox />
        </div>
        <Query query={QUERY_SEMIPUBLICUSER} variables={{ unitid: 22 }}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }
            const querydata = data.adminme;
            return (
              <div className="section">
                <div className="heading">
                  <h1>Personal Data</h1>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div
                      className="profilepicture"
                      style={
                        querydata.profilepicture
                          ? querydata.profilepicture.indexOf("/") != -1
                            ? {
                                backgroundImage: `https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                  querydata.profilepicture
                                )}`
                              }
                            : {
                                backgroundImage: encodeURI(
                                  `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                    querydata.profilepicture
                                  })`
                                )
                              }
                          : {}
                      }
                    />
                    <div
                      className="status"
                      style={{
                        backgroundColor: querydata.isonline ? "#29CC94" : "#DB4D3F"
                      }}>
                      {querydata.isonline ? "Online" : "Offline"}
                    </div>
                  </div>
                  <div style={{ width: "calc(100% - 176px - (100% - 160px - 5*176px)/4)" }}>
                    <div className="table">
                      <div className="tableRow" style={{ height: "80px" }}>
                        <div className="tableMain">
                          <div className="tableColumnSmall">
                            <h1>Name</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Birthday</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Address</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Phone Privat</h1>
                          </div>
                        </div>
                        <div className="tableEnd">
                          <div className="editOptions">
                            <i className="fal fa-edit" />
                            <i className="fal fa-trash-alt" />
                          </div>
                        </div>
                      </div>
                      <div className="tableRow" style={{ height: "80px" }}>
                        <div className="tableMain">
                          <div className="tableColumnSmall">
                            <h1>Department</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Position</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Phone Work</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Email</h1>
                          </div>
                        </div>
                        <div className="tableEnd">
                          <div className="editOptions">
                            <i className="fal fa-edit" />
                            <i className="fal fa-trash-alt" />
                          </div>
                        </div>
                      </div>
                      <div className="tableRow" style={{ height: "80px" }}>
                        <div className="tableMain">
                          <div className="tableColumnSmall">
                            <h1>Hiredate</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Terminate</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Boss</h1>
                          </div>
                          <div className="tableColumnSmall">
                            <h1>Directly Reports</h1>
                          </div>
                        </div>
                        <div className="tableEnd">
                          <div className="editOptions">
                            <i className="fal fa-edit" />
                            <i className="fal fa-trash-alt" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        </Query>
        <div className="section">
          <div className="heading">
            <h1>Licences</h1>
          </div>
          <div className="table">
            <div className="tableHeading">
              <div className="tableMain">
                <div className="tableColumnSmall">
                  <h1>App</h1>
                </div>
                <div className="tableColumnSmall">
                  <h1>Beginning</h1>
                </div>
                <div className="tableColumnSmall">
                  <h1>Ending</h1>
                </div>
                <div className="tableColumnSmall">
                  <h1>Price</h1>
                </div>
                <div className="tableColumnSmall">
                  <h1>Usage/Day</h1>
                </div>
              </div>
              <div className="tableEnd">
                <UniversalButton
                  type="high"
                  label="Add Licence"
                  customStyles={{
                    fontSize: "12px",
                    lineHeight: "24px",
                    fontWeight: "700",
                    marginRight: "16px",
                    width: "92px"
                  }}
                />
              </div>
            </div>
            <Query query={fetchUserLicences} variables={{ unitid: 22 }} fetchPolicy="network-only">
              {({ loading, error, data }) => {
                if (loading) {
                  return "Loading...";
                }
                if (error) {
                  return `Error! ${error.message}`;
                }
                let appArray: JSX.Element[] = [];

                if (data.fetchUsersOwnLicences) {
                  console.log("D", data.fetchUsersOwnLicences);
                  data.fetchUsersOwnLicences.sort(function(a, b) {
                    let nameA = a.boughtplanid.alias
                      ? a.boughtplanid.alias.toUpperCase()
                      : a.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
                    let nameB = b.boughtplanid.alias
                      ? b.boughtplanid.alias.toUpperCase()
                      : b.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                      return -1;
                    }
                    if (nameA > nameB) {
                      return 1;
                    }

                    // namen müssen gleich sein
                    return 0;
                  });
                  data.fetchUsersOwnLicences.forEach((e, k) => {
                    if (
                      !e.disabled &&
                      !e.boughtplanid.planid.appid.disabled &&
                      (e.endtime > now() || e.endtime == null)
                    ) {
                      appArray.push(
                        <ServiceDetails e={e} employeeid={22} employeename="Nils Vossebein" />
                      );
                    }
                  });
                  return appArray;
                }
              }}
            </Query>
          </div>
        </div>
        <div className="section">
          <div className="heading">
            <h1>Teams</h1>
          </div>
          <div className="table">
            <div className="tableHeading">
              <div className="tableMain">
                <div className="tableColumnSmall">
                  <h1>Team</h1>
                </div>
                <div className="tableColumnSmall">
                  <h1>Beginning</h1>
                </div>
                <div className="tableColumnSmall">
                  <h1>Ending</h1>
                </div>
                <div className="tableColumnSmall">
                  <h1>Price</h1>
                </div>
                <div className="tableColumnSmall">
                  <h1>Usage</h1>
                </div>
              </div>
              <div className="tableEnd">
                <UniversalButton
                  type="high"
                  label="Add Team"
                  customStyles={{
                    fontSize: "12px",
                    lineHeight: "24px",
                    fontWeight: "700",
                    marginRight: "16px",
                    width: "92px"
                  }}
                />
              </div>
            </div>
            {this.employeeDetails.teams.map(team => (
              <div className="tableRow">
                <div className="tableMain">
                  <div className="tableColumnSmall">
                    <div
                      className="managerSquare"
                      style={team.color ? { backgroundColor: team.color } : {}}>
                      {team.short || team.name.slice(0, 1)}
                    </div>
                    <span className="name">{team.name}</span>
                  </div>
                  <div className="tableColumnSmall content">{team.begin}</div>
                  <div className="tableColumnSmall content">{team.ending}</div>
                  <div className="tableColumnSmall content">{team.price}</div>
                  <div className="tableColumnSmall content">{team.usage}</div>
                </div>
                <div className="tableEnd">
                  <div className="editOptions">
                    <i className="fal fa-edit" />
                    <i className="fal fa-trash-alt" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
export default EmployeeDetails;
