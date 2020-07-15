import * as React from "react";
import EmployeePicture from "../../EmployeePicture";
import moment from "moment";
import { concatName } from "../../../common/functions";
import PopupBase from "../../../popups/universalPopups/popupBase";
import Calendar from "react-calendar";
import UniversalButton from "../../universalButtons/universalButton";
import { graphql, withApollo } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";

interface Props {
  employee: any;
  terminateAssignAccount: Function;

  teamlicence: Boolean;
}

interface State {
  delete: boolean;
  todate: Date | null;
  saving: boolean;
  saved: boolean;
  error: String | null;
}

const TERMINATE_ASSIGN_ACCOUNT = gql`
  mutation terminateAssignAccount($assignmentid: ID!, $endtime: Date, $isNull: Boolean) {
    terminateAssignAccount(assignmentid: $assignmentid, endtime: $endtime, isNull: $isNull) {
      assignmentid
      endtime
    }
  }
`;

const INITIAL_STATE = {
  delete: false,
  saving: false,
  saved: false,
  error: null
};

class ShowAndDeleteEmployee extends React.Component<Props, State> {
  state = {
    ...INITIAL_STATE,
    todate: this.props.employee.endtime != 8640000000000000 ? this.props.employee.endtime : null
  };

  render() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "24px",
          position: "relative"
        }}>
        <span style={{ lineHeight: "24px", width: "84px" }}></span>
        <EmployeePicture
          employee={this.props.employee}
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
          size={24}
          style={{
            lineHeight: "24px",
            fontSize: "13px",
            marginTop: "0px",
            marginLeft: "0px"
          }}
        />
        <span style={{ lineHeight: "24px", marginLeft: "8px" }}>
          {this.props.teamlicence
            ? `${concatName(this.props.employee)} (Assigned via team)`
            : concatName(this.props.employee)}
        </span>
        {!this.props.teamlicence && (
          <i
            className="fal fa-trash-alt editbutton"
            onClick={() => this.setState({ delete: true })}
          />
        )}
        {this.state.delete && (
          <PopupBase
            small={true}
            nooutsideclose={true}
            close={() => this.setState(INITIAL_STATE)}
            additionalclassName="assignNewAccountPopup"
            buttonStyles={{ justifyContent: "space-between" }}>
            <h1>Delete Assignment</h1>
            <span style={{ fontSize: "18px", marginBottom: "8px", display: "block" }}>
              Select Enddate
            </span>
            <Calendar
              className="calendarEdit"
              locale="en-us"
              minDate={moment(moment.max(moment(this.props.employee.starttime), moment())).toDate()}
              showWeekNumbers={true}
              onChange={v =>
                this.setState(oldstate => {
                  return moment(oldstate.todate || new Date()).isSame(v)
                    ? { todate: null, changedt: true }
                    : { todate: v, changedt: true };
                })
              }
              value={new Date(this.state.todate!) || undefined}
            />
            <UniversalButton
              type="low"
              label="Cancel"
              onClick={() => this.setState(INITIAL_STATE)}
            />
            <UniversalButton
              type="high"
              label="Delete"
              onClick={async () => {
                this.setState({ saving: true });
                try {
                  await this.props.terminateAssignAccount({
                    variables: {
                      assignmentid: this.props.employee.assignmentid,
                      endtime: this.state.todate || null,
                      isNull: !!(this.state.todate == null)
                    }
                  });
                  this.setState({ saved: true });
                  setTimeout(() => this.setState(INITIAL_STATE), 1000);
                } catch (err) {
                  this.setState({ error: err });
                }
              }}
            />
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
                    <div
                      className="cross draw"
                      style={this.state.error ? { display: "block" } : {}}
                    />
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
        )}
      </div>
    );
  }
}
export default compose(graphql(TERMINATE_ASSIGN_ACCOUNT, { name: "terminateAssignAccount" }))(
  withApollo(ShowAndDeleteEmployee)
);
