import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import AssignServiceToUser from "./assignServiceToUser";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";
import { concatName } from "../../../../common/functions";
import PrintServiceSquare from "../squares/printServiceSquare";
import AssignAccount from "./assignAccount";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import AssignOrbit from "./assignOrbit";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { fetchUserLicences, fetchTeam } from "../../../../queries/departments";
import Calendar from "react-calendar";
import moment, { now } from "moment";
import PrintTeamSquare from "../squares/printTeamSquare";
import account from "./account";

interface Props {
  team: any;
  close: Function;
  addOrbitToTeam: Function;
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
  memberassignments: any[];
}

const ADD_ORBIT_TO_TEAM = gql`
  mutation addOrbitToTeam($teamid: ID!, $orbitid: ID!, $assignments: JSON) {
    addOrbitToTeam(teamid: $teamid, orbitid: $orbitid, assignments: $assignments) {
      id
      services {
        id
        alias
        buytime
        endtime
        totalprice
        planid {
          id
          options
          appid {
            id
            logo
            name
            icon
            disabled
          }
        }
      }
    }
  }
`;

class AssignNewTeamOrbit extends React.Component<Props, State> {
  state = {
    service: null,
    orbit: null,
    account: null,
    saving: false,
    saved: false,
    error: null,
    editfrom: false,
    fromdate: null,
    editto: false,
    todate: null,
    memberassignments: []
  };

  showTeamMembers() {
    const members: JSX.Element[] = [];
    this.props.team.employees.forEach((e, k) => {
      if (this.state.memberassignments[k] && this.state.memberassignments[k].account) {
        members.push(
          <div
            id={k}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
              marginTop: "24px",
              position: "relative"
            }}>
            <div
              style={{
                lineHeight: "24px",
                width: "84px",
                display: "flex",
                alignItems: "center"
              }}>
              <PrintEmployeeSquare
                employee={e}
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
              <div style={{ lineHeight: "12px", marginLeft: "4px", fontSize: "10px" }}>
                {concatName(e)}
              </div>
            </div>
            <span style={{ lineHeight: "24px" }}>
              {this.state.memberassignments[k].account.alias}
            </span>
            <i
              className="fal fa-pen editbutton"
              onClick={() => {
                this.setState(oldstate => (oldstate.memberassignments[k] = {}));
              }}
            />
            {!this.state.memberassignments[k].new && (
              <i className="fad fa-exclamation-triangle warningColor warning">
                <span className="warningTitle">
                  It is your responsibility that you are allowed to share this account
                </span>
              </i>
            )}
          </div>
        );
      } else {
        members.push(
          <AssignAccount
            id={k}
            orbit={this.state.orbit}
            continue={account =>
              this.setState(
                oldstate => (oldstate.memberassignments[k] = { employeeid: e.id, account: account })
              )
            }
            leftSide={
              <div
                style={{
                  lineHeight: "24px",
                  width: "84px",
                  display: "flex",
                  alignItems: "center"
                }}>
                <PrintEmployeeSquare
                  employee={e}
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
                <div style={{ lineHeight: "12px", marginLeft: "4px", fontSize: "10px" }}>
                  {concatName(e)}
                </div>
              </div>
            }
          />
        );
      }
    });
    return members;
  }
  render() {
    console.log("CHECK", this.props, this.state);
    return (
      <PopupBase
        small={true}
        nooutsideclose={true}
        close={() => this.props.close()}
        additionalclassName="assignNewAccountPopup"
        buttonStyles={{ justifyContent: "space-between" }}>
        <h1>Assign Teamorbit</h1>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <span style={{ lineHeight: "24px", width: "84px" }}>To:</span>
          <PrintTeamSquare
            team={this.props.team}
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
            {this.props.team.name}
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
              <i
                className="fal fa-pen editbutton"
                onClick={() => this.setState({ service: null, orbit: null, account: null })}
              />
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
                  <i
                    className="fal fa-pen editbutton"
                    onClick={() => this.setState({ orbit: null, account: null })}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                    marginTop: "14px",
                    position: "relative"
                  }}>
                  <span style={{ lineHeight: "12px", width: "84px" }}></span>
                  <span style={{ lineHeight: "12px", fontSize: "10px" }}>
                    Assign accounts to team members
                  </span>
                </div>
                {this.showTeamMembers()}
              </>
            ) : (
              <AssignOrbit
                service={this.state.service}
                continue={o => this.setState({ orbit: o })}
              />
            )}
          </>
        ) : (
          <AssignServiceToUser continue={s => this.setState({ service: s })} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
          <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />
          <UniversalButton
            type="high"
            label="Save"
            disabled={
              !(
                this.state.orbit &&
                this.state.memberassignments.filter(ma => ma != null && ma.employeeid).length ==
                  this.props.team.employees.length
              )
            }
            onClick={async () => {
              this.setState({ saving: true });
              try {
                await this.props.addOrbitToTeam({
                  variables: {
                    teamid: this.props.team.unitid.id,
                    orbitid: this.state.orbit!.id,
                    assignments: this.state.memberassignments.map(ma => {
                      return { accountid: ma.account.id, employeeid: ma.employeeid };
                    })
                  },
                  refetchQueries: [
                    { query: fetchTeam, variables: { teamid: this.props.team.unitid.id } }
                  ]
                });
                this.setState({ saved: true });
                setTimeout(() => this.props.close(), 1000);
              } catch (err) {
                console.log("err");
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
  graphql(ADD_ORBIT_TO_TEAM, {
    name: "addOrbitToTeam"
  })
)(AssignNewTeamOrbit);
