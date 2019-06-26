import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import PopupAddLicence from "../../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

interface Props {
  close: Function;
  service: any;
  team: any;
  savingFunction: Function;
  addServiceToTeam: Function;
}

interface State {
  saving: Boolean;
  counter: number;
  currentteam: any;
}

const ADD_TO_TEAM = gql`
  mutation addAppToTeam($serviceid: ID!, $teamid: ID!, $employees: [SetupService]!) {
    addAppToTeam(serviceid: $serviceid, teamid: $teamid, employees: $employees)
  }
`;
class AddServiceToTeam extends React.Component<Props, State> {
  state = {
    saving: false,
    counter: 0,
    currentteam: this.props.team
  };

  componentWillUnmount() {
    this.setState({ saving: false, counter: 0, currentteam: null });
  }

  printEmployeeAddSteps() {
    const { team, service, close } = this.props;
    if (team.employees.length == 0) {
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
            {this.state.currentteam.employees &&
              this.state.currentteam.employees.map(employee => {
                return (
                  <li key={employee.id} style={{ fontSize: "12px" }}>
                    {employee.setupfinished ? (
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
                    Individual Teamlicence for <b>{`${employee.firstname} ${employee.lastname}`}</b>
                    {employee.setupfinished
                      ? " successfully configurated"
                      : employee.setupfinished == null
                      ? " not started"
                      : " not configured"}
                  </li>
                );
              })}
            {/*this.props.team!.licences.map(licence => {
              return (
                <li key={licence.boughtplanid.planid.appid.name}>
                  Teamlicence for <b>{licence.boughtplanid.planid.appid.name}</b> configured
                </li>
              );
            })*/}
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
    const { team, close, service } = this.props;
    console.log("AETT", this.props, this.state);
    return (
      <PopupBase
        buttonStyles={{ marginTop: "0px" }}
        fullmiddle={true}
        small={true}
        close={() => close()}>
        <div>
          <h1 className="cleanup lightHeading">
            Add {service.name} to team {team.name}
          </h1>
        </div>

        {this.printEmployeeAddSteps()}

        {team.employees && team.employees.length > 0 && team.employees.length > this.state.counter && (
          <PopupAddLicence
            nooutsideclose={true}
            app={service}
            cancel={async () => {
              await this.setState(prevState => {
                let newcounter = prevState.counter + 1;
                let currentemployee = Object.assign({}, team.employees[prevState.counter]);
                currentemployee.setupfinished = false;
                currentemployee.setup = {};
                const currentteam = Object.assign({}, prevState.currentteam);
                const currentteam2 = currentteam;
                currentteam2.employees = currentteam2.employees.map(a =>
                  a.id == currentemployee.id ? currentemployee : a
                );
                if (newcounter < team.employees.length) {
                  return {
                    ...prevState,
                    counter: newcounter,
                    currentteam
                  };
                } else {
                  return {
                    ...prevState,
                    counter: newcounter,
                    currentteam
                  };
                }
              });
            }}
            add={async setup => {
              await this.setState(prevState => {
                let newcounter = prevState.counter + 1;
                let currentemployee = Object.assign({}, team.employees[prevState.counter]);
                currentemployee.setupfinished = true;
                currentemployee.setup = setup;
                const currentteam = Object.assign({}, prevState.currentteam);
                console.log("CT", currentteam);
                const currentteam2 = currentteam;
                currentteam2.employees = currentteam2.employees.map(a =>
                  a.id == currentemployee.id ? currentemployee : a
                );
                if (newcounter < team.employees.length) {
                  return {
                    ...prevState,
                    counter: newcounter,
                    currentteam
                  };
                } else {
                  return {
                    ...prevState,
                    counter: newcounter,
                    currentteam
                  };
                }
              });
            }}
            employeename={`${this.props.team.employees[this.state.counter].firstname} ${
              this.props.team.employees[this.state.counter].lastname
            }`}
            employee={this.props.team.employees[this.state.counter]}
            maxstep={this.props.team.employees.length}
            currentstep={this.state.counter}
          />
        )}

        {this.state.saving && (
          <PopupSelfSaving
            savedmessage={`${service.name} added to team ${team.name}`}
            savingmessage={`Adding ${service.name} to team ${team.name}`}
            closeFunction={() => close()}
            saveFunction={async () => {
              console.log("SAVE", this.props, this.state);
              try {
                await this.props.addServiceToTeam({
                  variables: {
                    serviceid: service.id,
                    teamid: this.props.team.unitid.id,
                    employees: this.state.currentteam.employees.map(employee => {
                      return {
                        id: employee.id,
                        setup: employee.setup,
                        setupfinished: employee.setupfinished
                      };
                    })
                  }
                });

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
export default compose(graphql(ADD_TO_TEAM, { name: "addServiceToTeam" }))(AddServiceToTeam);
