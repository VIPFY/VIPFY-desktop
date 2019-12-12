import * as React from "react";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import RemoveTeamOrbit from "./removeTeamOrbit";

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

class TeamServiceDetails extends React.Component<Props, State> {
  state = {
    keepLicences: [],
    delete: false,
    savingObject: null
  };

  printRemoveService() {
    let RLicencesArray: JSX.Element[] = [];
    this.props.team.employees.forEach((employee, int) => {
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

  showStatus(e) {
    const end = e.endtime == 8640000000000000 ? null : e.endtime;
    const start = e.buytime;

    if (e.pending) {
      return (
        <span
          className="infoTag"
          style={{
            backgroundColor: "#c73544",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          Integration pending
        </span>
      );
    }

    if (moment(start).isAfter(moment.now())) {
      return (
        <span
          className="infoTag"
          style={{
            backgroundColor: "#20baa9",
            textAlign: "center",
            lineHeight: "initial",
            color: "white"
          }}>
          Starts in {moment(start).toNow(true)}
        </span>
      );
    }

    if (end) {
      return (
        <span
          className="infoTag"
          style={{ backgroundColor: "#FFC15D", textAlign: "center", lineHeight: "initial" }}>
          Ends in {moment(end).toNow(true)}
        </span>
      );
    } else {
      return <span className="infoTag">Active since {moment(start).fromNow(true)}</span>;
    }
  }

  render() {
    const { service, team } = this.props;
    return (
      <Mutation mutation={REMOVE_SERVICE_FROM_TEAM} key={service.id}>
        {removeServiceFromTeam => (
          <div
            className="tableRow"
            onClick={() => this.props.moveTo(`lmanager/${service.planid.appid.id}`)}>
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
                {/*moment(service.buytime).format("DD.MM.YYYY")*/}
                {service.alias}
              </div>
              <div className="tableColumnSmall content">
                {/*service.endtime ? moment(service.endtime - 0).format("DD.MM.YYYY") : "Recurring"*/}
                {this.showStatus(service)}
              </div>
              <div className="tableColumnSmall content">{/*${service.totalprice.toFixed(2)*/}</div>
              <div className="tableColumnSmall content">{/*not implemented yet*/}</div>
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
              <RemoveTeamOrbit
                orbit={this.props.service}
                team={this.props.team}
                close={() => this.setState({ delete: false })}
              />
              /*  subHeading={`If you delete licence access for ${team.name} to ${service.planid.appid.name}, you remove access for the following team members`}
                employees={this.props.team.employees}
                services={[service]}
                main="service"
                close={() => {
                  this.setState({ delete: false });
                }}
                submit={async values => {
                  await removeServiceFromTeam({
                    variables: {
                      teamid: team.unitid.id,
                      boughtplanid: service.id,
                      keepLicences: values[`m-${service.id}`]
                    },
                    refetchQueries: [
                      {
                        query: fetchTeam,
                        variables: { teamid: team.unitid.id }
                      }
                    ]
                  });
                  this.setState({ delete: false });
                }}
              />*/
            )}
          </div>
        )}
      </Mutation>
    );
  }
}
export default TeamServiceDetails;
