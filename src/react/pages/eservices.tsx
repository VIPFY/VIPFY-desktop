import * as React from "react";
import { Query } from "react-apollo";
import { fetchUsersOwnLicences } from "../queries/departments";
import { now } from "moment";
import gql from "graphql-tag";
import moment = require("moment");
import humanizeDuration = require("humanize-duration");

interface Props {}

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
      <div className="genericHolder egeneral">
        <div className="header" onClick={() => this.toggle()}>
          <i
            className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
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
              query={fetchUsersOwnLicences}
              variables={{ unitid: 22 }}
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
                          <div>{e.boughtplanid.alias}</div>
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
                                  <div>
                                    {(data.fetchBoughtplanUsagePerUser.find(e => e.unit.id == 22) &&
                                      `${humanizeDuration(
                                        (data.fetchBoughtplanUsagePerUser.find(e => e.unit.id == 22)
                                          .totalminutes *
                                          60 *
                                          1000) /
                                          28,
                                        { largest: 1, round: true }
                                      )} per Day`) ||
                                      "Not used at all"}
                                  </div>
                                );
                              }
                            }}
                          </Query>
                          <button className="naked-button genericButton">Remove Licence</button>
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
                //onClick={() => this.props.moveTo("emanager/22")}
              >
                <i className="far fa-plus box28" style={{ lineHeight: "28px" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EServices;
