import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import moment from "moment";
import AccountRow from "./accountRow";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import Calendar from "react-calendar";
import { withApollo, compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import ChangeAccount from "./universal/changeAccount";

interface Props {
  orbit: any;
  app: any;
  changeOrbit: Function;
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
}

const CHANGE_ORBIT = gql`
  mutation changeOrbit($orbitid: ID!, $alias: String, $loginurl: String, $endtime: Date) {
    changeOrbit(orbitid: $orbitid, alias: $alias, loginurl: $loginurl, endtime: $endtime) {
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
  newaccount: false
};

class OrbitSection extends React.Component<Props, State> {
  state = {
    ...INITAL_STATE,
    loginurl: this.props.orbit.key && this.props.orbit.key.loginurl,
    alias: this.props.orbit.alias,
    todate: this.props.orbit.endtime && moment(this.props.orbit.endtime).toDate()
  };

  showStatus(e) {
    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    const start = e.buytime;

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
          Starts in {moment(start).toNow(true)}
        </span>
      );
    }

    if (end) {
      let enddate;
      if (moment(end).isValid()) {
        enddate = end;
      } else {
        enddate = new Date(end - 0);
      }
      return (
        <span
          className="infoTag"
          style={{ backgroundColor: "#FFC15D", textAlign: "center", lineHeight: "initial" }}>
          Ends in {moment(enddate).toNow(true)}
        </span>
      );
    } else {
      return;
    }
  }

  render() {
    const orbit = this.props.orbit;
    return (
      <div className="section">
        <div className="heading">
          <h1>{orbit.alias}</h1>
          {this.showStatus(orbit)}
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
          {orbit.accounts.map(account => (
            <AccountRow account={account} orbit={orbit} app={this.props.app} />
          ))}
          <div className="tableRow noHover">
            <div className="tableMain">
              <div className="tableColumnBig" style={{ alignItems: "center", display: "flex" }}>
                <UniversalButton
                  type="low"
                  label="Create Account"
                  onClick={() => this.setState({ newaccount: true })}
                />
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
        </div>
        {this.state.newaccount && (
          <ChangeAccount
            newaccount={true}
            orbit={orbit}
            app={this.props.app}
            closeChange={() => this.setState({ newaccount: false })}
          />
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
                    if (v != this.state.alias) {
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
                <span style={{ lineHeight: "24px", width: "84px" }}>Domain:</span>
                <span style={{ lineHeight: "24px", width: "calc(100% - 84px)" }}>
                  <UniversalTextInput
                    width="100%"
                    id="orbitsubdomain"
                    startvalue={this.state.loginurl}
                    livevalue={v => {
                      if (v != this.state.loginurl) {
                        this.setState({ loginurl: v, changedl: true });
                      } else {
                        this.setState({ loginurl: v, changedl: false });
                      }
                    }}>
                    <span>{this.props.app.options.predomain}</span>
                    <span>YOUR DOMAIN</span>
                    <span>{this.props.app.options.afterdomain}</span>
                  </UniversalTextInput>
                </span>
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
              <div
                className="infoTag"
                style={{
                  backgroundColor: "#ffc15d",
                  textAlign: "center",
                  lineHeight: "initial",
                  color: "white",
                  fontSize: "12px",
                  padding: "5px"
                }}>
                This will terminate all assignments and accounts on{" "}
                {moment(this.state.todate).format("DD.MM.YYYY")}
              </div>
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
                        loginurl: this.props.app.needssubdomain ? this.state.loginurl : undefined,
                        endtime: this.state.todate
                      }
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
