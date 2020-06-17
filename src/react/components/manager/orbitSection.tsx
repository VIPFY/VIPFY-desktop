import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import moment, { now } from "moment";
import AccountRow from "./accountRow";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import Calendar from "react-calendar";
import { withApollo, graphql } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import ChangeAccount from "./universal/changeAccount";
import ShowAndAddEmployee from "./universal/showAndAddEmployee";
import ShowAndDeleteEmployee from "./universal/showAndDeleteEmployee";
import { fetchCompanyServices } from "./../../queries/products";
import { AppContext } from "../../common/functions";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import Tag from "../../common/Tag";

interface Props {
  orbit: any;
  app: any;
  changeOrbit: Function;

  refetch: Function;
}

interface State {
  change: Boolean;
  todate: Date | null;
  editto: Boolean;
  loginurl: String | null;
  saving: Boolean;
  saved: Boolean;
  error: String | null;
  alias: String | null;
  changeda: Boolean;
  changedl: Boolean;
  changedt: Boolean;
  newaccount: Boolean;
  addUsers: any;
  selfhosting: boolean;
  protocol: String;
}

const CHANGE_ORBIT = gql`
  mutation changeOrbit(
    $orbitid: ID!
    $alias: String
    $loginurl: String
    $endtime: Date
    $selfhosting: Boolean
  ) {
    changeOrbit(
      orbitid: $orbitid
      alias: $alias
      loginurl: $loginurl
      endtime: $endtime
      selfhosting: $selfhosting
    ) {
      id
      alias
      key
      endtime
      accounts {
        id
        endtime
        assignments {
          assignmentid
          endtime
        }
      }
    }
  }
`;

const INITAL_STATE = {
  change: false,
  editto: false,
  saving: false,
  saved: false,
  error: null,
  changeda: false,
  changedl: false,
  changedt: false,
  newaccount: false,
  addUsers: null
};

class OrbitSection extends React.Component<Props, State> {
  state = {
    ...INITAL_STATE,
    loginurl: this.props.orbit.key
      ? this.props.orbit.key.selfhosting
        ? this.props.orbit.key.domain.substring(this.props.orbit.key.domain.search(/:\/\/{1}/) + 3)
        : this.props.orbit.key.domain &&
          this.props.orbit.key.domain
            .replace(this.props.app.options.predomain, "")
            .replace(this.props.app.options.afterdomain, "")
      : undefined,
    alias: this.props.orbit.alias,
    todate: this.props.orbit.endtime && moment(this.props.orbit.endtime).toDate(),
    protocol:
      (this.props.orbit.key &&
        this.props.orbit.key.selfhosting &&
        this.props.orbit.key.domain.substring(
          0,
          this.props.orbit.key.domain.search(/:\/\/{1}/) + 3
        )) ||
      "https://",
    selfhosting: this.props.orbit.key && this.props.orbit.key.selfhosting
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

    if (
      !(
        e.accounts &&
        e.accounts[0] != null &&
        e.accounts.filter(
          account => account && (account.endtime == null || account.endtime > now())
        ).length >= 0
      )
    ) {
      return this.renderTag("No active Accounts", "error");
    }

    if (moment(start - 0).isAfter(moment.now())) {
      return this.renderTag("Starts in " + moment(start).toNow(true), "info2");
    }

    if (end) {
      const endDate = moment(end).isValid() ? end : new Date(end - 0);

      return this.renderTag("Ends in " + moment(endDate).toNow(true), "warn");
    } else {
      return "";
    }
  }

  render() {
    const orbit = this.props.orbit;
    return (
      <div className="section">
        <div className="heading">
          <h1>{orbit.alias}</h1>
          {this.showStatus(orbit)}
          {orbit.key.employeeIntegrated ? (
            <div
              style={{
                fontSize: "12px",
                lineHeight: "24px",
                fontWeight: "700",
                marginRight: "16px",
                width: "120px",
                textAlign: "center"
              }}>
              Employee Orbit
            </div>
          ) : (
            <UniversalButton
              type="high"
              label="Change Orbit"
              customStyles={{
                fontSize: "12px",
                lineHeight: "24px",
                fontWeight: "700",
                marginRight: "16px",
                width: "120px"
              }}
              onClick={() => this.setState({ change: true })}
            />
          )}
        </div>
        <div className="table">
          <div className="tableHeading">
            <div className="tableMain">
              <div className="tableColumnBig">
                <h1>Accountalias</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Status</h1>
              </div>
              <div
                className="tableColumnBig" //onClick={() => this.handleSortClick("Teams")}
              >
                <h1>Teams</h1>
              </div>
              <div
                className="tableColumnBig" //onClick={() => this.handleSortClick("Single Users")}
              >
                <h1>Single Users</h1>
              </div>
            </div>
            <div className="tableEnd"></div>
          </div>
          {orbit.accounts &&
            orbit.accounts[0] != null &&
            orbit.accounts
              .filter(account => account && (account.endtime == null || account.endtime > now()))
              .map(account => (
                <AccountRow
                  key={account.id}
                  account={account}
                  orbit={orbit}
                  app={this.props.app}
                  refetch={this.props.refetch}
                />
              ))}
          {!orbit.key.employeeIntegrated && (
            <div className="tableRow noHover">
              <div className="tableMain">
                <div className="tableColumnBig" style={{ alignItems: "center", display: "flex" }}>
                  <AppContext.Consumer>
                    {({ addRenderElement }) => (
                      <UniversalButton
                        innerRef={el => addRenderElement({ key: "addAccount", element: el })}
                        type="low"
                        label="Add Account"
                        onClick={() => this.setState({ newaccount: true })}
                      />
                    )}
                  </AppContext.Consumer>
                </div>
                <div
                  className="tableColumnSmall"
                  style={{ alignItems: "center", display: "flex" }}></div>
                <div
                  className="tableColumnBig"
                  style={{ alignItems: "center", display: "flex" }}></div>
                <div
                  className="tableColumnBig"
                  style={{ alignItems: "center", display: "flex" }}></div>
              </div>
              <div className="tableEnd">
                <div className="editOptions"></div>
              </div>
            </div>
          )}
        </div>
        {this.state.newaccount && (
          <ChangeAccount
            newaccount={true}
            orbit={orbit}
            app={this.props.app}
            closeChange={backelement => {
              if (backelement) {
                this.setState({ newaccount: false, addUsers: backelement });
              } else {
                this.setState({ newaccount: false });
              }
            }}
            refetch={this.props.refetch}
          />
        )}
        {this.state.addUsers && (
          <AppContext.Consumer>
            {({ addRenderElement }) => (
              <PopupBase
                innerRef={el => addRenderElement({ key: "assignPopup", element: el })}
                small={true}
                nooutsideclose={true}
                close={() => this.setState(INITAL_STATE)}
                additionalclassName="assignNewAccountPopup"
                buttonStyles={{ justifyContent: "space-between" }}>
                <h1>Select User for Account</h1>
                {orbit.accounts.find(a => a.id == this.state.addUsers!.id).assignments &&
                  orbit.accounts
                    .find(a => a.id == this.state.addUsers!.id)
                    .assignments.map(
                      assignment =>
                        assignment &&
                        assignment.endtime > moment.now() && (
                          <ShowAndDeleteEmployee
                            employee={{
                              ...assignment.unitid,
                              endtime: assignment.endtime,
                              starttime: assignment.starttime,
                              assignmentid: assignment.assignmentid
                            }}
                          />
                        )
                    )}

                <ShowAndAddEmployee
                  account={orbit.accounts.find(a => a.id == this.state.addUsers!.id)}
                  refetch={this.props.refetch}
                />

                <UniversalButton
                  innerRef={el => addRenderElement({ key: "saveAssign", element: el })}
                  type="low"
                  label="Cancel"
                  onClick={() => this.setState(INITAL_STATE)}
                />
                <UniversalButton
                  innerRef={el => addRenderElement({ key: "saveAssign", element: el })}
                  type="high"
                  label="Close"
                  onClick={() => this.setState(INITAL_STATE)}
                />
              </PopupBase>
            )}
          </AppContext.Consumer>
        )}
        {this.state.change && (
          <PopupBase
            small={true}
            nooutsideclose={true}
            close={() => this.setState(INITAL_STATE)}
            additionalclassName="assignNewAccountPopup"
            buttonStyles={{ justifyContent: "space-between" }}>
            <h1>Change Orbit Settings</h1>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ lineHeight: "24px", width: "84px" }}>Alias:</span>
              <span style={{ lineHeight: "24px", width: "calc(100% - 84px)" }}>
                <UniversalTextInput
                  id="orbitalias"
                  width="100%"
                  startvalue={this.state.alias}
                  livevalue={v => {
                    if (v != this.state.alias && v != "") {
                      this.setState({ alias: v, changeda: true });
                    } else {
                      this.setState({ alias: v, changeda: false });
                    }
                  }}
                />
              </span>
            </div>
            {this.props.app.needssubdomain && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "24px",
                  marginTop: "28px",
                  position: "relative"
                }}>
                <span style={{ lineHeight: "24px", width: "84px" }}>
                  <span>Domain:</span>
                  {this.props.app.options.selfhosting && (
                    <div style={{ alignItems: "center", display: "flex" }}>
                      <UniversalCheckbox
                        startingvalue={this.props.orbit.key.selfhosting}
                        liveValue={e => this.setState({ selfhosting: e, changedl: true })}
                        style={{ float: "left" }}
                      />
                      <span style={{ fontSize: "10px", lineHeight: "18px", marginLeft: "4px" }}>
                        Selfhosting
                      </span>
                    </div>
                  )}
                </span>
                <UniversalTextInput
                  width="300px"
                  id="domain"
                  className="scrollable"
                  startvalue={this.state.loginurl}
                  livevalue={value => {
                    let domain = value;
                    let protocol = undefined;
                    if (value.startsWith("https://") || value.startsWith("http://")) {
                      protocol = value.substring(0, value.search(/:\/\/{1}/) + 3);
                      domain = value.substring(value.search(/:\/\/{1}/) + 3);
                    } else {
                      protocol = this.state.protocol;
                    }
                    if (value != this.state.loginurl && value != "") {
                      this.setState({ loginurl: domain, changedl: true, protocol });
                    } else {
                      this.setState({ loginurl: domain, changedl: false, protocol });
                    }
                  }}
                  modifyValue={value => {
                    if (value.startsWith("https://") || value.startsWith("http://")) {
                      return value.substring(value.search(/:\/\/{1}/) + 3);
                    } else {
                      return value;
                    }
                  }}
                  prefix={
                    this.state.selfhosting ? (
                      <select
                        className="universalTextInput"
                        style={{ width: "75px" }}
                        value={this.state.protocol}
                        onChange={e => this.setState({ protocol: e.target.value, changedl: true })}>
                        <option value="http://" key="http://">
                          http://
                        </option>
                        <option value="https://" key="https://">
                          https://
                        </option>
                      </select>
                    ) : (
                      this.props.app.options.predomain
                    )
                  }
                  suffix={this.state.selfhosting ? undefined : this.props.app.options.afterdomain}
                />
              </div>
            )}

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
                {orbit.buytime ? moment(orbit.buytime!).format("DD.MM.YYYY") : "Now"}
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
                    minDate={moment(moment.max(moment(orbit.buytime), moment())).toDate()}
                    showWeekNumbers={true}
                    onChange={v =>
                      this.setState(oldstate => {
                        return moment(oldstate.todate || new Date()).isSame(v)
                          ? { todate: null, changedt: true }
                          : { todate: v, changedt: true };
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
            {this.state.todate && (
              <Tag
                div={true}
                className="warn"
                style={{
                  textAlign: "center",
                  lineHeight: "initial",
                  fontSize: "12px",
                  padding: "5px"
                }}>
                {`This will terminate all assignments and accounts on ${moment(
                  this.state.todate
                ).format("DD.MM.YYYY")}`}
              </Tag>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
              <UniversalButton
                type="low"
                label="Cancel"
                onClick={() => this.setState(INITAL_STATE)}
              />
              <UniversalButton
                type="high"
                label="Save"
                disabled={!(this.state.changeda || this.state.changedl || this.state.changedt)}
                onClick={async () => {
                  this.setState({ saving: true });
                  try {
                    await this.props.changeOrbit({
                      variables: {
                        orbitid: orbit.id,
                        alias: this.state.alias,
                        selfhosting: this.state.selfhosting,
                        loginurl: this.props.app.needssubdomain
                          ? this.state.selfhosting
                            ? `${this.state.protocol}${this.state.loginurl}`
                            : `${this.props.app.options.predomain}${this.state.loginurl}${this.props.app.options.afterdomain}`
                          : undefined,
                        endtime: this.state.todate
                      },
                      refetchQueries: [
                        {
                          query: fetchCompanyServices
                        }
                      ]
                    });
                    this.setState({ saved: true });
                    setTimeout(() => this.setState(INITAL_STATE), 1000);
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
export default compose(graphql(CHANGE_ORBIT, { name: "changeOrbit" }))(withApollo(OrbitSection));
