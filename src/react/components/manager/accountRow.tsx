import * as React from "react";
import ColumnEmployees from "./universal/columns/columnEmployee";
import moment, { now } from "moment";
import ChangeAccount from "./universal/changeAccount";
import ColumnTeams from "./universal/columns/columnTeams";

interface Props {
  account: any;
  orbit: any;
  app: any;

  refetch: Function;
}

interface State {
  change: Boolean;
}

const INITAL_STATE = {
  change: false
};

class AccountRow extends React.Component<Props, State> {
  state = {
    ...INITAL_STATE,
    alias: this.props.account ? this.props.account.alias : "",
    todate:
      this.props.account.endtime != 8640000000000000 && this.props.account.endtime != null
        ? moment(this.props.account.endtime - 0).toDate()
        : null,
    email: this.props.account.key ? this.props.account.key.email : ""
  };

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
      return (
        <span
          className="infoTag"
          style={{
            backgroundColor: "#c73544",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          No Active Assignment
        </span>
      );
    }

    if (e.options && e.options.private) {
      return (
        <span
          className="infoTag"
          style={{
            color: "white",
            backgroundColor: "#3E576E",
            textAlign: "center",
            lineHeight: "initial"
          }}>
          Private
        </span>
      );
    }

    if (moment(start - 0).isAfter(moment.now())) {
      return (
        <span
          className="infoTag"
          style={{
            backgroundColor: "#20baa9",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          Starts in {moment(start - 0).toNow(true)}
        </span>
      );
    }

    if (end) {
      return (
        <span
          className="infoTag"
          style={{ backgroundColor: "#FFC15D", textAlign: "center", lineHeight: "initial" }}>
          Ends in {moment(end - 0).toNow(true)}
        </span>
      );
    } else {
      return;
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
                  (asa.endtime == null || asa.endtime > now()) &&
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
                (asa.endtime == null || asa.endtime > now())
            )}
            employeeidFunction={e => {
              return { ...e.unitid, endtime: e.endtime };
            }}
            checkFunction={e => e && e.endtime > moment.now()}
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
              } else if (e.endtime != 8640000000000000) {
                return (
                  <div
                    className="fad fa-exclamation-triangle warningColor"
                    title={`Assignment ends ${moment(e.endtime).fromNow()}`}
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
            {(!account.options || (account.options && !account.options.private)) && (
              <i
                className="fal fa-pen editbuttons"
                title="Edit account settings"
                onClick={() => this.setState({ change: true })}
              />
            )}
          </div>
        </div>
        {(!account.options || (account.options && !account.options.private)) &&
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
export default AccountRow;
