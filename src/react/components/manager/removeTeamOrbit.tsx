import * as React from "react";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { fetchTeam } from "../../queries/departments";
import { graphql } from "react-apollo";
import compose from "lodash.flowright";
import gql from "graphql-tag";
import moment, { now } from "moment";
import { concatName } from "../../common/functions";
import Calendar from "react-calendar";
import EmployeePicture from "../EmployeePicture";
import PrintTeamSquare from "./universal/squares/printTeamSquare";

interface Props {
  orbit: any;
  team: any;
  removeTeamOrbitFromTeam: Function;
  close: Function;
}

interface State {
  todate: Date;
  editto: Boolean;
  orbitoption: number;
  autodelete: Boolean;
  deleteArray: Object;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

const REMOVE_TEAMORBIT_FROM_TEAM = gql`
  mutation removeTeamOrbitFromTeam($teamid: ID!, $orbitid: ID!, $deletejson: JSON, $endtime: Date) {
    removeTeamOrbitFromTeam(
      teamid: $teamid
      orbitid: $orbitid
      deletejson: $deletejson
      endtime: $endtime
    ) {
      id
      services {
        id
        endtime
        accounts {
          id
          endtime
          assignments {
            id
            teamlicence {
              id
            }
            teamaccount {
              id
            }
            alias
            rightscount
            accountid
            assignmentid
            assignoptions
          }
        }
        teams {
          id
        }
      }
    }
  }
`;

class RemoveTeamOrbit extends React.Component<Props, State> {
  state = {
    todate: new Date(),
    editto: false,
    orbitoption: 0,
    deleteArray: {
      orbit: false,
      teams: this.props.orbit.teams.map(t => {
        return { id: t.unitid.id, bool: false };
      }),
      accounts: this.props.orbit.accounts.map(a => {
        console.log("TEST Account", a);
        if (a) {
          return {
            id: a.id,
            bool: false,
            assignments: a.assignments
              .filter(asa => asa != null && (asa.endtime == null || asa.endtime > now()))
              .map(as => {
                if (as) {
                  return { id: as.assignmentid, bool: false };
                } else {
                  return undefined;
                }
              })
          };
        }
      })
    },
    autodelete: true,
    saving: false,
    saved: false,
    error: null
  };

  returnEmptyDeleteArray() {
    return {
      orbit: false,
      teams: this.props.orbit.teams.map(t => {
        return { id: t.unitid.id, bool: false };
      }),
      accounts: this.props.orbit.accounts
        .filter(a => a != null && (a.endtime == null || a.endtime > now()))
        .map(a => {
          return {
            id: a.id,
            bool: false,
            assignments: a.assignments
              .filter(asa => asa != null && (asa.endtime == null || asa.endtime > now()))
              .map(as => {
                if (as) {
                  return { id: as.assignmentid, bool: false };
                } else {
                  return undefined;
                }
              })
          };
        })
    };
  }

  render() {
    const accounts: JSX.Element[] = [];
    const teamsARRAY: JSX.Element[] = [];

    this.props.orbit.teams.forEach((team, indext) => {
      teamsARRAY.push(
        <>
          <div
            key={`team-${indext}-1`}
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative"
            }}>
            <span
              style={{
                lineHeight: "24px",
                width: "24px",
                display: "flex",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: "lighter"
              }}>
              |
            </span>
          </div>
          <div
            key={`team-${indext}`}
            style={Object.assign(
              {},
              {
                display: "flex",
                alignItems: "center",
                position: "relative",
                cursor: "pointer"
              },
              this.props.team.unitid.id == team.unitid.id
                ? { backgroundColor: "rgb(156, 19, 188, 0.1)" }
                : {}
            )}
            onClick={() =>
              this.setState(oldstate => {
                const array = oldstate.deleteArray;
                const newbool = !array.teams.find(t => t.id == team.unitid.id).bool;
                array.teams.find(t => t.id == team.unitid.id).bool = newbool;
                if (!newbool) {
                  array.orbit = false;
                }
                //When autodelete and no children
                if (oldstate.autodelete) {
                  if (
                    !array.teams.find(t => !t || !t.bool) &&
                    !array.accounts.find(a => !a || !a.bool)
                  ) {
                    array.orbit = true;
                  }
                }
                return { orbitoption: 4, deleteArray: array };
              })
            }>
            <span
              style={{
                lineHeight: "24px",
                width: "24px",
                display: "flex",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: "lighter"
              }}>
              |
            </span>
            <PrintTeamSquare
              team={team}
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
                maxWidth: "calc(100% - 56px)",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
              {team.name}
            </span>
            {this.state.deleteArray.teams.find(t => t.id == team.unitid.id).bool && (
              <div
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "0px",
                  width: "100%",
                  height: "24px",
                  display: "flex",
                  alignItems: "center"
                }}>
                <div
                  style={{
                    borderTop: "2px solid",
                    width: "180px",
                    height: "1px",
                    marginLeft: "18px"
                  }}></div>
              </div>
            )}
          </div>
        </>
      );
    });

    this.props.orbit.accounts.forEach((account, indexa) => {
      const assignments: JSX.Element[] = [];
      let outsideAssignment = false;
      if (account && (account.endtime == null || account.endtime > now())) {
        account.assignments.forEach((assignment, index) => {
          if (assignment && (assignment.endtime == null || assignment.endtime > now())) {
            assignments.push(
              <>
                <div
                  key={`assignment-${indexa}-|`}
                  style={{ display: "flex", alignItems: "center", position: "relative" }}>
                  <span
                    style={{
                      lineHeight: "24px",
                      width: "24px",
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: "lighter"
                    }}>
                    |
                  </span>
                  <span
                    style={{
                      lineHeight: "24px",
                      width: "24px",
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: "lighter"
                    }}>
                    |
                  </span>
                </div>
                <div
                  key={`assignment-${indexa}-${index}`}
                  style={Object.assign(
                    {},
                    {
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                      cursor: "pointer"
                    },
                    assignment &&
                      assignment.assignoptions &&
                      this.props.team.unitid.id == assignment.assignoptions.teamlicence
                      ? { backgroundColor: "rgb(156, 19, 188, 0.1)" }
                      : {}
                  )}
                  onClick={() =>
                    this.setState(oldstate => {
                      const array = oldstate.deleteArray;
                      const newbool = !(
                        array.accounts.find(a => a.id == account.id) &&
                        array.accounts
                          .find(a => a.id == account.id)
                          .assignments.find(as => as.id == assignment.assignmentid) &&
                        array.accounts
                          .find(a => a.id == account.id)
                          .assignments.find(as => as.id == assignment.assignmentid).bool
                      );

                      //When deselect => deselect parents
                      if (!newbool) {
                        array.orbit = false;
                        array.accounts.find(a => a.id == account.id).bool = false;
                      }
                      if (
                        array.accounts.find(a => a.id == account.id) &&
                        array.accounts
                          .find(a => a.id == account.id)
                          .assignments.find(as => as.id == assignment.assignmentid)
                      ) {
                        array.accounts
                          .find(a => a.id == account.id)
                          .assignments.find(as => as.id == assignment.assignmentid).bool = newbool;
                      }
                      //When autodelete and no children
                      if (oldstate.autodelete) {
                        if (
                          !array.accounts
                            .find(a => a.id == account.id)
                            .assignments.find(as => !as.bool)
                        ) {
                          array.accounts.find(a => a.id == account.id).bool = true;
                          if (
                            !array.teams.find(t => !t.bool) &&
                            !array.accounts.find(a => !a.bool)
                          ) {
                            array.orbit = true;
                          }
                        }
                      }
                      return { orbitoption: 4, deleteArray: array };
                    })
                  }>
                  <span
                    style={{
                      lineHeight: "24px",
                      width: "24px",
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: "lighter"
                    }}>
                    |
                  </span>
                  <span
                    style={{
                      lineHeight: "24px",
                      width: "24px",
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: "lighter"
                    }}>
                    |
                  </span>
                  <EmployeePicture
                    employee={assignment && assignment.unitid}
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
                      maxWidth: "calc(100% - 80px)",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                    {concatName(assignment.unitid)}
                  </span>
                  {this.state.deleteArray.accounts.find(a => a.id == account.id) &&
                    this.state.deleteArray.accounts
                      .find(a => a.id == account.id)
                      .assignments.find(as => as.id == assignment.assignmentid) &&
                    this.state.deleteArray.accounts
                      .find(a => a.id == account.id)
                      .assignments.find(as => as.id == assignment.assignmentid).bool && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0px",
                          left: "0px",
                          width: "100%",
                          height: "24px",
                          display: "flex",
                          alignItems: "center"
                        }}>
                        <div
                          style={{
                            borderTop: "2px solid",
                            width: "180px",
                            height: "1px",
                            marginLeft: "42px"
                          }}></div>
                      </div>
                    )}
                </div>
              </>
            );
          }
        });
        account.outsideAssignment = outsideAssignment;
        accounts.push(
          <>
            <div
              key={`account-${indexa}-1`}
              style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <span
                style={{
                  lineHeight: "24px",
                  width: "24px",
                  display: "flex",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: "lighter"
                }}>
                |
              </span>
            </div>
            <div
              key={`account-${indexa}`}
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                cursor: "pointer"
              }}
              onClick={() =>
                this.setState(oldstate => {
                  const array = oldstate.deleteArray;
                  const newbool = !array.accounts.find(a => a.id == account.id).bool;

                  //When deselect => deselect parents
                  if (!newbool) {
                    array.orbit = false;
                  }
                  //When select => select all children
                  if (newbool) {
                    array.accounts
                      .find(a => a.id == account.id)
                      .assignments.forEach(as => (as.bool = true));
                  }
                  array.accounts.find(a => a.id == account.id).bool = newbool;

                  //When autodelete and no children
                  if (oldstate.autodelete) {
                    if (!array.teams.find(t => !t.bool) && !array.accounts.find(a => !a.bool)) {
                      array.orbit = true;
                    }
                  }
                  return { orbitoption: 4, deleteArray: array };
                })
              }>
              <span
                style={{
                  lineHeight: "24px",
                  width: "24px",
                  display: "flex",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: "lighter"
                }}>
                |
              </span>
              <span
                style={{
                  lineHeight: "24px",
                  maxWidth: "calc(100% - 24px)",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                {account.alias}
              </span>
              {this.state.deleteArray &&
                this.state.deleteArray.accounts.find(a => a.id == account.id) &&
                this.state.deleteArray.accounts.find(a => a.id == account.id).bool && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0px",
                      left: "0px",
                      width: "100%",
                      height: "24px",
                      display: "flex",
                      alignItems: "center"
                    }}>
                    <div
                      style={{
                        borderTop: "2px solid",
                        width: "180px",
                        height: "1px",
                        marginLeft: "18px"
                      }}></div>
                  </div>
                )}
            </div>
            {assignments}
          </>
        );
      }
    });

    console.log(this.props.orbit);

    return (
      <PopupBase
        nooutsideclose={true}
        close={() => this.props.close()}
        additionalclassName="assignNewAccountPopup"
        buttonStyles={{ justifyContent: "space-between" }}>
        <h1>Remove {this.props.orbit.alias}</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridColumnGap: "48px",
            minHeight: "262px"
          }}>
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
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <span
                style={{
                  lineHeight: "24px",
                  width: "84px",
                  display: "flex",
                  justifyContent: "center"
                }}>
                <UniversalCheckbox
                  name="Orbit-1"
                  liveValue={v => {
                    if (v) {
                      this.setState(oldstate => {
                        const array = this.returnEmptyDeleteArray();
                        array.teams.find(t => t.id == this.props.team.unitid.id).bool = true;
                        return {
                          orbitoption: 1,
                          deleteArray: array
                        };
                      });
                    } else {
                      this.setState({ orbitoption: 0, deleteArray: this.returnEmptyDeleteArray() });
                    }
                  }}
                  startingvalue={this.state.orbitoption == 1}
                />
              </span>

              <span
                style={{ lineHeight: "24px", cursor: "pointer" }}
                onClick={() =>
                  this.setState(oldstate => {
                    if (oldstate.orbitoption != 1) {
                      const array = this.returnEmptyDeleteArray();
                      array.teams.find(t => t.id == this.props.team.unitid.id).bool = true;
                      return {
                        orbitoption: 1,
                        deleteArray: array
                      };
                    } else {
                      return {
                        orbitoption: 0,
                        deleteArray: this.returnEmptyDeleteArray()
                      };
                    }
                  })
                }>
                Remove Orbit from team but keep all assignments
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <span
                style={{
                  lineHeight: "24px",
                  width: "84px",
                  display: "flex",
                  justifyContent: "center"
                }}>
                <UniversalCheckbox
                  name="Orbit-2"
                  liveValue={v => {
                    if (v) {
                      this.setState(oldstate => {
                        const array = this.returnEmptyDeleteArray();
                        //Delete Team
                        array.teams.find(t => t.id == this.props.team.unitid.id).bool = true;
                        //Delete all team assignments
                        array.accounts.forEach(a =>
                          a.assignments.forEach(as => {
                            if (this.props.orbit.accounts.find(oa => oa.id == a.id)) {
                              if (
                                this.props.orbit.accounts
                                  .find(oa => oa.id == a.id)
                                  .assignments.find(oas => oas.assignmentid == as.id)
                              ) {
                                if (
                                  this.props.orbit.accounts
                                    .find(oa => oa.id == a.id)
                                    .assignments.find(oas => oas.assignmentid == as.id)
                                    .assignoptions &&
                                  this.props.orbit.accounts
                                    .find(oa => oa.id == a.id)
                                    .assignments.find(oas => oas.assignmentid == as.id)
                                    .assignoptions.teamlicence == this.props.team.unitid.id
                                ) {
                                  as.bool = true;
                                }
                              }
                            }
                            if (oldstate.autodelete) {
                              if (
                                !array.accounts
                                  .find(da => da.id == a.id)
                                  .assignments.find(das => !das.bool)
                              ) {
                                array.accounts.find(da => da.id == a.id).bool = true;
                                if (
                                  !array.teams.find(dt => !dt.bool) &&
                                  !array.accounts.find(da => !da.bool)
                                ) {
                                  array.orbit = true;
                                }
                              }
                            }
                          })
                        );
                        return {
                          orbitoption: 2,
                          deleteArray: array
                        };
                      });
                    } else {
                      this.setState({ orbitoption: 0, deleteArray: this.returnEmptyDeleteArray() });
                    }
                  }}
                  startingvalue={this.state.orbitoption == 2}
                />
              </span>

              <span
                style={{ lineHeight: "24px", cursor: "pointer" }}
                onClick={() =>
                  this.setState(oldstate => {
                    if (oldstate.orbitoption != 2) {
                      this.setState(oldstate => {
                        const array = this.returnEmptyDeleteArray();
                        //Delete Team
                        array.teams.find(t => t.id == this.props.team.unitid.id).bool = true;
                        //Delete all team assignments
                        array.accounts.forEach(a =>
                          a.assignments.forEach(as => {
                            if (this.props.orbit.accounts.find(oa => oa.id == a.id)) {
                              if (
                                this.props.orbit.accounts
                                  .find(oa => oa.id == a.id)
                                  .assignments.find(oas => oas.assignmentid == as.id)
                              ) {
                                if (
                                  this.props.orbit.accounts
                                    .find(oa => oa.id == a.id)
                                    .assignments.find(oas => oas.assignmentid == as.id)
                                    .assignoptions &&
                                  this.props.orbit.accounts
                                    .find(oa => oa.id == a.id)
                                    .assignments.find(oas => oas.assignmentid == as.id)
                                    .assignoptions.teamlicence == this.props.team.unitid.id
                                ) {
                                  as.bool = true;
                                }
                              }
                            }
                            if (oldstate.autodelete) {
                              if (
                                !array.accounts
                                  .find(da => da.id == a.id)
                                  .assignments.find(das => !das.bool)
                              ) {
                                array.accounts.find(da => da.id == a.id).bool = true;
                                if (
                                  !array.teams.find(dt => !dt.bool) &&
                                  !array.accounts.find(da => !da.bool)
                                ) {
                                  array.orbit = true;
                                }
                              }
                            }
                          })
                        );
                        return {
                          orbitoption: 2,
                          deleteArray: array
                        };
                      });
                    } else {
                      return {
                        orbitoption: 0,
                        deleteArray: this.returnEmptyDeleteArray()
                      };
                    }
                  })
                }>
                Remove Orbit from team and all related assignments
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <span
                style={{
                  lineHeight: "24px",
                  width: "84px",
                  display: "flex",
                  justifyContent: "center"
                }}>
                <UniversalCheckbox
                  name="Orbit-3"
                  liveValue={v => {
                    if (v) {
                      this.setState({
                        orbitoption: 3,
                        deleteArray: {
                          orbit: true,
                          teams: this.props.orbit.teams.map(t => {
                            return { id: t.unitid.id, bool: true };
                          }),
                          accounts: this.props.orbit.accounts.map(a => {
                            if (a) {
                              return {
                                id: a.id,
                                bool: true,
                                assignments: a.assignments.map(as => {
                                  return { id: as.assignmentid, bool: true };
                                })
                              };
                            }
                          })
                        }
                      });
                    } else {
                      this.setState({ orbitoption: 0, deleteArray: this.returnEmptyDeleteArray() });
                    }
                  }}
                  startingvalue={this.state.orbitoption == 3}
                />
              </span>

              <span
                style={{ lineHeight: "24px", cursor: "pointer" }}
                onClick={() =>
                  this.setState(oldstate => {
                    if (oldstate.orbitoption != 3) {
                      this.setState({
                        orbitoption: 3,
                        deleteArray: {
                          orbit: true,
                          teams: this.props.orbit.teams.map(t => {
                            return { id: t.unitid.id, bool: true };
                          }),
                          accounts: this.props.orbit.accounts.map(a => {
                            if (a) {
                              return {
                                id: a.id,
                                bool: true,
                                assignments: a.assignments.map(as => {
                                  return { id: as.assignmentid, bool: true };
                                })
                              };
                            }
                          })
                        }
                      });
                    } else {
                      return {
                        orbitoption: 0,
                        deleteArray: this.returnEmptyDeleteArray()
                      };
                    }
                  })
                }>
                Remove Orbit from team and completely delete it
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <span
                style={{
                  lineHeight: "24px",
                  width: "84px",
                  display: "flex",
                  justifyContent: "center"
                }}>
                <UniversalCheckbox
                  name="Orbit-4"
                  liveValue={v => {
                    if (v) {
                      this.setState(oldstate => {
                        const array = this.returnEmptyDeleteArray();
                        array.teams.find(t => t.id == this.props.team.unitid.id).bool = true;
                        return {
                          orbitoption: 4,
                          deleteArray: array
                        };
                      });
                    } else {
                      this.setState({ orbitoption: 0, deleteArray: this.returnEmptyDeleteArray() });
                    }
                  }}
                  startingvalue={this.state.orbitoption == 4}
                />
              </span>

              <span
                style={{ lineHeight: "24px", cursor: "pointer" }}
                onClick={() =>
                  this.setState(oldstate => {
                    if (oldstate.orbitoption != 4) {
                      this.setState(oldstate => {
                        const array = this.returnEmptyDeleteArray();
                        array.teams.find(t => t.id == this.props.team.unitid.id).bool = true;
                        return {
                          orbitoption: 4,
                          deleteArray: array
                        };
                      });
                    } else {
                      return {
                        orbitoption: 0,
                        deleteArray: this.returnEmptyDeleteArray()
                      };
                    }
                  })
                }>
                Configure yourself
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "24px"
              }}>
              <span
                style={{
                  lineHeight: "24px",
                  width: "84px",
                  display: "flex",
                  justifyContent: "center"
                }}>
                <UniversalCheckbox
                  name="auto-delete"
                  liveValue={v => {
                    if (v) {
                      this.setState({ autodelete: true });
                    } else {
                      this.setState({ autodelete: false });
                    }
                  }}
                  startingvalue={this.state.autodelete}
                />
              </span>

              <span
                style={{ lineHeight: "24px" }}
                onClick={() =>
                  this.setState(oldstate => {
                    return {
                      autodelete: !oldstate.autodelete
                    };
                  })
                }>
                Auto delete account and orbit when no assignment
              </span>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              maxWidth: "500px",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
            {/*this.state.orbitoption != 3 && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  left: "0px",
                  top: "0px",
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: "rgba(255,255,255,0.5)"
                }}></div>
              )*/}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                cursor: "pointer"
              }}
              onClick={() =>
                this.setState(oldstate => {
                  const array = oldstate.deleteArray;
                  const newbool = !array.orbit;

                  //When select => select all children
                  if (newbool) {
                    array.accounts &&
                      array.accounts.forEach(
                        a => a && a.assignments.forEach(asa => asa && (asa.bool = true))
                      );
                    array.accounts && array.accounts.forEach(a => a && (a.bool = true));
                    array.teams && array.teams.forEach(t => t && (t.bool = true));
                  }
                  array.orbit = newbool;

                  return { orbitoption: 4, deleteArray: array };
                })
              }>
              <span
                style={{
                  lineHeight: "24px",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                Orbit "{this.props.orbit.alias}"
              </span>
              {this.state.deleteArray.orbit && (
                <div
                  style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    width: "100%",
                    height: "24px",
                    display: "flex",
                    alignItems: "center"
                  }}>
                  <div
                    style={{
                      borderTop: "2px solid",
                      width: "180px",
                      height: "1px",
                      marginLeft: "-6px"
                    }}></div>
                </div>
              )}
            </div>
            {teamsARRAY}
            {accounts}
          </div>
        </div>
        <UniversalButton type="low" label="Cancel" onClick={() => this.props.close()} />
        <UniversalButton
          type="high"
          label="Save"
          disabled={
            !(
              this.state.deleteArray.orbit ||
              (this.state.deleteArray.teams &&
                this.state.deleteArray.teams.find(t => t && t.bool)) ||
              (this.state.deleteArray.accounts &&
                this.state.deleteArray.accounts.find(a => a && a.bool)) ||
              (this.state.deleteArray.accounts &&
                this.state.deleteArray.accounts.forEach(
                  a => a && a.assignments.find(asa => asa && asa.bool)
                ))
            )
          }
          onClick={async () => {
            this.setState({ saving: true });
            try {
              await this.props.removeTeamOrbitFromTeam({
                variables: {
                  teamid: this.props.team.unitid.id,
                  orbitid: this.props.orbit.id,
                  deletejson: this.state.deleteArray,
                  endtime: this.state.todate || new Date()
                },
                refetchQueries: [
                  { query: fetchTeam, variables: { teamid: this.props.team.unitid.id } }
                ]
              });
              this.setState({ saved: true });
              setTimeout(() => this.props.close(), 1000);
            } catch (error) {
              console.log("ERROR", error);
              this.setState({ error });
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
export default compose(graphql(REMOVE_TEAMORBIT_FROM_TEAM, { name: "removeTeamOrbitFromTeam" }))(
  RemoveTeamOrbit
);
