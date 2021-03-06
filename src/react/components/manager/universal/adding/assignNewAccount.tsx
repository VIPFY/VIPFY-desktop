import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import AssignServiceToUser from "./assignServiceToUser";
import EmployeePicture from "../../../EmployeePicture";
import { concatName } from "../../../../common/functions";
import PrintServiceSquare from "../squares/printServiceSquare";
import AssignAccount from "./assignAccount";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import AssignOrbit from "./assignOrbit";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import { fetchUserLicences } from "../../../../queries/departments";
import Calendar from "react-calendar";
import moment, { now } from "moment";
import { encryptForUser, createLicenceKeyFragmentForUser } from "../../../../common/licences";

interface Props {
  employee: any;
  close: Function;
  assignAccount: Function;
  service?: any;
  moveTo: Function;

  refetch?: Function;
  noServiceEdit?: Boolean;
  client: any;
  isEmployee?: boolean;
  orbit?: any;
}

interface State {
  service: any;
  orbit: any;
  account: any;
  saving: boolean;
  saved: boolean;
  error: string | null;
  editfrom: boolean;
  fromdate: Date | Date[] | null;
  editto: boolean;
  todate: Date | Date[] | null;
}

const ASSIGN_ACCOUNT = gql`
  mutation assignAccount(
    $licenceid: ID!
    $userid: ID!
    $rights: LicenceRights
    $tags: [String]
    $starttime: Date
    $endtime: Date
    $keyfragment: JSON
  ) {
    assignAccount(
      licenceid: $licenceid
      userid: $userid
      rights: $rights
      tags: $tags
      starttime: $starttime
      endtime: $endtime
      keyfragment: $keyfragment
    )
  }
`;

class AssignNewAccount extends React.Component<Props, State> {
  state = {
    service: this.props.service || null,
    orbit: this.props.orbit || null,
    account: null,
    saving: false,
    saved: false,
    error: null,
    editfrom: false,
    fromdate: null,
    editto: false,
    todate: null
  };

  render() {
    return (
      <PopupBase
        small={true}
        nooutsideclose={true}
        close={() => this.props.close()}
        additionalclassName="assignNewAccountPopup"
        buttonStyles={{ justifyContent: "space-between" }}>
        <h1>Assign Account</h1>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <span style={{ lineHeight: "24px", width: "84px" }}>To:</span>
          <EmployeePicture
            employee={this.props.employee}
            size={24}
            style={{
              lineHeight: "24px",
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
        {this.state.service ? (
          <>
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
                service={this.state.service}
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
              <span style={{ lineHeight: "24px", marginLeft: "8px" }}>
                {this.state.service.name}
              </span>
              {!this.props.noServiceEdit ||
                (!this.props.isEmployee && (
                  <i
                    className="fal fa-pen editbutton"
                    onClick={() => this.setState({ service: null, orbit: null, account: null })}
                  />
                ))}
            </div>
            {this.state.orbit ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "24px",
                    marginTop: "28px",
                    position: "relative"
                  }}>
                  <span style={{ lineHeight: "24px", width: "84px" }}>Orbit:</span>
                  <span style={{ lineHeight: "24px" }}>{this.state.orbit.alias}</span>

                  {!this.props.isEmployee && (
                    <i
                      className="fal fa-pen editbutton"
                      onClick={() => this.setState({ orbit: null, account: null })}
                    />
                  )}
                </div>
                {this.state.account ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "24px",
                        marginTop: "28px",
                        position: "relative"
                      }}>
                      <span style={{ lineHeight: "24px", width: "84px" }}>Account:</span>
                      <span style={{ lineHeight: "24px" }}>{this.state.account.alias}</span>
                      <i
                        className="fal fa-pen editbutton"
                        onClick={() => this.setState({ account: null })}
                      />
                      {!this.state.account.new && (
                        <i className="fad fa-exclamation-triangle warningColor warning">
                          <span className="warningTitle">
                            It is your responsibility that you are allowed to share this account
                          </span>
                        </i>
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
                  </>
                ) : (
                    <AssignAccount
                      orbit={this.state.orbit}
                      continue={a => this.setState({ account: a })}
                    />
                  )}
              </>
            ) : this.state.service.options.pending ? (
              <div>
                Sorry you can't create Orbits for pending services. Please wait until this issue has
                been solved
              </div>
            ) : (
                  <AssignOrbit
                    service={this.state.service}
                    continue={o => this.setState({ orbit: o })}
                  />
                )}
          </>
        ) : (
            <AssignServiceToUser
              continue={s => this.setState({ service: s })}
              moveTo={this.props.moveTo}
            />
          )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
          <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />
          <UniversalButton
            type="high"
            label="Save"
            disabled={!this.state.account}
            onClick={async () => {
              this.setState({ saving: true });
              try {
                const keyfragment = this.state.account!.unencryptedLoginData ?
                  await encryptForUser(this.props.employee.id, this.state.account!.unencryptedLoginData, this.props.client)
                  : await createLicenceKeyFragmentForUser(
                    this.state.account!.id,
                    this.props.employee.id,
                    this.props.client
                  );

                await this.props.assignAccount({
                  variables: {
                    licenceid: this.state.account!.id,
                    userid: this.props.employee.id,
                    rights: { view: true, use: true },
                    starttime: this.state.fromdate || undefined,
                    endtime: this.state.todate || undefined,
                    keyfragment
                  },
                  refetchQueries: [
                    {
                      query: fetchUserLicences,
                      variables: { unitid: this.props.employee.id }
                    }
                  ]
                });
                if (this.props.refetch) {
                  await this.props.refetch();
                }
                this.setState({ saved: true });
                setTimeout(() => this.props.close(), 1000);
              } catch (err) {
                console.log("ERROR", err);
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
  graphql(ASSIGN_ACCOUNT, {
    name: "assignAccount"
  })
)(withApollo(AssignNewAccount));
