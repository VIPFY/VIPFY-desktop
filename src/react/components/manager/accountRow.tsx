import * as React from "react";
import ColumnEmployees from "./universal/columns/columnEmployee";
import moment, { now } from "moment";
import ChangeAccount from "./universal/changeAccount";

interface Props {
  account: any;
  orbit: any;
  app: any;
}

interface State {
  change: Boolean;
  changeda: Boolean;
  changede: Boolean;
  changedp: Boolean;
  changedt: Boolean;
  editto: Boolean;
  alias: String;
  email: String | null;
  password: String;
  todate: Date | null;
  saving: Boolean;
  saved: Boolean;
  error: String | null;
  showall: Boolean;
}

const INITAL_STATE = {
  change: false,
  changeda: false,
  changede: false,
  changedp: false,
  changedt: false,
  editto: false,
  password: "",
  saving: false,
  saved: false,
  error: null,
  showall: false
};

class AccountRow extends React.Component<Props, State> {
  state = {
    ...INITAL_STATE,
    alias: this.props.account.alias,
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
    console.log("Account", account, this.state, this.props);
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
            <i
              className="fal fa-pen editbuttons"
              title="Edit account settings"
              onClick={() => this.setState({ change: true })}
            />
          </div>
        </div>
        {this.state.change && (
          <ChangeAccount
            account={account}
            orbit={this.props.orbit}
            app={this.props.app}
            closeChange={() => this.setState({ change: false })}
          />
        )}
      </div>
    );
  }
}
export default AccountRow;
