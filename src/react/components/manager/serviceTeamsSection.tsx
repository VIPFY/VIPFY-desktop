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
import TeamServiceDetails from "./teamserviceDetails";
import Team from "./serviceDetails/team";
import AddTeam from "./serviceDetails/addTeam";

interface Props {
  service: any;
  teams: any[];
  moveTo: Function;
  search: String;
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

const REMOVE_EMPLOYEE_FROM_TEAM = gql`
  mutation removeFromTeam($teamid: ID!, $userid: ID!, $keepLicences: [ID!]) {
    removeFromTeam(teamid: $teamid, userid: $userid, keepLicences: $keepLicences)
  }
`;

class ServiceTeamsSection extends React.Component<Props, State> {
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

  printRemoveLicences(team) {
    let RLicencesArray: JSX.Element[] = [];

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
    console.log("RERENDER TEAM");
    let teamArray: JSX.Element[] = [];
    const interteams = this.props.teams;
    let teams = interteams;
    if (interteams) {
      interteams.sort(function(a, b) {
        let nameA = a.departmentid.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.departmentid.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });
      if (this.props.search && this.props.search != "") {
        teams = interteams.filter(a => {
          return a.departmentid.name.toUpperCase().includes(this.props.search.toUpperCase());
        });
      } else {
        teams = interteams;
      }

      teams.forEach((team, k) => {
        teamArray.push(
          <Team
            service={this.props.service}
            team={team}
            deleteFunction={sO => this.setState({ savingObject: sO })}
            moveTo={this.props.moveTo}
          />
        );
      });
    }
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
                <h1>Leader</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>#Licences</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Price</h1>
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
                  this.setState({ add: true });
                }}
              />
            </div>
          </div>
          {teamArray}
        </div>
        {this.state.add && (
          <AddTeam
            close={sO => {
              this.setState({ add: false, savingObject: sO });
            }}
            service={this.props.service}
            teams={this.props.teams}
          />
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
}
export default ServiceTeamsSection;
