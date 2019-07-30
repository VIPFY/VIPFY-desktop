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
import PopupSaving from "../../popups/universalPopups/saving";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import Team from "./employeeDetails/team";
import ManageTeams from "./universal/managing/teams";

interface Props {
  employeeid: number; //TODO CHANGE TO EMPLOYEE
  employeename: string;
  moveTo: Function;
  isadmin?: Boolean;
}

interface State {
  delete: Boolean;
  confirm: Boolean;
  network: Boolean;
  deleted: Boolean;
  add: Boolean;
  keepLicences: number[];
  deleteerror: string | null;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
}

class TeamsSection extends React.Component<Props, State> {
  state = {
    delete: false,
    confirm: false,
    network: false,
    deleted: false,
    add: false,
    keepLicences: [],
    deleteerror: null,
    savingObject: null
  };

  render() {
    console.log("RERENDER TEAM");
    const employeeid = this.props.employeeid;
    const employeename = this.props.employeename;

    return (
      <Query
        pollInterval={60 * 10 * 1000 + 800}
        query={fetchTeams}
        variables={{ userid: employeeid }}>
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
                <Team
                  employee={{ id: this.props.employeeid, name: this.props.employeename }}
                  team={team}
                  deleteFunction={sO => this.setState({ savingObject: sO })}
                  moveTo={this.props.moveTo}
                  isadmin={this.props.isadmin}
                />
              );
            });
            return (
              <div className="section">
                <div className="heading">
                  <h1>Teams</h1>
                </div>
                <div className="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      <div className="tableColumnSmall">
                        <h1>Team</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Created at</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>#Teammembers</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>#Shared Licences</h1>
                      </div>
                      <div className="tableColumnSmall">{/*<h1>Leader</h1>*/}</div>
                    </div>
                    <div className="tableEnd">
                      {this.props.isadmin && (
                        <UniversalButton
                          type="high"
                          label="Manage Teams"
                          customStyles={{
                            fontSize: "12px",
                            lineHeight: "24px",
                            fontWeight: "700",
                            marginRight: "16px",
                            width: "120px"
                          }}
                          onClick={() => {
                            this.setState({ add: true });
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {teamArray}
                </div>
                {this.state.add && (
                  <ManageTeams
                    employee={{ id: this.props.employeeid, firstname: this.props.employeename }} //TODO CHANGE employeename
                    close={() => this.setState({ add: false })}>
                    <div className="buttonsPopup">
                      <UniversalButton
                        label="Close"
                        type="low"
                        onClick={() => this.setState({ add: false })}
                      />
                    </div>
                  </ManageTeams>
                )}
                {this.state.savingObject && (
                  <PopupSelfSaving
                    savedmessage={this.state.savingObject!.savedmessage}
                    savingmessage={this.state.savingObject!.savingmessage}
                    closeFunction={() => {
                      this.setState({ savingObject: null });
                    }}
                    saveFunction={async () => await this.state.savingObject!.saveFunction()}
                    maxtime={5000}
                  />
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
