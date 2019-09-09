import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import PopupAddLicence from "../../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";

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
  setups: any[];
  addEmployee: boolean;
  boughtplanid: number;
}

const ADD_TO_TEAM = gql`
  mutation addAppToTeam($serviceid: ID!, $teamid: ID!, $employees: [SetupService]!) {
    addAppToTeam(serviceid: $serviceid, teamid: $teamid, employees: $employees)
  }
`;

const ADD_EXTERNAL_PLAN = gql`
  mutation onAddExternalBoughtPlan($appid: ID!, $alias: String, $price: Float, $loginurl: String) {
    addExternalBoughtPlan(appid: $appid, alias: $alias, price: $price, loginurl: $loginurl) {
      id
      alias
    }
  }
`;
class AddServiceToTeam extends React.Component<Props, State> {
  state = {
    saving: false,
    counter: 0,
    currentteam: this.props.team,
    setups: [],
    addEmployee: false,
    boughtplanid: 0
  };

  componentWillUnmount() {
    this.setState({ saving: false, counter: 0, currentteam: null });
  }

  render() {
    const { team, close, service } = this.props;
    return (
      <PopupBase
        buttonStyles={{ marginTop: "0px" }}
        fullmiddle={true}
        small={true}
        additionalclassName="formPopup"
        close={() => close()}>
        <div>
          <h1 className="cleanup lightHeading">
            Add {service.name} to team {team.name}
          </h1>
        </div>

        {team.employees && team.employees.length > 0 && (
          <div>
            <h3>Includes {team.employees.length} Team-Employees</h3>
            <div className="serviceIconHolderTeamAdd">
              {team.employees.map((employee, index) => (
                <PrintEmployeeSquare
                  employee={employee}
                  styles={{ position: "relative" }}
                  overlayFunction={s =>
                    this.state.addEmployee && this.state.setups[index] ? (
                      this.state.setups[index].setupsuccess ? (
                        <i
                          className="fal fa-check-square"
                          style={{
                            color: "#37C8BA",
                            fontSize: "32px",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            width: "32px",
                            borderRadius: "4px",
                            top: "0px",
                            position: "absolute",
                            left: "0px"
                          }}
                        />
                      ) : (
                        <i
                          className="fal fa-times-square"
                          style={{
                            color: "#37C8BA",
                            fontSize: "32px",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            width: "32px",
                            borderRadius: "4px",
                            top: "0px",
                            position: "absolute",
                            left: "0px"
                          }}
                        />
                      )
                    ) : (
                      <i
                        className="fal fa-question-square"
                        style={{
                          color: "#37C8BA",
                          fontSize: "32px",
                          backgroundColor: "rgba(0,0,0,0.5)",
                          width: "32px",
                          borderRadius: "4px",
                          top: "0px",
                          position: "absolute",
                          left: "0px"
                        }}
                      />
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}

        <UniversalButton type="low" onClick={() => close()} label="Cancel" />
        <UniversalButton
          type="high"
          onClick={() => this.setState({ saving: true })}
          label="Confirm"
        />

        {this.state.addEmployee &&
          team.employees &&
          team.employees.length > 0 &&
          team.employees.length > this.state.counter && (
            <PopupAddLicence
              nooutsideclose={true}
              app={service}
              addStyles={{ marginTop: "288px" }}
              boughtplanid={{ id: this.state.boughtplanid }}
              team={team}
              cancel={async () => {
                await this.setState(prevState => {
                  let newcounter = prevState.counter + 1;
                  const currentsetup = prevState.setups;
                  currentsetup.push({ setupsuccess: false });

                  return {
                    ...prevState,
                    counter: newcounter,
                    setups: currentsetup
                  };
                });
                if (this.state.counter == team.employees.length) {
                  //Finished
                  this.props.savingFunction({ action: "success" });
                }
              }}
              success={err => {
                if (err && err.error) {
                  this.props.savingFunction({ action: "error", message: err });
                } else {
                  this.setState(prevState => {
                    let newcounter = prevState.counter + 1;
                    const currentsetup = prevState.setups;
                    currentsetup.push({ setupsuccess: true });

                    return {
                      ...prevState,
                      counter: newcounter,
                      setups: currentsetup
                    };
                  });
                }
                if (this.state.counter == team.employees.length) {
                  //Finished
                  this.props.savingFunction({ action: "success" });
                }
              }}
              employeename={`${this.props.team.employees[this.state.counter].firstname} ${this.props.team.employees[this.state.counter].lastname}`}
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
              try {
                const res = await this.props.addServiceToTeam({
                  variables: {
                    serviceid: service.id,
                    teamid: this.props.team.unitid.id,
                    employees: []
                  }
                });
                if (!team.employees || team.employees.length == 0) {
                  this.props.savingFunction({ action: "success" });
                } else {
                  this.setState({
                    addEmployee: true,
                    saving: false,
                    boughtplanid: res.data.addAppToTeam
                  });
                }
                //await this.props.savingFunction({ action: "success" });
              } catch (error) {
                console.error(error);
                await this.props.savingFunction({ action: "error", message: error });
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
  graphql(ADD_TO_TEAM, { name: "addServiceToTeam" }),
  graphql(ADD_EXTERNAL_PLAN, { name: "addExternalBoughtPlan" })
)(AddServiceToTeam);
