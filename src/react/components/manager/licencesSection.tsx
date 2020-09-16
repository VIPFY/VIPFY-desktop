import * as React from "react";
import { Query } from "@apollo/client/react/components";
import moment from "moment";
import UniversalButton from "../../components/universalButtons/universalButton";
import ServiceDetails from "../../components/manager/serviceDetails";
import { fetchUserLicences } from "../../queries/departments";
import AssignNewAccount from "./universal/adding/assignNewAccount";

interface Props {
  employeeid: number;
  employeename: string;
  moveTo: Function;
  employee: any;
  isadmin: Boolean;
}

interface State {
  add: Boolean;
}

class LicencesSection extends React.Component<Props, State> {
  state = {
    add: false
  };

  render() {
    const employeeid = this.props.employeeid;
    return (
      <Query
        pollInterval={60 * 10 * 1000 + 1000}
        query={fetchUserLicences}
        variables={{ unitid: employeeid }}>
        {({ loading, error = null, data, refetch }) => {
          if (loading) {
            return <div>Loading...</div>;
          }
          if (error) {
            return <div>Error! {error.message}</div>;
          }
          let appArray: JSX.Element[] = [];

          if (data.fetchUserLicenceAssignments) {
            [...data.fetchUserLicenceAssignments].sort(function (a, b) {
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
            }).forEach((e, k) => {
              if (
                !e.disabled &&
                !e.boughtplanid.planid.appid.disabled &&
                (moment(e.endtime).isAfter() || e.endtime == null) &&
                (moment(e.boughtplanid.endtime).isAfter() || e.boughtplanid.endtime == null)
              ) {
                appArray.push(
                  <ServiceDetails
                    key={e.id}
                    e={e}
                    employeeid={employeeid}
                    employeename={this.props.employeename}
                    moveTo={this.props.moveTo}
                    employee={this.props.employee}
                    isadmin={this.props.isadmin}
                  />
                );
              }
            });

            return (
              <div className="section" key="Licences">
                <div className="heading">
                  <h1>Assigned Accounts</h1>
                  {this.props.isadmin && (
                    <UniversalButton
                      type="high"
                      label="Assign Account"
                      customStyles={{
                        fontSize: "12px",
                        lineHeight: "24px",
                        fontWeight: "700",
                        marginRight: "16px",
                        width: "120px"
                      }}
                      onClick={() => this.setState({ add: true })}
                    />
                  )}
                </div>
                <div className="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      {/*<div className="tableColumnSmall">
                        <h1>App</h1>
                  </div>*/}
                      <div className="tableColumnBig">
                        <h1>Orbit</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Status</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Accountalias</h1>
                      </div>
                      <div className="tableColumnSmall">
                        {this.props.isadmin && <h1>Usage last 4 weeks</h1>}
                      </div>
                      <div className="tableColumnSmall">{/*<h1>Price</h1>*/}</div>
                    </div>
                    {/*<div style={{ width: "18px", display: "flex", alignItems: "center" }}></div>*/}
                    <div className="tableEnd"></div>
                  </div>
                  {appArray}
                </div>
                {this.state.add && (
                  <AssignNewAccount
                    close={() => this.setState({ add: false })}
                    employee={this.props.employee}
                    refetch={refetch}
                    moveTo={this.props.moveTo}
                  />
                )}
              </div>
            );
          }
          return null;
        }}
      </Query>
    );
  }
}
export default LicencesSection;
