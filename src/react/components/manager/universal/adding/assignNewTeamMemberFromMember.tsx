import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";
import { concatName } from "../../../../common/functions";
import PrintServiceSquare from "../squares/printServiceSquare";
import AssignAccount from "./assignAccount";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import {
  fetchTeam,
  fetchDepartmentsData,
  fetchCompanyTeams,
  fetchTeams,
  fetchUserLicences
} from "../../../../queries/departments";
import PrintTeamSquare from "../squares/printTeamSquare";
import UniversalDropDownInput from "../../../../components/universalForms/universalDropdownInput";

interface Props {
  employee: any;
  close: Function;
  addMemberToTeam: Function;
}

interface State {
  account: any;
  saving: boolean;
  saved: boolean;
  error: string | null;
  editfrom: boolean;
  fromdate: Date | Date[] | null;
  editto: boolean;
  todate: Date | Date[] | null;
  orbitassignment: any[];
  showall: boolean;
  team: any;
}

const ADD_MEMBER_TO_TEAM = gql`
  mutation addMemberToTeam($teamid: ID!, $employeeid: ID!, $assignments: JSON) {
    addMemberToTeam(teamid: $teamid, employeeid: $employeeid, assignments: $assignments) {
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

class AssignNewTeamMemberFromMember extends React.Component<Props, State> {
  state = {
    account: null,
    saving: false,
    saved: false,
    error: null,
    editfrom: false,
    fromdate: null,
    editto: false,
    todate: null,
    orbitassignment: [],
    showall: false,
    team: null
  };

  showTeamOrbits() {
    const members: JSX.Element[] = [];
    this.state.team.services.forEach((e, k) => {
      if (this.state.orbitassignment[k] && this.state.orbitassignment[k].account) {
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
              <PrintServiceSquare
                service={e}
                appidFunction={e => e.planid && e.planid.appid}
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
              <div style={{ lineHeight: "12px", marginLeft: "4px", fontSize: "10px" }}>
                {e.alias}
              </div>
            </div>
            <span style={{ lineHeight: "24px" }}>
              {this.state.orbitassignment[k].account.alias}
            </span>
            <i
              className="fal fa-pen editbutton"
              onClick={() => {
                this.setState(oldstate => (oldstate.orbitassignment[k] = {}));
              }}
            />
            {!this.state.orbitassignment[k].new && (
              <i className="fad fa-exclamation-triangle warningColor warning">
                <span className="warningTitle">
                  It is your responsibility that you are allowed to share this account
                </span>
              </i>
            )}
          </div>
        );
      } else {
        console.log("E", e);
        members.push(
          <AssignAccount
            orbit={e}
            accountFunction={e => e.accounts}
            continue={account =>
              this.setState(
                oldstate => (oldstate.orbitassignment[k] = { orbitid: e.id, account: account })
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
                <PrintServiceSquare
                  service={e}
                  appidFunction={e => e.planid && e.planid.appid}
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
                <div style={{ lineHeight: "12px", marginLeft: "4px", fontSize: "10px" }}>
                  {e.alias}
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
    console.log("PROPS", this.props, this.state);
    return (
      <PopupBase
        small={true}
        nooutsideclose={true}
        close={() => this.props.close()}
        additionalclassName="assignNewAccountPopup"
        buttonStyles={{ justifyContent: "space-between" }}>
        <h1>Assign Teammember</h1>
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
          <span style={{ lineHeight: "24px", marginLeft: "8px" }}>
            {concatName(this.props.employee)}
          </span>
        </div>
        {this.state.team ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
                marginTop: "28px",
                position: "relative"
              }}>
              <span style={{ lineHeight: "24px", width: "84px" }}>Employee:</span>
              <PrintTeamSquare
                team={this.state.team}
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
              <span style={{ lineHeight: "24px", marginLeft: "8px" }}>{this.state.team.name}</span>
              <i
                className="fal fa-pen editbutton"
                onClick={() => this.setState({ team: null, orbit: null, account: null })}
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
              <span style={{ lineHeight: "12px", fontSize: "10px" }}>Assign orbits</span>
            </div>
            {this.showTeamOrbits()}
          </>
        ) : (
          <Query pollInterval={60 * 10 * 1000 + 1000} query={fetchCompanyTeams}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }
              const teams = data.fetchCompanyTeams;
              return (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "24px",
                      position: "relative"
                    }}>
                    <span style={{ lineHeight: "24px", width: "84px" }}>Team:</span>
                    <UniversalDropDownInput
                      id="employee-search-new"
                      label="Search for users"
                      options={teams}
                      noFloating={true}
                      resetPossible={true}
                      width="300px"
                      codeFunction={team => team.unitid.id}
                      nameFunction={team => team.name}
                      renderOption={(possibleValues, i, click, value) => (
                        <div
                          key={`searchResult-${i}`}
                          className="searchResult"
                          onClick={() => click(possibleValues[i])}>
                          <span className="resultHighlight">
                            {possibleValues[i].name.substring(0, value.length)}
                          </span>
                          <span>{possibleValues[i].name.substring(value.length)}</span>
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
                      livecode={c => this.setState({ team: teams.find(a => a.unitid.id == c) })}
                      noresults="Create new user"
                      noresultsClick={v => console.log("CREATE Team")}
                      fewResults={true}
                    />
                  </div>
                  {this.state.showall && (
                    <PopupBase
                      nooutsideclose={true}
                      small={true}
                      close={() => this.setState({ showall: false })}
                      buttonStyles={{ justifyContent: "space-between" }}>
                      <h1>All Teams</h1>
                      {teams.map(team => (
                        <div className="listingDiv" key={team.id}>
                          <UniversalButton
                            type="low"
                            label={team.name}
                            onClick={() => {
                              this.setState({ showall: false });
                              this.setState({ team: team });
                            }}
                          />
                        </div>
                      ))}
                      <div className="listingDiv" key="new">
                        <UniversalButton
                          type="low"
                          label="Create new User"
                          onClick={() => this.setState({ showall: false })}
                        />
                      </div>
                      <UniversalButton type="low" label="Cancel" closingPopup={true} />
                    </PopupBase>
                  )}
                </>
              );
            }}
          </Query>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
          <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />
          <UniversalButton
            type="high"
            label="Save"
            disabled={
              !(
                this.state.team &&
                this.state.orbitassignment.length == this.state.team.services.length &&
                this.state.orbitassignment.every(oa => oa.account && oa.account.id)
              )
            }
            onClick={async () => {
              this.setState({ saving: true });
              try {
                await this.props.addMemberToTeam({
                  variables: {
                    teamid: this.state.team.unitid.id,
                    employeeid: this.props.employee!.id,
                    assignments: this.state.orbitassignment.map(oa => {
                      return { accountid: oa.account.id, orbitid: oa.orbitid };
                    })
                  },
                  refetchQueries: [
                    { query: fetchTeams, variables: { userid: this.props.employee.id } },
                    { query: fetchUserLicences, variables: { unitid: this.props.employee.id } }
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
  graphql(ADD_MEMBER_TO_TEAM, {
    name: "addMemberToTeam"
  })
)(AssignNewTeamMemberFromMember);