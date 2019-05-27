import * as React from "react";
import UniversalCheckbox from "../../universalForms/universalCheckbox";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalButton from "../../universalButtons/universalButton";
import { fetchTeams, fetchUserLicences } from "../../../queries/departments";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import moment = require("moment");

interface Props {
  employee: any;
  team: any;
  deleteFunction: Function;
  moveTo: Function;
}

interface State {
  keepLicences: number[];
  delete: Boolean;
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

class Team extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
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
    const { employee, team } = this.props;
    return (
      <Mutation mutation={REMOVE_EMPLOYEE_FROM_TEAM} key={team.name}>
        {removeFromTeam => (
          <div className="tableRow" onClick={() => this.props.moveTo(`dmanager/${team.unitid.id}`)}>
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
                <i className="fal fa-external-link-alt" />
                <i
                  className="fal fa-trash-alt"
                  onClick={e => {
                    e.stopPropagation();
                    this.setState({ delete: true });
                  }}
                />
              </div>
            </div>

            {this.state.delete && (
              <PopupBase
                small={true}
                close={() => this.setState({ delete: false })}
                closeable={false}>
                <div>
                  Do you really want to remove {employee.firstname} {employee.lastname} from{" "}
                  <b>{team.name}</b>
                  {this.printRemoveLicences(team)}
                </div>
                <UniversalButton type="low" closingPopup={true} label="Cancel" />
                <UniversalButton
                  type="low"
                  label="Delete"
                  onClick={() => {
                    this.setState({
                      delete: false
                    });
                    this.props.deleteFunction({
                      savingmessage: "The user is currently being removed from the team",
                      savedmessage: "The user has been removed successfully.",
                      maxtime: 5000,
                      closeFunction: () =>
                        this.setState({
                          savingObject: null
                        }),
                      saveFunction: () =>
                        removeFromTeam({
                          variables: {
                            teamid: team.unitid.id,
                            userid: employee.id,
                            keepLicences: this.state.keepLicences
                          },
                          refetchQueries: [
                            {
                              query: fetchTeams,
                              variables: { userid: employee.id }
                            },
                            {
                              query: fetchUserLicences,
                              variables: { unitid: employee.id }
                            }
                          ]
                        })
                    });
                  }}
                />
              </PopupBase>
            )}
          </div>
        )}
      </Mutation>
    );
  }
}
export default Team;
