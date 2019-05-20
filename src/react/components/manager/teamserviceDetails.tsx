import * as React from "react";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { fetchTeam } from "../../queries/departments";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import moment = require("moment");

interface Props {
  service: any;
  team: any;
  deleteFunction: Function;
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

class TeamServiceDetails extends React.Component<Props, State> {
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
      <Mutation mutation={REMOVE_SERVICE_FROM_TEAM} key={service.id}>
        {removeServiceFromTeam => (
          <div className="tableRow">
            <div className="tableMain">
              <div className="tableColumnSmall">
                <div
                  className="managerSquare"
                  style={
                    service.planid.appid.icon
                      ? {
                          backgroundImage:
                            service.planid.appid.icon.indexOf("/") != -1
                              ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                                  service.planid.appid.icon
                                )})`
                              : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                                  service.planid.appid.icon
                                )})`,
                          backgroundColor: "unset"
                        }
                      : {}
                  }>
                  {service.planid.appid.icon ? "" : service.planid.appid.name.slice(0, 1)}
                  {service.options && service.options.nosetup && (
                    <div className="licenceError">
                      <i className="fal fa-exclamation-circle" />
                    </div>
                  )}
                </div>
                <span className="name">{service.planid.appid.name}</span>
              </div>
              <div className="tableColumnSmall content">
                {moment(service.buytime - 0).format("DD.MM.YYYY")}
              </div>
              <div className="tableColumnSmall content">
                {service.endtime ? moment(service.endtime - 0).format("DD.MM.YYYY") : "Recurring"}
              </div>
              <div className="tableColumnSmall content">${service.totalprice.toFixed(2)}</div>
              <div className="tableColumnSmall content">not implemented yet</div>
            </div>
            <div className="tableEnd">
              <div className="editOptions">
                {/*<i className="fal fa-edit" onClick={() => this.setState({ editpopup: true })} />*/}
                <i className="fal fa-trash-alt" onClick={() => this.setState({ delete: true })} />
              </div>
            </div>

            {this.state.delete ? (
              <PopupBase
                small={true}
                close={() => this.setState({ delete: false })}
                closeable={false}>
                <div>
                  Do you really want to remove {service.name} from <b>{team.name}</b>
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
                      savingmessage: "The service is currently being removed from the team",
                      savedmessage: "The service has been removed successfully.",
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
            ) : (
              ""
            )}
          </div>
        )}
      </Mutation>
    );
  }
}
export default TeamServiceDetails;
