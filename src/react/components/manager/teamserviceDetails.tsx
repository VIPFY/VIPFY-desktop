import * as React from "react";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { fetchTeam } from "../../queries/departments";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import { concatName } from "../../common/functions";
import DeletePopup from "../../popups/universalPopups/deletePopup";
import Calendar from "react-calendar";

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
    console.log("PROPS", this.props);
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
              <PopupBase
                small={true}
                nooutsideclose={true}
                close={() => this.setState({ delete: false })}
                additionalclassName="assignNewAccountPopup"
                buttonStyles={{ justifyContent: "space-between" }}>
                <h1>Remove Teamorbit</h1>
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
                    {this.state.todate ? moment(this.state.todate!).format("DD.MM.YYYY") : "Now"}
                  </span>
                  <i
                    className="fal fa-pen editbutton"
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
                    <UniversalCheckbox name="Assignment" liveValue={v => console.log(v)} />
                  </span>

                  <span style={{ lineHeight: "24px" }}>Delete all assignments</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <span
                    style={{
                      lineHeight: "24px",
                      width: "84px",
                      display: "flex",
                      justifyContent: "center"
                    }}>
                    <UniversalCheckbox name="Account" liveValue={v => console.log(v)} />
                  </span>

                  <span style={{ lineHeight: "24px" }}>Delete all accounts</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <span
                    style={{
                      lineHeight: "24px",
                      width: "84px",
                      display: "flex",
                      justifyContent: "center"
                    }}>
                    <UniversalCheckbox name="Orbit" liveValue={v => console.log(v)} />
                  </span>

                  <span style={{ lineHeight: "24px" }}>Delete orbit</span>
                </div>
              </PopupBase>
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
