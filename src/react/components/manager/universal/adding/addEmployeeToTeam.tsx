import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import PopupAddLicence from "../../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import PrintServiceSquare from "../squares/printServiceSquare";
import { fetchUserLicences } from "../../../../queries/departments";
import { concatName } from "../../../../common/functions";

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
  setups: any[];
  addAccounts: Boolean;
  addTeam: Boolean;
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
    setups: [],
    addAccounts: false,
    addTeam: false
  };

  componentWillUnmount() {
    this.setState({ saving: false, counter: 0 });
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
            {this.props.team.services.map(service => {
              return (
                <li key={service.planid.appid.name} style={{ fontSize: "12px" }}>
                  {this.state.setups!.find(s => (s.id = service.id)) &&
                  this.state.setups!.find(s => (s.id = service.id)).setupfinished ? (
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
                  {this.state.setups!.find(s => (s.id = service.id)) &&
                  this.state.setups!.find(s => (s.id = service.id))!.setupfinished
                    ? " successfully configurated"
                    : this.state.setups!.find(s => (s.id = service.id)) &&
                      this.state.setups!.find(s => (s.id = service.id))!.setupfinished == null
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
    return (
      <PopupBase
        buttonStyles={{ marginTop: "0px" }}
        fullmiddle={true}
        small={true}
        close={() => close()}
        additionalclassName="formPopup"
        nooutsideclose={true}>
        <h1>Add To Team</h1>
        <h2>{`Add ${concatName(employee)} to Team ${team.name}`}</h2>
        {team.services && team.services.length > 0 && (
          <div>
            <h3>Includes {team.services.length} Team-Services</h3>
            <div className="serviceIconHolderTeamAdd">
              {team.services.map((service, index) => (
                <PrintServiceSquare
                  service={service}
                  appidFunction={e => e.planid.appid}
                  overlayFunction={s =>
                    this.state.addAccounts && this.state.setups[index] ? (
                      this.state.setups[index].setupsuccess ? (
                        <i
                          className="fal fa-check-square"
                          style={{
                            color: "#37C8BA",
                            fontSize: "32px",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            width: "32px",
                            borderRadius: "4px"
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
                            borderRadius: "4px"
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
                          borderRadius: "4px"
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
          onClick={() => this.setState({ addTeam: true })}
          label="Confirm"
        />

        {this.state.addTeam && (
          <PopupSelfSaving
            savedmessage={`${employee.firstname} added to team ${team.name}`}
            savingmessage={`Adding ${employee.firstname} to team ${team.name}`}
            closeFunction={() => close()}
            saveFunction={async () => {
              try {
                await this.props.addToTeam({
                  variables: { employeeid: employee.id, teamid: this.props.team.unitid.id },
                  refetchQueries: [
                    {
                      query: fetchUserLicences,
                      variables: { unitid: this.props.employee.id }
                    }
                  ]
                });
                if (team.services && team.services.length > 0) {
                  this.setState({ addAccounts: true, addTeam: false });
                } else {
                  this.props.savingFunction({ action: "success" });
                }
              } catch (err) {
                this.props.savingFunction({ action: "error", message: err });
              }
            }}
          />
        )}

        {this.state.addAccounts &&
          team.services &&
          team.services.length > 0 &&
          team.services.length > this.state.counter && (
            <PopupAddLicence
              key={`${team.id}-${team.services[this.state.counter].planid.appid.id}`}
              nooutsideclose={true}
              app={team.services[this.state.counter].planid.appid}
              boughtplanid={team.services[this.state.counter]}
              team={team}
              addStyles={{ marginTop: "288px" }}
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
                if (this.state.counter == team.services.length) {
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
                if (this.state.counter == team.services.length) {
                  //Finished
                  this.props.savingFunction({ action: "success" });
                }
              }}
              employee={employee}
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

                await Promise.all(promises);
                this.props.savingFunction({ action: "success" });
              } catch (error) {
                console.error(error);
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
