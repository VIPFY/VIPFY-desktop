import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import PrintServiceSquare from "./universal/squares/printServiceSquare";
import TerminateAssignedAccount from "./universal/adding/terminateAssignedAccount";
import { shortEnglishHumanizer } from "../../common/duration";
import Tag from "../../common/Tag";

interface Props {
  e: any;
  employeeid: number;
  moveTo: Function;
  employee: any;
  isadmin: boolean;
}

interface State {
  terminate: Boolean;
}

class ServiceDetails extends React.Component<Props, State> {
  state = {
    terminate: false
  };

  showStatus(e) {
    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    const start = e.starttime;

    if (e.pending) {
      return (
        <Tag
          style={{
            backgroundColor: "#c73544",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          Integration pending
        </Tag>
      );
    }

    if (moment(start - 0).isAfter(moment.now())) {
      return (
        <Tag
          style={{
            backgroundColor: "#20baa9",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          {`Starts in ${moment(start - 0).toNow(true)}`}
        </Tag>
      );
    }

    if (end) {
      return (
        <Tag style={{ backgroundColor: "#FFC15D", textAlign: "center", lineHeight: "initial" }}>
          {`Ends in {moment(end - 0).toNow(true)}`}
        </Tag>
      );
    } else {
      return <Tag>{`Active since ${moment(start - 0).fromNow(true)}`}</Tag>;
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.e.id != this.props.e.id) {
      this.setState({ terminate: false });
    }
  }

  render() {
    const { e } = this.props;
    return (
      <div
        className="tableRow"
        key={`div-${e.id}`}
        onClick={() =>
          this.props.isadmin && this.props.moveTo(`lmanager/${e.boughtplanid.planid.appid.id}`)
        }>
        <div className="tableMain">
          <div
            className="tableColumnBig"
            style={
              e.rightscount > 1 || e.tags
                ? {
                    display: "grid",
                    alignItems: "center",
                    gridTemplateColumns: "32px 1fr 150px"
                  }
                : { display: "grid", alignItems: "center", gridTemplateColumns: "32px 1fr" }
            }>
            <PrintServiceSquare
              appidFunction={app => app.boughtplanid.planid.appid}
              service={e}
              className="managerSquare"
              additionalStyles={{ marginTop: "0px" }}
            />
            <span className="name" style={{ marginLeft: "8px" }} title={e.boughtplanid.alias}>
              {e.boughtplanid.alias}
            </span>
            <span>
              {!(e.tags && e.tags.includes("vacation")) && e.rightscount > 1 && (
                <Tag
                  tooltip="This account is shared between multiple users"
                  className="sharedAccount"
                  style={{ marginLeft: "8px", textAlign: "center" }}>
                  Shared
                </Tag>
              )}
              {e.tags && e.tags.includes("vacation") && (
                <Tag
                  tooltip="This account is a vacation access"
                  className="vacationAccount"
                  style={{ marginLeft: "8px", textAlign: "center" }}>
                  Holiday
                </Tag>
              )}
              {e.tags && e.tags.includes("teamlicence") && (
                <Tag
                  tooltip="This account is assigned through a team"
                  className="teamAccount"
                  style={{ marginLeft: "8px", textAlign: "center" }}>
                  Team
                </Tag>
              )}
            </span>
          </div>

          <div className="tableColumnSmall content">{this.showStatus(e)}</div>
          <div className="tableColumnSmall content">{e.alias}</div>

          <div className="tableColumnSmall content">
            {this.props.isadmin && (
              <Query
                query={gql`
                  query fetchTotalUsageMinutes(
                    $starttime: Date!
                    $assignmentid: ID!
                    $unitid: ID!
                  ) {
                    assignment: fetchTotalUsageMinutes(
                      starttime: $starttime
                      assignmentid: $assignmentid
                    )
                    total: fetchTotalUsageMinutes(starttime: $starttime, unitid: $unitid)
                  }
                `}
                variables={{
                  starttime: moment().subtract(4, "weeks").format("LL"),
                  assignmentid: e.id,
                  unitid: this.props.employeeid
                }}>
                {({ data, loading, error = null }) => {
                  if (loading) {
                    return <div>Loading</div>;
                  }

                  if (error) {
                    return <div>Error fetching data</div>;
                  }

                  if (data) {
                    const percent = (data.assignment / data.total) * 100;

                    return (
                      <React.Fragment>
                        <div className="percentage" style={{ width: "60px" }}>
                          {data && data.assignment
                            ? shortEnglishHumanizer(data.assignment * 60000, {
                                largest: 2,
                                round: true
                              })
                            : 0}
                        </div>
                        <div className="percantageBar">
                          <div className="percantageInline" style={{ width: `${percent}%` }} />
                        </div>
                      </React.Fragment>
                    );
                  }

                  return null;
                }}
              </Query>
            )}
          </div>
          <div className="tableColumnSmall content"></div>
        </div>
        <div className="tableEnd">
          {this.props.isadmin && (
            <div className="editOptions">
              <i className="fal fa-link editbuttons" />
              <i
                className="fal fa-trash-alt editbuttons"
                onClick={e => {
                  e.stopPropagation();
                  this.setState({ terminate: true });
                }}
              />
            </div>
          )}
        </div>
        {this.state.terminate && (
          <TerminateAssignedAccount
            employee={this.props.employee}
            service={this.props.e.boughtplanid.planid.appid}
            orbit={this.props.e.boughtplanid}
            account={this.props.e}
            close={() => this.setState({ terminate: false })}
          />
        )}
      </div>
    );
  }
}
export default ServiceDetails;
