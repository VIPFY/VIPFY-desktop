import * as React from "react";
import { withApollo } from "@apollo/client/react/hoc";
import { Query } from "@apollo/client/react/components";
import gql from "graphql-tag";
import moment from "moment";
import { getMyUnitId } from "../../common/functions";
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
  client: any;
}

interface State {
  terminate: Boolean;
}

class ServiceDetails extends React.Component<Props, State> {
  state = {
    terminate: false
  };

  showStatus(e) {
    if (e.pending) {
      return this.renderTag("Integration pending", "error", { lineHeight: "initial" });
    }

    const start = e.starttime;
    if (moment(start - 0).isAfter(moment.now())) {
      return this.renderTag("Starts in " + moment(start - 0).toNow(true), "info2", {
        lineHeight: "initial"
      });
    }

    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    if (end) {
      return this.renderTag("Ends in " + moment(end - 0).toNow(true), "info3", {
        lineHeight: "initial"
      });
    } else {
      return <Tag>{`Active since ${moment(start - 0).fromNow(true)}`}</Tag>;
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.e.id != this.props.e.id) {
      this.setState({ terminate: false });
    }
  }

  renderTag(
    children: React.ReactChildren | React.ReactChild,
    className: string = "",
    style: object = {},
    tooltip: string = undefined
  ) {
    return (
      <Tag tooltip={tooltip} className={className} style={{ textAlign: "center", ...style }}>
        {children}
      </Tag>
    );
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
              {e.options &&
                e.options.private &&
                this.renderTag(
                  "Private",
                  "info1",
                  { marginLeft: "8px" },
                  "This account is private"
                )}
              {!(e.tags && e.tags.includes("vacation")) &&
                e.rightscount > 1 &&
                this.renderTag(
                  "Shared",
                  "info4",
                  { marginLeft: "8px" },
                  "This account is shared between multiple users"
                )}
              {e.tags &&
                e.tags.includes("vacation") &&
                this.renderTag(
                  "Holiday",
                  "info5",
                  { marginLeft: "8px" },
                  "This account is a vacation access"
                )}
              {e.tags &&
                e.tags.includes("teamlicence") &&
                this.renderTag(
                  "Team",
                  "info6",
                  { marginLeft: "8px" },
                  "This account is assigned through a team"
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
              {(!e.options ||
                !e.options.private ||
                e.unitid.id == getMyUnitId(this.props.client)) && (
                  <i
                    className="fal fa-trash-alt editbuttons"
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({ terminate: true });
                    }}
                  />
                )}
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
export default withApollo(ServiceDetails);
