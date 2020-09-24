import * as React from "react";
import moment, { now } from "moment";
import { withApollo } from "@apollo/client/react/hoc";
import { getMyUnitId } from "../../common/functions";
import ColumnEmployees from "./universal/columns/columnEmployee";
import ChangeAccount from "./universal/changeAccount";
import ColumnTeams from "./universal/columns/columnTeams";
import Tag from "../../common/Tag";

interface Props {
  account: any;
  orbit: any;
  app: any;
  refetch: Function;
  client: any;
}

interface State {
  change: Boolean;
}

const INITIAL_STATE = {
  change: false
};

class AccountRow extends React.Component<Props, State> {
  state = {
    ...INITIAL_STATE,
    alias: this.props.account ? this.props.account.alias : "",
    todate:
      this.props.account.endtime != 8640000000000000 && this.props.account.endtime != null
        ? moment(this.props.account.endtime - 0).toDate()
        : null,
    email: this.props.account.key ? this.props.account.key.email : ""
  };

  renderTag(children: React.ReactChildren | React.ReactChild, className: string) {
    return (
      <Tag className={className} style={{ textAlign: "center", lineHeight: "initial" }}>
        {children}
      </Tag>
    );
  }

  showStatus(e) {
    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    const start = e.buytime;

    //No activeAssignment
    const activeAssignment = [];
    e.assignments.forEach(element => {
      if (element && element.endtime > now()) {
        activeAssignment.push(element);
      }
    });

    if (activeAssignment.length == 0) {
      return this.renderTag("No Active Assignment", "error");
    }

    if (e.options && e.options.private) {
      return this.renderTag("Private", "info1");
    }

    if (moment(start - 0).isAfter(moment.now())) {
      return this.renderTag("Starts in " + moment(start - 0).toNow(true), "info2");
    }

    if (end) {
      return this.renderTag("Ends in " + moment(end - 0).toNow(true), "info3");
    } else {
      return null;
    }
  }

  render() {
    const account = this.props.account;
    return (
      <div className="tableRow noHover">
        <div className="tableMain">
          <div className="tableColumnBig" style={{ lineHeight: "56px" }}>
            {account.alias}
          </div>
          <div className="tableColumnSmall" style={{ alignItems: "center", display: "flex" }}>
            {this.showStatus(account)}
          </div>
          <ColumnTeams
            teams={account.assignments
              .filter(
                asa =>
                  asa &&
                  (asa.endtime == null || moment(asa.endtime).isAfter()) &&
                  asa.tags.includes("teamlicence") &&
                  asa.assignoptions &&
                  asa.assignoptions.teamlicence
              )
              .map(asa => asa.assignoptions.teamlicence)}
            teamidFunction={team => team}
            onlyids={true}
          />
          <ColumnEmployees
            employees={account.assignments.filter(
              asa =>
                asa &&
                !asa.tags.includes("teamlicence") &&
                (asa.endtime == null || moment(asa.endtime).isAfter())
            )}
            employeeidFunction={e => {
              return { ...e.unitid, endtime: e.endtime };
            }}
            checkFunction={e => e && moment(e.endtime).isAfter()}
            overlayFunction={e => {
              if (e.tags && e.tags.includes("vacation")) {
                return (
                  <div
                    className="fad fa-island-tropical warningColor"
                    title={`Vacation access (ends ${moment(e.endtime).fromNow()})`}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      top: 0,
                      left: 0,
                      alignItems: "center",
                      display: "flex",
                      justifyContent: "center"
                    }}></div>
                );
              }
              return "";
            }}
          />
        </div>
        <div className="tableEnd">
          <div className="editOptions">
            {(!account.options ||
              (account.options && !account.options.private) ||
              account.assignments.some(as => as.unitid.id == getMyUnitId(this.props.client))) && (
                <i
                  className="fal fa-pen editbuttons"
                  title="Edit account settings"
                  onClick={() => this.setState({ change: true })}
                />
              )}
          </div>
        </div>
        {(!account.options ||
          (account.options && !account.options.private) ||
          account.assignments.some(as => as.unitid.id == getMyUnitId(this.props.client))) &&
          this.state.change && (
            <ChangeAccount
              account={account}
              orbit={this.props.orbit}
              app={this.props.app}
              closeChange={b => this.setState({ change: false })}
              refetch={this.props.refetch}
            />
          )}
      </div>
    );
  }
}
export default withApollo(AccountRow);
