import * as React from "react";
import { graphql } from "@apollo/client/react/hoc";
import gql from "graphql-tag";
import compose from "lodash.flowright";
import moment, { now } from "moment";
import { Checkbox } from "@vipfy-private/vipfy-ui-lib";

import PopupBase from "../../popups/universalPopups/popupBase";
import { fetchTeam, fetchTeams, fetchUserLicences } from "../../queries/departments";
import { AppIcon } from "../ThingPicture";
import UniversalButton from "../universalButtons/universalButton";

interface Props {
  employee: any;
  team: any;
  removeMemberFromTeam: Function;
  close: Function;
}

interface State {
  todate: Date | null;
  editto: Boolean;
  deleteArray: { id: number; bool: Boolean }[];
  autodelete: Boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

const REMOVE_MEMBER_FROM_TEAM = gql`
  mutation removeMemberFromTeam($teamid: ID!, $userid: ID!, $deletejson: JSON, $endtime: Date) {
    removeMemberFromTeam(
      teamid: $teamid
      userid: $userid
      deletejson: $deletejson
      endtime: $endtime
    ) {
      id
      employees {
        id
      }
    }
  }
`;

const INITAL_STATE = {
  savingObject: null,
  todate: new Date(),
  editto: false,
  autodelete: true,
  saving: false,
  saved: false,
  error: null
};

class RemoveTeamMember extends React.Component<Props, State> {
  state = {
    ...INITAL_STATE,
    deleteArray: this.props.employee.assignments
      .filter(
        asa =>
          asa && asa.assignoptions && asa.assignoptions.teamlicence == this.props.team.unitid.id
      )
      .map(asa => ({ id: asa.assignmentid, bool: false }))
  };

  printAssignments() {
    const assignments: JSX.Element[] = [];

    if (this.props.employee.assignments) {
      this.props.employee.assignments
        .filter(
          asa =>
            asa &&
            (asa.endtime == null || moment(asa.endtime).isAfter()) &&
            asa.assignoptions &&
            asa.assignoptions.teamlicence == this.props.team.unitid.id
        )
        .forEach((asa, k) => {
          assignments.push(
            <div style={{ marginBottom: "16px" }}>
              <Checkbox
                title="Check to delete assignment"
                name={`checkbox_delete_assignment__${k}`}
                checked={this.state.deleteArray[k] && this.state.deleteArray[k].bool}
                handleChange={v => {
                  if (v) {
                    this.setState(
                      oldstate => (oldstate.deleteArray[k] = { id: asa.assignmentid, bool: v })
                    );
                  }
                }}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <AppIcon id={asa.boughtplanid.planid.appid} size={24} />
                  <div style={{ marginLeft: "8px" }}>{asa.alias}</div>
                </span>
              </Checkbox>
            </div>
          );
        });
    }

    return assignments;
  }

  render() {
    const employee = this.props.employee;

    return (
      <PopupBase
        small={true}
        close={() => this.props.close()}
        nooutsideclose={true}
        buttonStyles={{ justifyContent: "space-between" }}>
        <h1 style={{ display: "block", textAlign: "center", marginBottom: "24px" }}>
          Remove Member
        </h1>
        {/* Quick fix. Database has to be changed
        <div style={{ position: "relative", marginLeft: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
              marginTop: "28px",
              position: "relative"
            }}>
            <span style={{ lineHeight: "24px", width: "84px" }}>Enddate:</span>
            <span style={{ lineHeight: "24px" }}>
              {this.state.todate &&
              moment(this.state.todate!).format("DD.MM.YYYY") !=
                moment(new Date()).format("DD.MM.YYYY")
                ? moment(this.state.todate!).format("DD.MM.YYYY")
                : "Now"}
            </span>
            <i
              className="fal fa-pen editbutton"
              style={{ position: "relative", marginLeft: "16px" }}
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
                  minDate={new Date()}
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
                </div>*/}

        <h3 style={{ marginBottom: "16px" }}>Check to delete assignment</h3>
        {this.printAssignments()}

        <hr />

        <div
          style={{
            paddingTop: "16px"
          }}>
          <Checkbox
            title="Also delete account/orbit if no assignment left"
            name="auto-delete"
            checked={this.state.autodelete}
            handleChange={v => {
              this.setState({ autodelete: v });
            }}>
            Also delete account/orbit if no assignment left
          </Checkbox>
        </div>

        <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />

        <UniversalButton
          type="high"
          label="Save"
          onClick={async () => {
            try {
              this.setState({ saving: true });
              await this.props.removeMemberFromTeam({
                variables: {
                  teamid: this.props.team.unitid.id,
                  userid: employee!.id,
                  deletejson: {
                    assignments: this.state.deleteArray,
                    autodelete: this.state.autodelete
                  },
                  endtime: this.state.todate || now()
                },
                refetchQueries: [
                  { query: fetchTeam, variables: { teamid: this.props.team.unitid.id } },
                  { query: fetchTeams, variables: { userid: employee!.id } },
                  { query: fetchUserLicences, variables: { unitid: employee!.id } }
                ]
              });
              this.setState({ saved: true });
              setTimeout(() => this.props.close(), 1000);
            } catch (error) {
              console.log("error", error);
              this.setState({ error: error });
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

export default compose(graphql(REMOVE_MEMBER_FROM_TEAM, { name: "removeMemberFromTeam" }))(
  RemoveTeamMember
);
