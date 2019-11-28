import * as React from "react";
import PrintServiceSquare from "./universal/squares/printServiceSquare";
import ColumnTeams from "./universal/columns/columnTeams";
import ColumnEmployees from "./universal/columns/columnEmployee";
import moment, { now } from "moment";

interface Props {
  account: any;
}

interface State {}

class AccountRow extends React.Component<Props, State> {
  state = {};

  showStatus(e) {
    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    const start = e.buytime;

    //No activeAssignment
    const activeAssignment = [];
    e.assignments.forEach(element => {
      if (element.endtime > now()) {
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
    console.log("Account", account);
    return (
      <div className="tableRow noHover">
        <div className="tableMain">
          <div className="tableColumnBig" style={{ alignItems: "center", display: "flex" }}>
            {account.alias}
          </div>
          <div className="tableColumnSmall" style={{ alignItems: "center", display: "flex" }}>
            {this.showStatus(account)}
          </div>
          <div className="tableColumnBig" style={{ alignItems: "center", display: "flex" }}>
            Teams
          </div>
          <ColumnEmployees
            employees={account.assignments}
            employeeidFunction={e => {
              return { ...e.unitid, endtime: e.endtime };
            }}
            checkFunction={e => e.endtime > moment.now()}
            overlayFunction={e => {
              if (e.endtime != 8640000000000000) {
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
            }}
          />
        </div>
        <div className="tableEnd">
          <div className="editOptions">
            <i className="fal fa-trash-alt editbuttons" title="Terminate account" />
            <i className="fal fa-pen editbuttons" title="Edit account settings" />
          </div>
        </div>
      </div>
    );
  }
}
export default AccountRow;
