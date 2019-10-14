import * as React from "react";
import UniversalCheckbox from "../../universalForms/universalCheckbox";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalButton from "../../universalButtons/universalButton";
import { fetchCompanyService } from "../../../queries/products";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import PrintTeamSquare from "../universal/squares/printTeamSquare";

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
  mutation removeServiceFromTeam($teamid: ID!, $boughtplanid: ID!, $keepLicences: [ID!]) {
    removeServiceFromTeam(teamid: $teamid, boughtplanid: $boughtplanid, keepLicences: $keepLicences)
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
    this.props.team.departmentid.employees.forEach((employee, int) => {
      RLicencesArray.push(
        <li key={int}>
          <UniversalCheckbox
            name={employee.id}
            startingvalue={true}
            liveValue={v =>
              v
                ? this.setState(prevState => {
                    const keepLicencesNew2 = prevState.keepLicences.splice(
                      prevState.keepLicences.findIndex(l => l == employee.id),
                      1
                    );
                    return {
                      keepLicences: prevState.keepLicences
                    };
                  })
                : this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences;
                    keepLicencesNew.push(employee.id);
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
    const service = this.props.service;
    const team = this.props.team.departmentid;
    return (
      <Mutation mutation={REMOVE_SERVICE_FROM_TEAM} key={team.unitid.id}>
        {removeServiceFromTeam => (
          <div className="tableRow" onClick={() => this.props.moveTo(`dmanager/${team.unitid.id}`)}>
            <div className="tableMain">
              <div className="tableColumnSmall">
                <PrintTeamSquare team={team} />
                <span className="name">{team.name}</span>
              </div>
              <div className="tableColumnSmall content">
                {/*team.internaldata ? team.internaldata.leader : ""*/}
              </div>
              <div className="tableColumnSmall content">{team.employeenumber}</div>
              <div className="tableColumnSmall content">Integrated Accounts</div>
              <div className="tableColumnSmall content">
                {(team.createdate && moment(team.createdate).format("DD.MM.YYYY")) ||
                  "Date not set"}
              </div>
            </div>
            <div className="tableEnd">
              <div className="editOptions">
                <i className="fal fa-external-link-alt editbuttons" />
                <i
                  className="fal fa-trash-alt editbuttons"
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
                            boughtplanid: this.props.team.boughtplanid.id,
                            keepLicences: this.state.keepLicences
                          },
                          refetchQueries: [
                            {
                              query: fetchCompanyService,
                              variables: { serviceid: service.id }
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
