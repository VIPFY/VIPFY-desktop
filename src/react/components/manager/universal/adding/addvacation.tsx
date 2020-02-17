import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import Calendar from "react-calendar";
import moment, { now } from "moment";
import { Query, compose, graphql } from "react-apollo";
import { fetchUserLicences, fetchDepartmentsData } from "../../../../queries/departments";
import PrintServiceSquare from "../squares/printServiceSquare";
import UniversalDropDownInput from "../../../../components/universalForms/universalDropdownInput";
import { concatName } from "../../../../common/functions";
import AssignVacation from "./assignVacation";
import UniversalCheckbox from "../../../../components/universalForms/universalCheckbox";
import gql from "graphql-tag";

interface Props {
  employeeid: number;
  close: Function;
  createVacation: Function;
  editVacation?: Object;

  refetch: Function;
  editVacationFunction: Function;
}

interface State {
  fromdate: Date | null;
  editfrom: Boolean;
  todate: Date | null;
  editto: Boolean;
  showall: Boolean;
  users: number[];
  checked: Boolean[];
  assignAll: Boolean;
  user: number;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

const ADD_VACATION = gql`
  mutation createVacation($userid: ID!, $starttime: Date, $endtime: Date, $assignments: [JSON]) {
    createVacation(
      userid: $userid
      starttime: $starttime
      endtime: $endtime
      assignments: $assignments
    ) {
      id
      unitid {
        id
      }
      starttime
      endtime
      options
    }
  }
`;

const EDIT_VACATION = gql`
  mutation editVacation($vacationid: ID!, $starttime: Date, $endtime: Date, $assignments: [JSON]) {
    editVacation(
      vacationid: $vacationid
      starttime: $starttime
      endtime: $endtime
      assignments: $assignments
    ) {
      id
      unitid {
        id
      }
      starttime
      endtime
      options
    }
  }
`;

class AddVacation extends React.Component<Props, State> {
  state = {
    fromdate:
      (this.props.editVacation && moment(this.props.editVacation.starttime).toDate()) || null,
    editfrom: false,
    todate: (this.props.editVacation && moment(this.props.editVacation.endtime).toDate()) || null,
    editto: false,
    showall: false,
    users: [],
    checked: [],
    assignAll: false,
    user: 0,
    saving: false,
    saved: false,
    error: null
  };
  render() {
    return (
      <Query
        pollInterval={60 * 10 * 1000 + 1000}
        query={fetchUserLicences}
        variables={{ unitid: this.props.employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          let appArray: JSX.Element[] = [];
          const assignments = [];
          if (data.fetchUserLicenceAssignments) {
            data.fetchUserLicenceAssignments.sort(function(a, b) {
              let nameA = a.boughtplanid.alias
                ? a.boughtplanid.alias.toUpperCase()
                : a.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
              let nameB = b.boughtplanid.alias
                ? b.boughtplanid.alias.toUpperCase()
                : b.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }

              // namen müssen gleich sein
              return 0;
            });

            data.fetchUserLicenceAssignments.forEach(e => {
              if (
                !e.disabled &&
                !e.boughtplanid.planid.appid.disabled &&
                (e.endtime > now() || e.endtime == null) &&
                !(e.tags && e.tags.includes("vacation"))
              ) {
                assignments.push(e);
              }
            });
            assignments.forEach((e, k) => {
              appArray.push(
                <AssignVacation
                  e={e}
                  liveid={id => {
                    this.setState(oldstate => (oldstate.users[k] = id));
                  }}
                  livecheck={bool => {
                    this.setState(oldstate => (oldstate.checked[k] = bool));
                    this.setState({ assignAll: false });
                  }}
                  forceValue={this.state.checked[k]}
                  forceUser={
                    this.props.editVacation &&
                    this.props.editVacation.options.find(o => o.originalassignment == e.id)
                      ? {
                          id: this.props.editVacation.options.find(
                            o => o.originalassignment == e.id
                          ).userid
                        }
                      : this.state.users[k]
                      ? { id: this.state.users[k] }
                      : null
                  }
                />
              );
            });
          }
          return (
            <PopupBase
              small={true}
              buttonStyles={{ justifyContent: "space-between" }}
              additionalclassName="formPopup deletePopup"
              close={() => this.props.close()}>
              <h1>{this.props.editVacation ? "Edit Vacation" : "Add Vacation"}</h1>
              <div className="deleteContent" style={{ overflowY: "scroll" }}>
                <div className="assignNewAccountPopup" style={{ marginBottom: "90px" }}>
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
                      {this.state.fromdate
                        ? moment(this.state.fromdate!).format("DD.MM.YYYY")
                        : "Now"}
                    </span>
                    {this.props.editVacation && this.state.fromdate <= now() ? (
                      ""
                    ) : (
                      <i
                        className="fal fa-pen editbutton"
                        onClick={() => this.setState({ editfrom: true })}
                      />
                    )}
                    {this.state.editfrom && (
                      <PopupBase
                        styles={{ maxWidth: "fit-content" }}
                        close={() =>
                          this.setState(
                            this.props.editVacation
                              ? { editfrom: false }
                              : { editfrom: false, fromdate: null }
                          )
                        }
                        buttonStyles={{ justifyContent: "space-between" }}>
                        <span style={{ fontSize: "18px", marginBottom: "8px", display: "block" }}>
                          Select Startdate
                        </span>
                        <Calendar
                          className="calendarEdit"
                          locale="en-us"
                          minDate={new Date()}
                          maxDate={
                            (this.state.todate && moment(this.state.todate).toDate()) || undefined
                          }
                          showWeekNumbers={true}
                          onChange={v => this.setState({ fromdate: v })}
                          value={this.state.fromdate || new Date()}
                        />
                        <UniversalButton type="low" label="Cancel" closingPopup={true} />
                        <UniversalButton
                          type="high"
                          label="Select"
                          onClick={() => this.setState({ editfrom: false })}
                        />
                      </PopupBase>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "24px",
                      marginTop: "28px",
                      position: "relative"
                    }}>
                    <span style={{ lineHeight: "24px", width: "84px" }}>Until:</span>
                    <span style={{ lineHeight: "24px" }}>
                      {this.state.todate
                        ? moment(this.state.todate!).format("DD.MM.YYYY")
                        : "Please specify"}
                    </span>
                    <i
                      className="fal fa-pen editbutton"
                      onClick={() => this.setState({ editto: true })}
                    />
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
                          minDate={this.state.fromdate || new Date()}
                          showWeekNumbers={true}
                          onChange={v =>
                            this.setState(oldstate => {
                              return moment(oldstate.todate || new Date()).isSame(v)
                                ? { todate: null }
                                : { todate: v };
                            })
                          }
                          value={this.state.todate || undefined}
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
                  <div>
                    <div
                      style={
                        this.props.style || {
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "24px",
                          marginTop: "28px",
                          position: "relative"
                        }
                      }>
                      <div
                        style={{
                          lineHeight: "24px",
                          width: "24px",
                          display: "flex",
                          flexFlow: "column",
                          alignItems: "center"
                        }}>
                        <UniversalCheckbox
                          name="allselect"
                          liveValue={v =>
                            this.setState({ assignAll: v, checked: assignments.map(e => v) })
                          }
                          startingvalue={
                            this.state.checked.filter(e => !!e).length == assignments.length
                          }
                        />
                      </div>
                      <div
                        style={{
                          lineHeight: "24px",
                          width: "74px",
                          display: "flex",
                          flexFlow: "column",
                          alignItems: "center"
                        }}>
                        <span
                          style={{
                            fontSize: "10px",
                            lineHeight: "12px",
                            marginTop: "4px",
                            textAlign: "center"
                          }}>
                          Select all
                        </span>
                      </div>
                      <span style={{ lineHeight: "24px" }}></span>
                    </div>
                    {appArray}
                  </div>
                </div>
                <div className="buttonsPopup">
                  <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />
                  <UniversalButton
                    label="Save"
                    type="high"
                    disabled={!this.state.todate}
                    onClick={async () => {
                      if (this.props.editVacation) {
                        this.setState({ saving: true });
                        const assignmentSending = [];

                        assignments.forEach((a, k) => {
                          if (this.state.users[k] || this.state.users[k] == "") {
                            assignmentSending.push({
                              accountid: a.accountid,
                              assignmentid: a.id,
                              userid: this.state.users[k],
                              olduserid: this.props.editVacation.options.find(
                                o => (o.accountid = a.accountid)
                              ).userid
                            });
                          }
                        });

                        await this.props.editVacationFunction({
                          variables: {
                            vacationid: this.props.editVacation.id,
                            starttime:
                              moment(this.state.fromdate).toISOString() !=
                              moment(this.props.editVacation.starttime).toISOString()
                                ? moment(this.state.fromdate).toDate()
                                : moment(this.props.editVacation.starttime).toDate(),
                            endtime:
                              moment(this.state.todate).toISOString() !=
                              moment(this.props.editVacation.endtime).toISOString()
                                ? moment(this.state.todate).toDate()
                                : moment(this.props.editVacation.endtime).toDate(),
                            assignments: assignmentSending
                          }
                        });
                        this.setState({ saved: true });
                        this.props.refetch();
                        this.props.close();
                      } else {
                        try {
                          this.setState({ saving: true });
                          const assignmentSending = [];

                          assignments.forEach((a, k) => {
                            if (this.state.users[k] && this.state.users[k] != "") {
                              assignmentSending.push({
                                accountid: a.accountid,
                                originalassignment: a.id,
                                userid: this.state.users[k]
                              });
                            }
                          });

                          await this.props.createVacation({
                            variables: {
                              userid: this.props.employeeid,
                              starttime: this.state.fromdate || new Date(),
                              endtime: this.state.todate,
                              assignments: assignmentSending
                            }
                          });
                          this.setState({ saved: true });
                          this.props.refetch();
                          this.props.close();
                        } catch (error) {
                          console.log("error", error);
                          this.setState({ error });
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div
                style={Object.assign(
                  {},
                  {
                    position: "absolute",
                    left: "0px",
                    overflow: "hidden",
                    bottom: "0px",
                    width: "calc(100% - 96px)",
                    height: "100px",
                    backgroundColor: "white",
                    padding: "0px 48px",
                    transition: "all 300ms ease-in-out"
                  },
                  this.state.checked.find(e => e)
                    ? { height: "110px", borderTop: "1px solid", padding: "0px 48px 24px" }
                    : { height: "0px", borderTop: "0px solid", padding: "0px 48px 0px" }
                )}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "14px",
                    marginTop: "14px",
                    position: "relative"
                  }}>
                  <div
                    style={{
                      lineHeight: "24px",
                      width: "98px",
                      display: "flex",
                      flexFlow: "column",
                      alignItems: "center"
                    }}>
                    Assign{" "}
                    {this.state.checked.filter(e => !!e).length == assignments.length
                      ? "all"
                      : this.state.checked.filter(e => !!e).length}{" "}
                    accounts
                  </div>
                  <span style={{ lineHeight: "24px" }}>
                    <Query pollInterval={60 * 10 * 1000 + 1000} query={fetchDepartmentsData}>
                      {({ loading, error, data }) => {
                        if (loading) {
                          return "Loading...";
                        }
                        if (error) {
                          return `Error! ${error.message}`;
                        }
                        const employees = data.fetchDepartmentsData[0].employees;
                        return (
                          <>
                            <UniversalDropDownInput
                              id="employee-search-new"
                              label="Search for users"
                              options={employees}
                              noFloating={true}
                              resetPossible={true}
                              width="276px"
                              styles={{ marginBottom: "0px" }}
                              codeFunction={employee => employee.id}
                              nameFunction={employee => concatName(employee)}
                              renderOption={(possibleValues, i, click, value) => (
                                <div
                                  key={`searchResult-${i}`}
                                  className="searchResult"
                                  onClick={() => click(possibleValues[i])}>
                                  <span className="resultHighlight">
                                    {concatName(possibleValues[i]).substring(0, value.length)}
                                  </span>
                                  <span>
                                    {concatName(possibleValues[i]).substring(value.length)}
                                  </span>
                                </div>
                              )}
                              alternativeText={inputelement => (
                                <span
                                  className="inputInsideButton"
                                  style={{
                                    width: "auto",
                                    backgroundColor: "transparent",
                                    cursor: "text"
                                  }}>
                                  <span
                                    onClick={() => inputelement.focus()}
                                    style={{ marginRight: "4px", fontSize: "12px" }}>
                                    Start typing or
                                  </span>
                                  <UniversalButton
                                    type="low"
                                    tabIndex={-1}
                                    onClick={() => {
                                      this.setState({ showall: true });
                                    }}
                                    label="show all"
                                    customStyles={{ lineHeight: "24px" }}
                                  />
                                </span>
                              )}
                              startvalue={
                                this.state.user
                                  ? employees.find(a => a.id == this.state.user).id
                                  : ""
                              }
                              noNoResults={true}
                              livecode={c => {
                                this.setState({ user: c });
                              }}
                              fewResults={true}
                              noFixed={true}
                            />
                            {this.state.showall && (
                              <PopupBase
                                nooutsideclose={true}
                                small={true}
                                close={() => this.setState({ showall: false })}
                                buttonStyles={{ justifyContent: "space-between" }}>
                                <h1>All Employees</h1>
                                {employees.map(employee => (
                                  <div className="listingDiv" key={employee.id}>
                                    <UniversalButton
                                      type="low"
                                      label={concatName(employee)}
                                      onClick={() => {
                                        this.setState({ showall: false });
                                        this.setState({ user: employee.id });
                                      }}
                                    />
                                  </div>
                                ))}
                                {/* <div className="listingDiv" key="new">
                                  <UniversalButton
                                    type="low"
                                    label="Create new User"
                                    onClick={() => this.setState({ showall: false })}
                                  />
                                    </div> */}
                                <UniversalButton type="low" label="Cancel" closingPopup={true} />
                              </PopupBase>
                            )}
                          </>
                        );
                      }}
                    </Query>
                  </span>
                </div>
                <div
                  className="buttonPopup"
                  style={{ display: "flex", justifyContent: "space-between" }}>
                  <UniversalButton
                    label="Unselect all"
                    type="low"
                    onClick={() =>
                      this.setState({ assignAll: false, checked: assignments.map(e => false) })
                    }
                  />
                  <UniversalButton
                    label="Assign"
                    type="high"
                    onClick={() =>
                      this.setState(oldstate => {
                        const oldusers = oldstate.users;
                        oldstate.checked.forEach((check, k) => {
                          if (check) {
                            oldusers[k] = oldstate.user;
                          }
                        });
                        return { users: oldusers, checked: assignments.map(e => false), user: 0 };
                      })
                    }
                  />
                </div>
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
          );
        }}
      </Query>
    );
  }
}
export default compose(
  graphql(ADD_VACATION, {
    name: "createVacation"
  }),
  graphql(EDIT_VACATION, {
    name: "editVacationFunction"
  })
)(AddVacation);
