import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchTeams, fetchUserLicences, fetchUsersOwnLicences } from "../../queries/departments";
import moment = require("moment");
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import AddEmployeeToTeam from "./addEmployeeToTeam";
import CoolCheckbox from "../CoolCheckbox";
import UniversalCheckbox from "../universalForms/universalCheckbox";

interface Props {
  employeeid: number;
  employeename: string;
}

interface State {
  delete: Boolean;
  confirm: Boolean;
  network: Boolean;
  deleted: Boolean;
  add: Boolean;
  keepLicences: number[];
}

const REMOVE_EMPLOYEE_FROM_TEAM = gql`
  mutation removeFromTeam($teamid: ID!, $userid: ID!, $keepLicences: [ID!]) {
    removeFromTeam(teamid: $teamid, userid: $userid, keepLicences: $keepLicences)
  }
`;

class TeamsSection extends React.Component<Props, State> {
  state = {
    delete: false,
    confirm: false,
    network: false,
    deleted: false,
    add: false,
    keepLicences: []
  };

  printRemoveLicences(team) {
    let RLicencesArray: JSX.Element = [];

    team.services.forEach((service, int) => {
      RLicencesArray.push(
        <li key={int}>
          <UniversalCheckbox
            name={service.id}
            startingvalue={true}
            liveValue={v =>
              v
                ? this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences.splice(
                      prevState.keepLicences.findIndex(l => l == service.id),
                      1
                    );
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
                : this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences;
                    keepLicencesNew.push(service.id);
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
            }>
            <span>Delete licence of {service.planid.appid.name}</span>
          </UniversalCheckbox>
        </li>
      );
    });
    return RLicencesArray != [] ? <ul style={{ marginTop: "20px" }}>{RLicencesArray}</ul> : "";
  }

  render() {
    const employeeid = this.props.employeeid;
    const employeename = this.props.employeename;
    return (
      <Query query={fetchTeams} variables={{ userid: employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          let teamArray: JSX.Element[] = [];
          if (data.fetchTeams) {
            data.fetchTeams.sort(function(a, b) {
              let nameA = a.name.toUpperCase(); // ignore upper and lowercase
              let nameB = b.name.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }

              // namen müssen gleich sein
              return 0;
            });
            data.fetchTeams.forEach((team, k) => {
              teamArray.push(
                <Mutation mutation={REMOVE_EMPLOYEE_FROM_TEAM}>
                  {removeFromTeam => (
                    <div className="tableRow">
                      <div className="tableMain">
                        <div className="tableColumnSmall">
                          <div
                            className="managerSquare"
                            style={
                              team.profilepicture
                                ? {
                                    backgroundImage:
                                      team.profilepicture.indexOf("/") != -1
                                        ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                                            team.profilepicture
                                          )})`
                                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                            team.profilepicture
                                          )})`,
                                    backgroundColor: "unset"
                                  }
                                : team.internaldata && team.internaldata.color
                                ? { backgroundColor: team.internaldata.color }
                                : {}
                            }>
                            {team.profilepicture
                              ? ""
                              : team.internaldata && team.internaldata.letters
                              ? team.internaldata.letters
                              : team.name.slice(0, 1)}
                          </div>
                          <span className="name">{team.name}</span>
                        </div>
                        <div className="tableColumnSmall content">
                          {team.internaldata ? team.internaldata.leader : ""}
                        </div>
                        <div className="tableColumnSmall content">{team.employeenumber}</div>
                        <div className="tableColumnSmall content">
                          {team.licences ? team.licences.length : ""}
                        </div>
                        <div className="tableColumnSmall content">
                          {moment(team.createdate - 0).format("DD.MM.YYYY")}
                        </div>
                      </div>
                      <div className="tableEnd">
                        <div className="editOptions">
                          <i
                            className="fal fa-trash-alt"
                            onClick={() => this.setState({ delete: true })}
                          />
                        </div>
                      </div>

                      {this.state.delete ? (
                        <PopupBase
                          small={true}
                          close={() => this.setState({ delete: false })}
                          closeable={false}>
                          <p>
                            Do you really want to remove {this.props.employeename} from{" "}
                            <b>{team.name}</b>
                            {this.printRemoveLicences(team)}
                          </p>
                          <UniversalButton type="low" closingPopup={true} label="Cancel" />
                          <UniversalButton
                            type="low"
                            label="Delete"
                            onClick={async () => {
                              this.setState({ confirm: true, network: true, deleted: false });
                              try {
                                await removeFromTeam({
                                  variables: {
                                    teamid: team.unitid.id,
                                    userid: this.props.employeeid,
                                    keepLicences: this.state.keepLicences
                                  },
                                  refetchQueries: [
                                    {
                                      query: fetchTeams,
                                      variables: { userid: this.props.employeeid }
                                    },
                                    {
                                      query: fetchUserLicences,
                                      variables: { unitid: this.props.employeeid }
                                    }
                                  ]
                                });
                                this.setState({ network: false, deleted: true, keepLicences: [] });
                              } catch (err) {
                                console.log("ERROR", err);
                                throw err;
                              }
                            }}
                          />
                          {this.state.confirm ? (
                            <PopupBase
                              close={() => this.setState({ confirm: false, network: true })}
                              small={true}
                              closeable={false}
                              autoclosing={5}
                              autoclosingFunction={() => this.setState({ network: false })}>
                              {this.state.network ? (
                                <div>
                                  <div style={{ fontSize: "32px", textAlign: "center" }}>
                                    <i className="fal fa-spinner fa-spin" />
                                    <div style={{ marginTop: "32px", fontSize: "16px" }}>
                                      The user is currently being removed from the team
                                    </div>
                                  </div>
                                </div>
                              ) : this.state.deleted ? (
                                <React.Fragment>
                                  <div>The user has been removed sucessfully.</div>
                                  <UniversalButton
                                    type="high"
                                    closingPopup={true}
                                    label="Ok"
                                    closingAllPopups={true}
                                  />
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <div>
                                    It takes a little bit longer to remove the user from the team.
                                    We will inform you when it is done.
                                  </div>
                                  <UniversalButton
                                    type="high"
                                    closingPopup={true}
                                    label="Ok"
                                    closingAllPopups={true}
                                  />
                                </React.Fragment>
                              )}
                            </PopupBase>
                          ) : (
                            ""
                          )}
                        </PopupBase>
                      ) : (
                        ""
                      )}
                    </div>
                  )}
                </Mutation>
              );
            });
            return (
              <div className="section">
                <div className="heading">
                  <h1>Licences</h1>
                </div>
                <div className="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      <div className="tableColumnSmall">
                        <h1>Team</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Leader</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>#Teammembers</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>#Shared Licences</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Created at</h1>
                      </div>
                    </div>
                    <div className="tableEnd">
                      <UniversalButton
                        type="high"
                        label="Add Team"
                        customStyles={{
                          fontSize: "12px",
                          lineHeight: "24px",
                          fontWeight: "700",
                          marginRight: "16px",
                          width: "92px"
                        }}
                        onClick={() => {
                          console.log("Clicked add");
                          this.setState({ add: true });
                        }}
                      />
                    </div>
                  </div>
                  {teamArray}
                </div>
                {this.state.add ? (
                  <AddEmployeeToTeam
                    close={() => this.setState({ add: false })}
                    employeeid={employeeid}
                    employeename={employeename}
                  />
                ) : (
                  ""
                )}
              </div>
            );
          }
        }}
      </Query>
    );
  }
}
export default TeamsSection;
