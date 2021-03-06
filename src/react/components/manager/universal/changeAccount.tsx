import * as React from "react";
import moment from "moment";
import Calendar from "react-calendar";
import gql from "graphql-tag";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import { Checkbox, Tag } from "@vipfy-private/vipfy-ui-lib";

import PopupBase from "../../../popups/universalPopups/popupBase";
import { fetchCompanyService } from "../../../queries/products";
import { AppContext } from "../../../common/functions";
import {
  createEncryptedLicenceKeyObject,
  reencryptLicenceKeyObject
} from "../../../common/licences";
import UniversalButton from "../../universalButtons/universalButton";
import UniversalTextInput from "../../universalForms/universalTextInput";
import ShowAndAddEmployee from "./showAndAddEmployee";
import ShowAndDeleteEmployee from "./showAndDeleteEmployee";

interface Props {
  account: any;
  orbit: any;
  app: any;
  closeChange: Function;
  newaccount: boolean;
  changeAccount: Function;
  createAccount: Function;
  refetch: Function;
  client: any;
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
  fromdate: Date | null;
  editfrom: Boolean;
  aliastouched: Boolean;
  loginurl: string | null;
  protocol: string | null;
  changedl: boolean;
  selfhosting: boolean;
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
  showall: false,
  editfrom: false,
  fromdate: null,
  aliastouched: false,
  changedl: false
};

const CHANGE_ACCOUNT = gql`
  mutation changeAccount($accountid: ID!, $alias: String, $logindata: JSON, $endtime: Date) {
    changeAccount(accountid: $accountid, alias: $alias, logindata: $logindata, endtime: $endtime) {
      id
      alias
      endtime
      assignments {
        assignmentid
        endtime
      }
    }
  }
`;

const CREATE_ACCOUNT = gql`
  mutation createAccount(
    $orbitid: ID!
    $alias: String
    $logindata: JSON!
    $starttime: Date
    $endtime: Date
  ) {
    createAccount(
      orbitid: $orbitid
      alias: $alias
      logindata: $logindata
      starttime: $starttime
      endtime: $endtime
    ) {
      id
      alias
      starttime
      endtime
      assignments {
        assignmentid
        unitid {
          id
          firstname
          lastname
          profilepicture
        }
        starttime
        endtime
      }
    }
  }
`;

class ChangeAccount extends React.Component<Props, State> {
  state = {
    ...INITAL_STATE,
    alias: this.props.account && this.props.account.alias,
    todate:
      this.props.account &&
      this.props.account.endtime != 8640000000000000 &&
      this.props.account.endtime != null
        ? moment(this.props.account ? this.props.account.endtime - 0 : 0).toDate()
        : null,
    email: this.props.account && this.props.account.key ? this.props.account.key.email : "",
    selfhosting:
      this.props.account && this.props.account.options && this.props.account.options.selfhosting,
    loginurl:
      (this.props.account &&
        this.props.account.options &&
        this.props.account.options.loginurl &&
        (this.props.account.options.loginurl.startsWith("https://") ||
          this.props.account.options.loginurl.startsWith("http://")) &&
        this.props.account.options.loginurl.substring(
          this.props.account.options.loginurl.search(/:\/\/{1}/) + 3
        )) ||
      null,
    protocol:
      (this.props.account &&
        this.props.account.options &&
        this.props.account.options.loginurl &&
        (this.props.account.options.loginurl.startsWith("https://") ||
          this.props.account.options.loginurl.startsWith("http://")) &&
        this.props.account.options.loginurl.substring(
          0,
          this.props.account.options.loginurl.search(/:\/\/{1}/) + 3
        )) ||
      null,
    loginValues: {}
  };

  printFields = () => {
    if (!this.props.app.options || !this.props.app.options.loginFields) {
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
            <span style={{ lineHeight: "24px", width: "84px" }}>Email:</span>
            <span style={{ lineHeight: "24px", width: "calc(100% - 84px)" }}>
              <UniversalTextInput
                id="accountemail"
                width="100%"
                startvalue={
                  this.state.loginValues && this.state.loginValues.email
                    ? this.state.loginValues.email
                    : undefined
                }
                livevalue={v => {
                  if (this.state.loginValues && v != this.state.loginValues.email && v != "") {
                    this.setState(oldstate => {
                      return {
                        loginValues: { ...oldstate.loginValues, email: v },
                        changede: true
                      };
                    });
                    if (!this.state.aliastouched) {
                      this.setState({ alias: v, changeda: true });
                    }
                  } else {
                    this.setState(oldstate => {
                      return {
                        loginValues: { ...oldstate.loginValues, email: v },
                        changede: false
                      };
                    });
                  }
                }}
              />
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
            <span style={{ lineHeight: "24px", width: "84px" }}>Password:</span>
            <span style={{ lineHeight: "24px", width: "calc(100% - 84px)" }}>
              <UniversalTextInput
                id="accountpassword"
                width="100%"
                type="password"
                startvalue={
                  this.state.loginValues && this.state.loginValues.password
                    ? this.state.loginValues.password
                    : undefined
                }
                livevalue={v => {
                  if (this.state.loginValues && v != this.state.loginValues.password && v != "") {
                    this.setState(oldstate => {
                      return {
                        loginValues: { ...oldstate.loginValues, password: v },
                        changedp: true
                      };
                    });
                  } else {
                    this.setState(oldstate => {
                      return {
                        loginValues: { ...oldstate.loginValues, password: v },
                        changedp: false
                      };
                    });
                  }
                }}
              />
            </span>
          </div>
        </>
      );
    }
    const editedFields: JSX.Element[] = [];
    this.props.app.options.loginFields.forEach((lF, k) => {
      editedFields.push(
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }} key={k}>
          <span style={{ lineHeight: "24px", width: "84px", textTransform: "capitalize" }}>
            {lF.fillkey}
          </span>
          <span style={{ lineHeight: "24px", width: "calc(100% - 84px)" }}>
            <UniversalTextInput
              id={`account-${lF.fillkey}`}
              width="100%"
              type={lF.isPassword ? "password" : undefined}
              startvalue={
                this.state.loginValues && this.state.loginValues[lF.fillkey]
                  ? this.state.loginValues[lF.fillkey]
                  : undefined
              }
              livevalue={v => {
                if (this.state.loginValues && v != this.state.loginValues[lF.fillkey] && v != "") {
                  this.setState(oldstate => {
                    return {
                      loginValues: { ...oldstate.loginValues, [lF.fillkey]: v }
                    };
                  });
                  //TODO: Add more fillkey or alias
                  if (
                    !this.state.aliastouched &&
                    (lF.fillkey == "email" || lF.fillkey == "username")
                  ) {
                    this.setState({ alias: v, changeda: true });
                  }
                } else {
                  this.setState(oldstate => {
                    return {
                      loginValues: { ...oldstate.loginValues, [lF.fillkey]: v }
                    };
                  });
                }
              }}
            />
          </span>
        </div>
      );
    });
    return editedFields;
  };

  render() {
    const { newaccount, account } = this.props;
    return (
      <AppContext.Consumer>
        {({ addRenderElement }) => (
          <PopupBase
            innerRef={el => addRenderElement({ key: "saveAccountPopup", element: el })}
            small={true}
            nooutsideclose={true}
            close={() => {
              this.setState(INITAL_STATE);
              this.props.closeChange();
            }}
            additionalclassName="assignNewAccountPopup"
            buttonStyles={{ justifyContent: "space-between" }}>
            <h1>{!newaccount ? "Change Account Settings" : "Insert new Account"}</h1>
            {!newaccount && (
              <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                <span style={{ lineHeight: "24px", width: "84px" }}>Alias:</span>
                <span style={{ lineHeight: "24px", width: "calc(100% - 84px)" }}>
                  <UniversalTextInput
                    id="accountalias"
                    width="100%"
                    startvalue={this.state.alias}
                    livevalue={v => {
                      if (
                        v != this.state.alias &&
                        (newaccount || this.props.account.alias != v) &&
                        v != ""
                      ) {
                        this.setState({ alias: v, changeda: true });
                      } else {
                        this.setState({ alias: v, changeda: false });
                      }
                    }}
                  />
                </span>
              </div>
            )}

            {!newaccount && account.options && account.options.loginurl && (
              <>
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
                  </span>
                  <UniversalTextInput
                    width="300px"
                    id="domain"
                    className="scrollable"
                    inputStyles={{ minWidth: "100px" }}
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
                      if (
                        account.options &&
                        account.options.loginurl != `${this.state.protocol}${value}` &&
                        value != this.state.loginurl &&
                        value != ""
                      ) {
                        this.setState({ loginurl: domain, changedl: true, protocol });
                      } else {
                        this.setState({ loginurl: domain, changedl: false, protocol });
                      }
                    }}
                    modifyValue={value => {
                      let deletedPrefix = value;
                      if (value.startsWith("https://") || value.startsWith("http://")) {
                        deletedPrefix = value.substring(value.search(/:\/\/{1}/) + 3);
                      }
                      let deletedSuffix = deletedPrefix;
                      if (
                        this.props.orbit &&
                        this.props.orbit.options &&
                        this.props.orbit.options.afterdomain &&
                        deletedPrefix.endsWith(this.props.orbit.options.afterdomain)
                      ) {
                        deletedSuffix = deletedPrefix.substring(
                          0,
                          deletedPrefix.indexOf(this.props.orbit.options.afterdomain)
                        );
                      }
                      return deletedSuffix;
                    }}
                    prefix={
                      this.state.selfhosting ? (
                        <select
                          className="universalTextInput"
                          style={{ width: "75px" }}
                          value={this.state.protocol}
                          onChange={e =>
                            this.setState({ protocol: e.target.value, changedl: true })
                          }>
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
                {this.props.app.options.selfhosting && (
                  <div style={{ margin: "-12px 0 24px" }}>
                    <Checkbox
                      title="Select Selfhosting"
                      name="checkbox_select_selfhosting"
                      small={true}
                      style={{ marginLeft: "84px" }}
                      checked={account.options.selfhosting}
                      handleChange={e => {
                        if (e !== account.options.selfhosting) {
                          this.setState({ selfhosting: e, changedl: true });
                        } else {
                          this.setState({
                            selfhosting: e,
                            changedl:
                              `${this.state.protocol}${this.state.loginurl}` !==
                              account.options.loginurl
                          });
                        }
                      }}>
                      Self-hosting
                    </Checkbox>
                  </div>
                )}
              </>
            )}

            {!newaccount && (
              <button
                className="naked-button"
                style={{
                  width: "100%",
                  height: "24px",
                  lineHeight: "24px",
                  backgroundColor: "#f2f2f2",
                  borderRadius: "4px",
                  fontSize: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer"
                }}
                onClick={() =>
                  this.setState(prevState => {
                    return { showall: !prevState.showall };
                  })
                }>
                <span style={{ marginLeft: "8px" }}>All information</span>
                <i
                  className="far fa-chevron-down chevron"
                  style={
                    this.state.showall
                      ? { transform: "rotate(0deg)" }
                      : { transform: "rotate(90deg)" }
                  }
                />
              </button>
            )}
            <div
              className="coll"
              style={
                this.state.showall || newaccount
                  ? this.state.showall
                    ? {
                        height: "245px",
                        marginTop: "40px",
                        transition: "height 300ms ease-in-out, margin-top 0ms ease-in-out 0ms"
                      }
                    : {
                        height: "245px",
                        transition: "height 300ms ease-in-out, margin-top 0ms ease-in-out 0ms"
                      }
                  : { height: "0px" }
              }>
              {this.printFields()}
              {newaccount && (
                <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                  <span style={{ lineHeight: "24px", width: "84px" }}>Alias:</span>
                  <span style={{ lineHeight: "24px", width: "calc(100% - 84px)" }}>
                    <UniversalTextInput
                      id="accountalias"
                      width="100%"
                      startvalue={
                        (!this.state.alias && this.state.email) || this.state.alias || undefined
                      }
                      update={!this.state.aliastouched}
                      livevalue={v => {
                        if (
                          v != this.state.alias &&
                          (newaccount || this.props.account.alias != v) &&
                          v != ""
                        ) {
                          this.setState({ alias: v, changeda: true, aliastouched: true });
                        } else {
                          this.setState({ alias: v, changeda: false, aliastouched: true });
                        }
                      }}
                    />
                  </span>
                </div>
              )}
              {newaccount ? (
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
              ) : (
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
                    {!newaccount && account.starttime
                      ? moment(account.starttime!).format("DD.MM.YYYY")
                      : "Now"}
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
                      minDate={moment(
                        moment.max(
                          moment(!newaccount ? account.starttime : moment().add(1, "days")),
                          this.state.fromdate ? moment(this.state.fromdate) : moment()
                        )
                      ).toDate()}
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
                  {`This will terminate all assignments on ${moment(this.state.todate).format(
                    "DD.MM.YYYY"
                  )}`}
                </Tag>
              )}
            </div>
            {!newaccount && (
              <>
                <h2 style={{ paddingTop: "24px", paddingBottom: "24px" }}>Users</h2>
                {account.assignments.map(
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
                        teamlicence={assignment.tags.includes("teamlicence")}
                      />
                    )
                )}
                {(!account.options || !account.options.private) && (
                  <ShowAndAddEmployee account={account} refetch={this.props.refetch} />
                )}
              </>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
              <UniversalButton
                innerRef={el => addRenderElement({ key: "cancel", element: el })}
                type="low"
                label="Cancel"
                onClick={() => {
                  this.setState(INITAL_STATE);
                  this.props.closeChange();
                }}
              />
              <UniversalButton
                innerRef={el => addRenderElement({ key: "saveAccount", element: el })}
                type="high"
                label={
                  newaccount
                    ? "Create"
                    : this.state.changeda ||
                      this.state.changede ||
                      this.state.changedp ||
                      this.state.changedt ||
                      this.state.changedl ||
                      Object.keys(this.state.loginValues).length > 0
                    ? "Save"
                    : "Close"
                }
                disabled={
                  newaccount
                    ? !(
                        (this.state.changeda && this.state.changede && this.state.changedp) ||
                        (this.props.app.options &&
                          this.props.app.options.loginFields &&
                          this.state.loginValues &&
                          Object.keys(this.state.loginValues).length ==
                            this.props.app.options.loginFields.length)
                      )
                    : (((this.state.changede || this.state.changedp) &&
                        !(this.state.changede && this.state.changedp)) ||
                        (this.state.changedl && !(this.state.changede && this.state.changedp))) &&
                      !(
                        this.props.app.options &&
                        this.props.app.options.loginFields &&
                        this.state.loginValues &&
                        Object.keys(this.state.loginValues).length ==
                          this.props.app.options.loginFields.length
                      )
                }
                onClick={async () => {
                  if (newaccount) {
                    this.setState({ saving: true });
                    try {
                      const logindata = await createEncryptedLicenceKeyObject(
                        this.state.loginValues,
                        false,
                        this.props.client
                      );
                      const newAccountData = await this.props.createAccount({
                        variables: {
                          orbitid: this.props.orbit.id,
                          alias: this.state.alias,
                          logindata,
                          starttime: this.state.fromdate || undefined,
                          endtime: this.state.todate || null
                        },
                        refetchQueries: [
                          {
                            query: fetchCompanyService,
                            variables: {
                              serviceid: this.props.app.id
                            }
                          }
                        ]
                      });
                      await this.props.refetch();
                      this.setState({ saved: true });
                      setTimeout(() => {
                        this.setState(INITAL_STATE);
                        this.props.closeChange(newAccountData.data.createAccount);
                      }, 1000);
                    } catch (err) {
                      this.setState({ error: err });
                    }
                  } else {
                    if (
                      this.state.changeda ||
                      (this.state.changede &&
                        this.state.changedp &&
                        (!account.options || (account.options.loginurl && this.state.changedl))) ||
                      this.state.changedt
                    ) {
                      this.setState({ saving: true });
                      try {
                        let logindata = undefined;
                        if (this.state.loginValues) {
                          logindata = await reencryptLicenceKeyObject(
                            account.id,
                            this.state.loginValues,
                            false,
                            this.props.client
                          );
                          if (this.state.changedl) {
                            logindata.loginurl = `${this.state.protocol}${this.state.loginurl}`;
                          }
                        }
                        await this.props.changeAccount({
                          variables: {
                            accountid: account.id,
                            alias: this.state.alias,
                            logindata,
                            endtime: this.state.todate || null,
                            isNull: !!(this.state.todate == null),
                            options:
                              (this.state.changede &&
                                this.state.changedp &&
                                this.state.changedl && {
                                  loginurl: `${this.state.protocol}${this.state.loginurl}`,
                                  selfhosting: this.state.selfhosting
                                }) ||
                              undefined
                          },
                          refetchQueries: [
                            {
                              query: fetchCompanyService,
                              variables: {
                                serviceid: this.props.app.id
                              }
                            }
                          ]
                        });
                        await this.props.refetch();
                        this.setState({ saved: true });
                        setTimeout(() => {
                          this.setState(INITAL_STATE);
                          this.props.closeChange();
                        }, 1000);
                      } catch (err) {
                        console.error(err);
                        this.setState({ error: err });
                      }
                    } else {
                      this.setState(INITAL_STATE);
                      this.props.closeChange();
                    }
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
      </AppContext.Consumer>
    );
  }
}
export default compose(
  graphql(CHANGE_ACCOUNT, { name: "changeAccount" }),
  graphql(CREATE_ACCOUNT, {
    name: "createAccount"
  })
)(withApollo(ChangeAccount));
