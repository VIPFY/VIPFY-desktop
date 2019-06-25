import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import PopupAddLicence from "../../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

interface Props {
  close: Function;
  employee: any;
  team: any;
  savingFunction: Function;
  addToTeam: Function;
  addLicence: Function;
}

interface State {
  saving: Boolean;
  counter: number;
  integrateTeam: any;
}

const ADD_EMPLOYEE_TO_TEAM = gql`
  mutation addEmployeeToTeam($employeeid: ID!, $teamid: ID!) {
    addEmployeeToTeam(employeeid: $employeeid, teamid: $teamid)
  }
`;

const ADD_LICENCE_TO_USER = gql`
  mutation addExternalAccountLicence(
    $username: String!
    $password: String!
    $appid: ID
    $boughtplanid: ID!
    $price: Float
    $loginurl: String
    $touser: ID
    $identifier: String
    $options: JSON
  ) {
    addExternalAccountLicence(
      touser: $touser
      boughtplanid: $boughtplanid
      price: $price
      appid: $appid
      loginurl: $loginurl
      password: $password
      username: $username
      identifier: $identifier
      options: $options
    )
  }
`;
class AddEmployeeToTeam extends React.Component<Props, State> {
  state = {
    saving: false,
    counter: 0,
    integrateTeam: null
  };

  componentWillUnmount() {
    this.setState({ saving: false, counter: 0, integrateTeam: null });
  }

  printTeamAddSteps() {
    const { team, close } = this.props;
    if (team.services && team.services.length == 0) {
      return (
        <div className="buttonsPopup">
          <UniversalButton type="low" onClick={() => close()} label="Cancel" />
          <div className="buttonSeperator" />
          <UniversalButton
            type="high"
            onClick={() => this.setState({ saving: true })}
            label="Confirm"
          />
        </div>
      );
    } else {
      return (
        <React.Fragment>
          <ul className="checks">
            {this.state.integrateTeam &&
              this.state.integrateTeam!.services.map(service => {
                return (
                  <li key={service.planid.appid.name} style={{ fontSize: "12px" }}>
                    {service.setupfinished ? (
                      <i
                        className="fal fa-check-circle"
                        style={{ color: "#20BAA9", marginRight: "4px" }}
                      />
                    ) : (
                      <i
                        className="fal fa-times-circle"
                        style={{ color: "#FF2700", marginRight: "4px" }}
                      />
                    )}
                    Individual Teamlicence for <b>{service.planid.appid.name}</b>
                    {service.setupfinished
                      ? " successfully configurated"
                      : service.setupfinished == null
                      ? "not started"
                      : " not configured"}
                  </li>
                );
              })}
            {team.licences.map(licence => {
              return (
                <li key={licence.boughtplanid.planid.appid.name}>
                  Teamlicence for <b>{licence.boughtplanid.planid.appid.name}</b> configured
                </li>
              );
            })}
          </ul>
          <div className="buttonsPopup">
            <UniversalButton type="low" onClick={() => close()} label="Cancel" />
            <div className="buttonSeperator" />
            <UniversalButton
              type="high"
              onClick={() => this.setState({ saving: true })}
              label="Confirm"
            />
          </div>
        </React.Fragment>
      );
    }
  }

  render() {
    const { team, close, employee } = this.props;
    console.log("AETT", this.props, this.state);
    return (
      <PopupBase
        buttonStyles={{ marginTop: "0px" }}
        fullmiddle={true}
        small={true}
        close={() => close()}>
        <div>
          <h1 className="cleanup lightHeading">
            Add {employee.fullname} to team {team.name}
          </h1>
        </div>

        {this.printTeamAddSteps()}

        {team.services && team.services.length > 0 && team.services.length > this.state.counter && (
          <PopupAddLicence
            nooutsideclose={true}
            app={team.services[this.state.counter].planid.appid}
            cancel={async () => {
              await this.setState(prevState => {
                let newcounter = prevState.counter + 1;
                let currentlicence = Object.assign({}, team.services[prevState.counter]);
                currentlicence.setupfinished = false;
                currentlicence.setup = {};
                const newintegrateTeam = Object.assign({}, team);
                let newintegrateTeam2 = newintegrateTeam;
                newintegrateTeam2.services = newintegrateTeam2.services.map(a =>
                  a.id == currentlicence.id ? currentlicence : a
                );
                if (newcounter < team.services.length) {
                  return {
                    ...prevState,
                    counter: newcounter,
                    integrateTeam: newintegrateTeam2
                  };
                } else {
                  return {
                    ...prevState,
                    counter: newcounter,
                    integrateTeam: newintegrateTeam2
                  };
                }
              });
            }}
            add={async setup => {
              await this.setState(prevState => {
                let newcounter = prevState.counter + 1;
                let currentlicence = Object.assign({}, team.services[prevState.counter]);
                currentlicence.setupfinished = true;
                currentlicence.setup = setup;
                currentlicence.setup.employeeid = this.props.employee.id;
                const newintegrateTeam = Object.assign({}, team);
                let newintegrateTeam2 = newintegrateTeam;
                newintegrateTeam2.services = newintegrateTeam2.services.map(a =>
                  a.id == currentlicence.id ? currentlicence : a
                );
                if (newcounter < team.services.length) {
                  return {
                    ...prevState,
                    counter: newcounter,
                    integrateTeam: newintegrateTeam2
                  };
                } else {
                  return {
                    ...prevState,
                    counter: newcounter,
                    integrateTeam: newintegrateTeam2
                  };
                }
              });
            }}
            employee={employee}
            employeename={employee.firstname} //TODO make it nice
            maxstep={team.services.length}
            currentstep={this.state.counter}
          />
        )}

        {this.state.saving && (
          <PopupSelfSaving
            savedmessage={`${employee.firstname} added to team ${team.name}`}
            savingmessage={`Adding ${employee.firstname} to team ${team.name}`}
            closeFunction={() => close()}
            saveFunction={async () => {
              const promises: any[] = [];
              try {
                promises.push(
                  this.props.addToTeam({
                    variables: { employeeid: employee.id, teamid: this.props.team.unitid.id }
                  })
                );

                if (this.state.integrateTeam) {
                  this.state.integrateTeam!.services.forEach(
                    s =>
                      s.setupfinished &&
                      promises.push(
                        this.props.addLicence({
                          variables: {
                            boughtplanid: s.id,
                            username: s.setup.email,
                            password: s.setup.password,
                            loginurl: s.setup.subdomain,
                            touser: s.setup.employeeid,
                            options: {
                              teamlicence: this.props.team.unitid.id
                            }
                          }
                        })
                      )
                  );
                }

                await Promise.all(promises);
                this.props.savingFunction({ action: "success" });
              } catch (error) {
                console.log(error);
                this.props.savingFunction({ action: "error", message: error });
              }
            }}
            maxtime={5000}
          />
        )}
      </PopupBase>
    );
  }
}
export default compose(
  graphql(ADD_EMPLOYEE_TO_TEAM, { name: "addToTeam" }),
  graphql(ADD_LICENCE_TO_USER, { name: "addLicence" })
)(AddEmployeeToTeam);
