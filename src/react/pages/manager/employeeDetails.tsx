import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import ServiceDetails from "../../components/manager/serviceDetails";
import { Query } from "react-apollo";
import { fetchUserLicences } from "../../queries/departments";
import { now } from "moment";
import { QUERY_SEMIPUBLICUSER } from "../../queries/user";
import LicencesSection from "../../components/manager/licencesSection";
import PersonalDetails from "../../components/manager/personalDetails";
import TeamsSection from "../../components/manager/teamsSection";

interface Props {
  moveTo: Function;
}

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
    const employeeid = this.props.match.params.userid;
    console.log("EID", this.props, employeeid);
    return (
      <Query query={QUERY_SEMIPUBLICUSER} variables={{ unitid: employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          const querydata = data.adminme;

          const privatePhones = [];
          const workPhones = [];

          querydata.phones.forEach(phone =>
            phone && phone.tags && phone.tags[0] == ["private"]
              ? privatePhones.push(phone)
              : workPhones.push(phone)
          );
          querydata.workPhones = workPhones;
          querydata.privatePhones = privatePhones;
          console.log("phones", querydata.phones, querydata.workPhones, querydata.privatePhones);
          return (
            <div className="managerPage">
              <div className="heading">
                <h1>
                  <span style={{ cursor: "pointer" }} onClick={() => this.props.moveTo("emanager")}>
                    Employee Manager
                  </span>
                  <h2>></h2>
                  <h2>
                    {querydata.firstname} {querydata.lastname}
                  </h2>
                </h1>

                <UniversalSearchBox />
              </div>
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
                                backgroundImage: encodeURI(
                                  `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                                    querydata.profilepicture
                                  )})`
                                )
                              }
                            : {
                                backgroundImage: encodeURI(
                                  `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                    querydata.profilepicture
                                  })`
                                )
                              }
                          : {}
                      }>
                      <div className="imagehover">
                        <i className="fal fa-camera" />
                        <span>Upload</span>
                      </div>
                    </div>
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
                      <PersonalDetails querydata={querydata} />
                    </div>
                  </div>
                </div>
              </div>
              <TeamsSection
                employeeid={employeeid}
                employeename={`${querydata.firstname} ${querydata.lastname}`}
              />
              <LicencesSection employeeid={employeeid} />
            </div>
          );
        }}
      </Query>
    );
  }
}
export default EmployeeDetails;
