import * as React from "react";
import UniversalCheckbox from "../../universalForms/universalCheckbox";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalButton from "../../universalButtons/universalButton";
import { fetchTeam } from "../../../queries/departments";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import moment = require("moment");

interface Props {
  service: any;
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

const REMOVE_SERVICE_FROM_TEAM = gql`
  mutation removeServiceFromTeam($teamid: ID!, $serviceid: ID!, $keepLicences: [ID!]) {
    removeServiceFromTeam(teamid: $teamid, serviceid: $serviceid, keepLicences: $keepLicences)
  }
`;

class Team extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
    savingObject: null
  };

  printRemoveService() {
    let RLicencesArray: JSX.Element[] = [];
    this.props.team.employees.forEach((employee, int) => {
      console.log("Employee", employee, int, this.state, this.props);
      RLicencesArray.push(
        <li key={int}>
          <UniversalCheckbox
            name={employee.id}
            startingvalue={true}
            liveValue={v =>
              v
                ? this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences.splice(
                      prevState.keepLicences.findIndex(l => l == employee.id),
                      1
                    );
                    console.log(
                      "keepLicencesNewA",
                      prevState.keepLicences,
                      keepLicencesNew,
                      v,
                      employee
                    );
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
                : this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences;
                    keepLicencesNew.push(employee.id);
                    console.log("keepLicencesNewB", keepLicencesNew, v);
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
            }>
            <span>
              Delete licence of {employee.firstname} {employee.lastname}
            </span>
          </UniversalCheckbox>
        </li>
      );
    });
    return RLicencesArray != [] ? <ul style={{ marginTop: "20px" }}>{RLicencesArray}</ul> : "";
  }

  render() {
    const { service, team } = this.props;
    return (
      <Mutation mutation={REMOVE_SERVICE_FROM_TEAM} key={team.unitid.id}>
        {removeServiceFromTeam => (
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
                              ? `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
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
              <div className="tableColumnSmall content">Integrated Accounts</div>
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
                  Do you really want to remove {team.name} from <b>{service.name}</b>
                  {this.printRemoveService()}
                </div>
                <UniversalButton type="low" closingPopup={true} label="Cancel" />
                <UniversalButton
                  type="low"
                  label="Delete"
                  onClick={() => {
                    console.log("TESTING", this.state.keepLicences);
                    this.setState({ delete: false });
                    this.props.deleteFunction({
                      savingmessage: "The team is currently being removed from the service",
                      savedmessage: "The team has been removed successfully.",
                      maxtime: 5000,
                      closeFunction: () =>
                        this.setState({
                          savingObject: null
                        }),
                      saveFunction: () =>
                        removeServiceFromTeam({
                          variables: {
                            teamid: team.unitid.id,
                            serviceid: service.id,
                            keepLicences: this.state.keepLicences
                          },
                          refetchQueries: [
                            {
                              query: fetchTeam,
                              variables: { teamid: team.unitid.id }
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
