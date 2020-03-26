import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";
import { concatName } from "../../../../common/functions";
import PrintServiceSquare from "../squares/printServiceSquare";
import UniversalButton from "../../../universalButtons/universalButton";
import { graphql } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import { fetchUserLicences } from "../../../../queries/departments";
import Calendar from "react-calendar";
import moment, { now } from "moment";

interface Props {
  employee: any;
  service: any;
  orbit: any;
  account: any;
  todate: Date;
  close: Function;
  terminateAssignAccount: Function;
}

interface State {
  saving: boolean;
  saved: boolean;
  error: string | null;
  editfrom: boolean;
  fromdate: Date | Date[] | null;
  editto: boolean;
  todate: Date | Date[] | null;
}

const TERMINATE_ASSIGN_ACCOUNT = gql`
  mutation terminateAssignAccount($assignmentid: ID!, $endtime: Date) {
    terminateAssignAccount(assignmentid: $assignmentid, endtime: $endtime) {
      assignmentid
      endtime
    }
  }
`;

class TerminateAssignedAccount extends React.Component<Props, State> {
  state = {
    saving: false,
    saved: false,
    error: null,
    editfrom: false,
    fromdate: this.props.account.starttime,
    editto: false,
    todate: this.props.account.endtime != 8640000000000000 ? this.props.account.endtime : undefined
  };

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.account.id != this.props.account.id) {
      this.props.close();
    }
  }

  render() {
    return (
      <PopupBase
        small={true}
        nooutsideclose={true}
        close={() => this.props.close()}
        additionalclassName="assignNewAccountPopup"
        buttonStyles={{ justifyContent: "space-between" }}>
        <h1>Terminate Assignment</h1>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <span style={{ lineHeight: "24px", width: "84px" }}>To:</span>
          <PrintEmployeeSquare
            employee={this.props.employee}
            size={24}
            styles={{
              lineHeight: "24px",
              width: "24px",
              height: "24px",
              fontSize: "13px",
              marginTop: "0px",
              marginLeft: "0px"
            }}
          />
          <span
            style={{
              lineHeight: "24px",
              marginLeft: "8px",
              width: "calc(100% - 116px)",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
            {concatName(this.props.employee)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
            marginTop: "28px",
            position: "relative"
          }}>
          <span style={{ lineHeight: "24px", width: "84px" }}>Service:</span>
          <PrintServiceSquare
            service={this.props.service}
            appidFunction={s => s}
            size={24}
            additionalStyles={{
              lineHeight: "24px",
              width: "24px",
              height: "24px",
              fontSize: "13px",
              marginTop: "0px",
              marginLeft: "0px"
            }}
          />
          <span style={{ lineHeight: "24px", marginLeft: "8px" }}>{this.props.service.name}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
            marginTop: "28px",
            position: "relative"
          }}>
          <span style={{ lineHeight: "24px", width: "84px" }}>Orbit:</span>
          <span style={{ lineHeight: "24px" }}>{this.props.orbit.alias}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
            marginTop: "28px",
            position: "relative"
          }}>
          <span style={{ lineHeight: "24px", width: "84px" }}>Account:</span>
          <span style={{ lineHeight: "24px" }}>{this.props.account.alias}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
            marginTop: "28px",
            position: "relative"
          }}>
          <span style={{ lineHeight: "24px", width: "84px" }}>From:</span>
          <span style={{ lineHeight: "24px" }}>
            {moment(this.state.fromdate!).format("DD.MM.YYYY")}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
            marginTop: "28px",
            position: "relative"
          }}>
          <span style={{ lineHeight: "24px", width: "84px" }}>Terminate:</span>
          <span style={{ lineHeight: "24px" }}>
            {this.state.todate && this.state.todate != 8640000000000000
              ? moment(this.state.todate!).format("DD.MM.YYYY")
              : "Now"}
          </span>
          <i className="fal fa-pen editbutton" onClick={() => this.setState({ editto: true })} />
          {this.state.editto && (
            <PopupBase
              styles={{ maxWidth: "fit-content" }}
              close={() => this.setState({ editto: false, todate: null })}
              buttonStyles={{ justifyContent: "space-between" }}>
              <span style={{ fontSize: "18px", marginBottom: "8px", display: "block" }}>
                Select Enddate
              </span>
              <Calendar
                className="calendarEdit"
                locale="en-us"
                minDate={moment.max(moment(this.state.fromdate), moment(new Date())).toDate()}
                showWeekNumbers={true}
                onChange={v =>
                  this.setState(oldstate => {
                    console.log("COMPARE", oldstate.todate, v);
                    return oldstate.todate && moment(oldstate.todate).isSame(v)
                      ? { todate: null }
                      : { todate: v };
                  })
                }
                value={
                  this.state.todate
                    ? this.state.todate != 8640000000000000
                      ? moment(this.state.todate).toDate()
                      : new Date()
                    : undefined
                }
              />
              <UniversalButton type="low" label="Cancel" closingPopup={true} />
              <UniversalButton
                type="high"
                label="Select"
                onClick={() => this.setState({ editto: false })}
              />
            </PopupBase>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
          <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />
          <UniversalButton
            type="high"
            label="Save"
            onClick={async () => {
              this.setState({ saving: true });
              try {
                await this.props.terminateAssignAccount({
                  variables: {
                    assignmentid: this.props.account.id,
                    endtime: this.state.todate || undefined
                  },
                  refetchQueries: [
                    {
                      query: fetchUserLicences,
                      variables: { unitid: this.props.employee.id }
                    }
                  ]
                });
                this.setState({ saved: true });
                setTimeout(() => this.props.close(), 1000);
              } catch (err) {
                this.setState({ error: err });
              }
            }}
          />
        </div>
        {this.state.saving && (
          <>
            <div
              className={`circeSave ${this.state.saved ? "loadComplete" : ""} ${
                this.state.error ? "loadError" : ""
              }`}>
              <div
                className={`circeSave inner ${this.state.saved ? "loadComplete" : ""} ${
                  this.state.error ? "loadError" : ""
                }`}></div>
            </div>
            <div
              className={`circeSave ${this.state.saved ? "loadComplete" : ""} ${
                this.state.error ? "loadError" : ""
              }`}>
              <div
                className={`circle-loader ${this.state.saved ? "load-complete" : ""} ${
                  this.state.error ? "load-error" : ""
                }`}>
                <div
                  className="checkmark draw"
                  style={this.state.saved ? { display: "block" } : {}}
                />
                <div className="cross draw" style={this.state.error ? { display: "block" } : {}} />
              </div>
              <div
                className="errorMessageHolder"
                style={this.state.error ? { display: "block" } : {}}>
                <div className="message">You found an error</div>
                <button
                  className="cleanup"
                  onClick={() => this.setState({ error: null, saving: false, saved: false })}>
                  Try again
                </button>
              </div>
            </div>
          </>
        )}
      </PopupBase>
    );
  }
}
export default compose(
  graphql(TERMINATE_ASSIGN_ACCOUNT, {
    name: "terminateAssignAccount"
  })
)(TerminateAssignedAccount);
