import * as React from "react";
import moment, { now } from "moment";
import PopupBase from "../../../popups/universalPopups/popupBase";
import Calendar from "react-calendar";
import UniversalButton from "../../universalButtons/universalButton";
import { compose, graphql, withApollo, Query } from "react-apollo";
import gql from "graphql-tag";
import UniversalDropDownInput from "../../universalForms/universalDropdownInput";
import { fetchDepartmentsData } from "../../../queries/departments";
import { concatName } from "../../../common/functions";
import PrintEmployeeSquare from "./squares/printEmployeeSquare";
import AddEmployeePersonalData from "../addEmployeePersonalData";

interface Props {
  account: any;
  assignAccount: Function;

  refetch?: Function;
}

interface State {
  delete: boolean;
  saving: boolean;
  saved: boolean;
  error: String | null;
  user: number | null;
  editfrom: boolean;
  editto: boolean;
  fromdate: Date | null;
  todate: Date | null;
  showall: boolean;
  time: number;
  add: Boolean;
  value: string | null;
}

const ASSIGN_ACCOUNT = gql`
  mutation assignAccount(
    $licenceid: ID!
    $userid: ID!
    $rights: LicenceRights
    $tags: [String]
    $starttime: Date
    $endtime: Date
  ) {
    assignAccount(
      licenceid: $licenceid
      userid: $userid
      rights: $rights
      tags: $tags
      starttime: $starttime
      endtime: $endtime
    )
  }
`;

const INITIAL_STATE = {
  delete: false,
  saving: false,
  saved: false,
  error: null,
  user: null,
  editfrom: false,
  editto: false,
  fromdate: null,
  todate: null,
  showall: false,
  add: false,
  value: null
};

class ShowAndAddEmployee extends React.Component<Props, State> {
  state = {
    ...INITIAL_STATE,
    time: Math.random()
  };

  render() {
    return (
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "24px",
                  position: "relative"
                }}>
                <span style={{ lineHeight: "24px", width: "84px" }}>Add User</span>
                <UniversalDropDownInput
                  id={`employee-search-${this.state.time}`}
                  label="Search for users"
                  options={employees}
                  noFloating={true}
                  resetPossible={true}
                  width="300px"
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
                      <span>{concatName(possibleValues[i]).substring(value.length)}</span>
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
                  startvalue=""
                  livecode={c => this.setState({ user: employees.find(a => a.id == c) })}
                  noresults="Create new user"
                  noresultsClick={v => this.setState({ add: true, value: v })}
                  fewResults={true}
                />
              </div>
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
                          this.setState({ user: employee });
                        }}
                      />
                    </div>
                  ))}
                  <div className="listingDiv" key="new">
                    <UniversalButton
                      type="low"
                      label="Create new User"
                      onClick={() => this.setState({ add: true })}
                    />
                  </div>
                  <UniversalButton type="low" label="Cancel" closingPopup={true} />
                </PopupBase>
              )}
              {this.state.user && (
                <PopupBase
                  small={true}
                  nooutsideclose={true}
                  close={() => this.setState(INITIAL_STATE)}
                  additionalclassName="assignNewAccountPopup"
                  buttonStyles={{ justifyContent: "space-between" }}>
                  <h1>Assign User to Account</h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "24px",
                      marginTop: "28px",
                      position: "relative"
                    }}>
                    <span style={{ lineHeight: "24px", width: "84px" }}>To:</span>
                    <PrintEmployeeSquare
                      employee={this.state.user}
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
                      {concatName(this.state.user!)}
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
                    <span style={{ lineHeight: "24px", width: "84px" }}>From:</span>
                    <span style={{ lineHeight: "24px" }}>
                      {this.state.fromdate
                        ? moment(this.state.fromdate!).format("DD.MM.YYYY")
                        : "Now"}
                    </span>
                    <i
                      className="fal fa-pen editbutton"
                      onClick={() => this.setState({ editfrom: true })}
                    />
                    {this.state.editfrom && (
                      <PopupBase
                        styles={{ maxWidth: "fit-content" }}
                        close={() => this.setState({ editfrom: false, fromdate: null })}
                        buttonStyles={{ justifyContent: "space-between" }}>
                        <span style={{ fontSize: "18px", marginBottom: "8px", display: "block" }}>
                          Select Startdate
                        </span>
                        <Calendar
                          className="calendarEdit"
                          locale="en-us"
                          minDate={new Date()}
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
                        : "Further Notice"}
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
                  <UniversalButton
                    type="low"
                    label="Cancel"
                    onClick={() => this.setState(INITIAL_STATE)}
                  />
                  <UniversalButton
                    type="high"
                    label="Save"
                    disabled={!this.state.user}
                    onClick={async () => {
                      this.setState({ saving: true });
                      try {
                        await this.props.assignAccount({
                          variables: {
                            licenceid: this.props.account.id,
                            userid: this.state.user!.id,
                            rights: { view: true, use: true },
                            starttime: this.state.fromdate || undefined,
                            endtime: this.state.todate || undefined
                          }
                        });
                        if (this.props.refetch) {
                          await this.props.refetch();
                        }
                        this.setState({ saved: true });
                        setTimeout(
                          () => this.setState({ ...INITIAL_STATE, time: Math.random() }),
                          1000
                        );
                      } catch (err) {
                        console.log("ERROR", err);
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
                            onClick={() =>
                              this.setState({ error: null, saving: false, saved: false })
                            }>
                            Try again
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </PopupBase>
              )}
              {this.state.add && (
                <PopupBase
                  small={true}
                  close={() => this.setState({ add: false })}
                  nooutsideclose={true}
                  additionalclassName="formPopup deletePopup">
                  <AddEmployeePersonalData
                    continue={data => {
                      this.setState({ add: false, user: data.employee });
                    }}
                    close={() => {
                      this.setState({ add: false });
                    }}
                    addpersonal={{ name: this.state.value }}
                    isadmin={true}
                  />
                </PopupBase>
              )}
            </>
          );
        }}
      </Query>
    );
  }
}
export default compose(graphql(ASSIGN_ACCOUNT, { name: "assignAccount" }))(
  withApollo(ShowAndAddEmployee)
);
