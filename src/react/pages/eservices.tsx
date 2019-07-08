import * as React from "react";
import { Query } from "react-apollo";
import { fetchUserLicences } from "../queries/departments";
import { now } from "moment";
import gql from "graphql-tag";
import moment = require("moment");
import humanizeDuration = require("humanize-duration");
import { AppContext } from "../common/functions";
import RemoveLicence from "../popups/removeLicence";
import ErrorPopup from "../popups/errorPopup";

interface Props {
  employeeid: number;
  employeename: string;
}

interface State {
  show: Boolean;
}

class EServices extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = () => {
    this.setState(prevState => {
      return { show: !prevState.show };
    });
  };

  render() {
    const servicedata = {};
    return (
      <AppContext.Consumer>
        {context => {
          console.log("context", context);

          return (
            <div className="genericHolder egeneral">
              <div className="header" onClick={() => this.toggle()}>
                <i
                  className={`button-hide fas ${
                    this.state.show ? "fa-angle-left" : "fa-angle-down"
                  }`}
                  //onClick={this.toggle}
                />
                <span>Assigned Services</span>
              </div>
              <div className={`inside ${this.state.show ? "in" : "out"}`}>
                <div className="inside-padding">
                  <div className="appExplain">
                    <div className="heading">Apps:</div>
                    <div className="heading">Teamname:</div>
                    <div className="heading">Used since</div>
                    <div className="heading">Average usage</div>
                    <div className="heading">Remove Licence</div>
                  </div>
                  <Query
                    query={fetchUserLicences}
                    variables={{ unitid: this.props.employeeid }}
                    fetchPolicy="network-only">
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
                        data.fetchUsersOwnLicences.forEach((e, k) => {
                          if (!e.disabled && (e.endtime > now() || e.endtime == null)) {
                            appArray.push(
                              <div className="appExplain" key={k}>
                                <div
                                  className="box28"
                                  style={{
                                    marginRight: "5px",
                                    backgroundImage: `url('https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                                      e.boughtplanid.planid.appid.icon
                                    }')`
                                  }}
                                />
                                <div>
                                  {e.boughtplanid.alias || e.boughtplanid.planid.appid.name}
                                </div>
                                <div>{moment(e.starttime - 0).format("DD.MM.YYYY")}</div>
                                <Query
                                  query={gql`
                                    query fetchBoughtplanUsagePerUser(
                                      $starttime: Date!
                                      $endtime: Date!
                                      $boughtplanid: ID!
                                    ) {
                                      fetchBoughtplanUsagePerUser(
                                        starttime: $starttime
                                        endtime: $endtime
                                        boughtplanid: $boughtplanid
                                      ) {
                                        unit {
                                          id
                                          firstname
                                          middlename
                                          lastname
                                          title
                                          profilepicture
                                        }
                                        totalminutes
                                      }
                                    }
                                  `}
                                  variables={{
                                    starttime: moment()
                                      .subtract(4, "weeks")
                                      .format("LLL"),
                                    endtime: moment().format("LLL"),
                                    boughtplanid: e.boughtplanid.id
                                  }}>
                                  {({ data, loading, error }) => {
                                    if (loading) {
                                      return <div>Loading</div>;
                                    }
                                    if (error) {
                                      return <div>Error fetching data</div>;
                                    }
                                    if (data) {
                                      console.log(data);
                                      return (
                                        <React.Fragment>
                                          <div>
                                            {(data.fetchBoughtplanUsagePerUser.find(
                                              e => e.unit.id == 22
                                            ) &&
                                              `${humanizeDuration(
                                                (data.fetchBoughtplanUsagePerUser.find(
                                                  e => e.unit.id == 22
                                                ).totalminutes *
                                                  60 *
                                                  1000) /
                                                  28,
                                                { largest: 1, round: true }
                                              )} per Day`) ||
                                              "Not used at all"}
                                          </div>
                                          <button
                                            className="naked-button genericButton"
                                            onClick={() =>
                                              context.showPopup({
                                                show: true,
                                                header: `Remove licence of ${
                                                  e.boughtplanid.planid.appid.name
                                                }`,
                                                body: RemoveLicence,
                                                props: {
                                                  licenceid: e.id,
                                                  userid: this.props.employeeid,
                                                  appname: e.boughtplanid.planid.appid.name,
                                                  username: `${e.unitid.firstname} ${
                                                    e.unitid.lastname
                                                  }`,
                                                  teamname: e.boughtplanid.alias,
                                                  newuserid: null,
                                                  newusername: null,
                                                  external: true,
                                                  moveLicence: null,
                                                  departmentId: 14,
                                                  remove: null
                                                }
                                              })
                                            }>
                                            Remove Licence
                                          </button>
                                        </React.Fragment>
                                      );
                                    }
                                  }}
                                </Query>
                              </div>
                            );
                          }
                        });
                        return appArray;
                      }
                    }}
                  </Query>

                  <div className="appExplain">
                    <button
                      className="naked-button genericButton box28"
                      style={{ padding: "0px" }}
                      onClick={() =>
                        context.showPopup({
                          show: true,
                          header: `Add a service to ${this.props.employeename}`,
                          body: ErrorPopup,
                          props: {
                            sentence: "OK"
                          }
                        })
                      }>
                      <i className="far fa-plus box28" style={{ lineHeight: "28px" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </AppContext.Consumer>
    );
  }
}

export default EServices;
