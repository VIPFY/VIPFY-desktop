import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import PopupAddLicence from "../../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { compose, graphql, Mutation } from "react-apollo";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";
import FormPopup from "../../../../popups/universalPopups/formPopup";

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
  confirmed: Boolean;
  edit: Object | null;
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

const UPDATE_CREDENTIALS = gql`
  mutation onUpdateCredentials(
    $licenceid: ID!
    $username: String
    $password: String
    $loginurl: String
  ) {
    updateCredentials(
      licenceid: $licenceid
      username: $username
      password: $password
      loginurl: $loginurl
    )
  }
`;
class AddServiceToTeam extends React.Component<Props, State> {
  state = {
    saving: false,
    counter: 0,
    currentteam: this.props.team,
    setups: [],
    addEmployee: false,
    boughtplanid: 0,
    confirmed: false,
    edit: null
  };

  editOrAdd() {
    const { team, close, service } = this.props;
    let editlicence = this.state.setups.find(s => s.employeeid == this.state.edit!.id);
    if (editlicence && editlicence.licenceid) {
      return (
        <Mutation mutation={UPDATE_CREDENTIALS}>
          {updateCredentials => (
            <FormPopup
              key={`${this.state.edit!.firstname}-${this.state.edit!.lastname}-${service.name}`}
              heading="Edit Licence"
              subHeading={`Edit licence from ${this.state.edit!.firstname} ${
                this.state.edit!.lastname
              } of ${service.name}`}
              close={() => this.setState({ edit: null })}
              submit={async values => {
                await updateCredentials({
                  variables: {
                    licenceid: editlicence.licenceid,
                    username: values[`${this.state.edit!.id}-${service.id}-email`],
                    password: values[`${this.state.edit!.id}-${service.id}-password`],
                    loginurl:
                      values[`${this.state.edit!.id}-${service.id}-subdomain`] &&
                      values[`${this.state.edit!.id}-${service.id}-subdomain`] != ""
                        ? `${service.options.predomain}${
                            values[`${this.state.edit!.id}-${service.id}-subdomain`]
                          }${service.options.afterdomain}`
                        : null
                  }
                });
              }}
              submitDisabled={values =>
                !values ||
                (service.needssubdomain &&
                  (!values[`${this.state.edit!.id}-${service.id}-subdomain`] ||
                    values[`${this.state.edit!.id}-${service.id}-subdomain`] == "")) ||
                !values[`${this.state.edit!.id}-${service.id}-email`] ||
                values[`${this.state.edit!.id}-${service.id}-email`] == "" ||
                !values[`${this.state.edit!.id}-${service.id}-password`] ||
                values[`${this.state.edit!.id}-${service.id}-password`] == ""
              }
              nooutsideclose={true}
              fields={(service.needssubdomain
                ? [
                    {
                      id: `${this.state.edit!.id}-${service.id}-subdomain`,
                      options: {
                        label: "Subdomain",
                        children: (
                          <span className="small">
                            Please insert your subdomain.
                            <br />
                            {service.options.predomain}YOUR SUBDOMAIN
                            {service.options.afterdomain}
                          </span>
                        )
                      }
                    }
                  ]
                : []
              ).concat([
                {
                  id: `${this.state.edit!.id}-${service.id}-email`,
                  options: {
                    label: `Username for your ${service.name}-Account`
                  }
                },
                {
                  id: `${this.state.edit!.id}-${service.id}-password`,
                  options: {
                    label: `Password for your ${service.name}-Account`,
                    type: "password"
                  }
                }
              ])}
            />
          )}
        </Mutation>
      );
    } else {
      return (
        <PopupAddLicence
          nooutsideclose={true}
          app={service}
          addStyles={{ marginTop: "288px" }}
          boughtplanid={{ id: this.state.boughtplanid }}
          team={team}
          cancel={() => this.setState({ edit: null })}
          success={data => {
            if (data && data.error) {
              console.log("ERROR", data);
              this.setState({ edit: null });
            } else {
              this.setState(prevState => {
                const currentsetup = prevState.setups;
                const setupIndex = currentsetup.findIndex(s => s.employeeid == this.state.edit!.id);
                currentsetup[setupIndex] = {
                  setupsuccess: true,
                  licenceid: data.licenceid,
                  employeeid: this.state.edit!.id
                };

                return {
                  ...prevState,
                  setups: currentsetup,
                  edit: null
                };
              });
            }
          }}
          employeename={`${this.state.edit!.firstname} ${this.state.edit!.lastname}`}
          employee={this.state.edit!}
        />
      );
    }
  }

  componentWillUnmount() {
    this.setState({ saving: false, counter: 0, currentteam: null });
  }

  render() {
    const { team, close, service } = this.props;
    //console.log("STATE", this.state, this.props);
    return (
      <PopupBase
        buttonStyles={{
          marginTop: "0px",
          justifyContent: this.state.confirmed ? "flex-end" : "space-between"
        }}
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
                  onClick={() => this.state.confirmed && this.setState({ edit: employee })}
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

        {!this.state.confirmed && (
          <UniversalButton type="low" onClick={() => close()} label="Cancel" />
        )}
        <UniversalButton
          type="high"
          onClick={() => {
            if (this.state.confirmed) {
              this.props.savingFunction({ action: "success" });
            } else {
              this.setState({ saving: true, confirmed: true });
            }
          }}
          label={this.state.confirmed ? "Close" : "Confirm"}
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
                  currentsetup.push({
                    setupsuccess: false,
                    employeeid: this.props.team.employees[this.state.counter].id
                  });

                  return {
                    ...prevState,
                    counter: newcounter,
                    setups: currentsetup
                  };
                });
                //if (this.state.counter == team.employees.length) {
                //Finished
                //console.log("STOP");
                //this.props.savingFunction({ action: "success" });
                // }
              }}
              success={data => {
                if (data && data.error) {
                  //console.log("ERROR", data);
                  this.props.savingFunction({ action: "error", message: data });
                } else {
                  this.setState(prevState => {
                    let newcounter = prevState.counter + 1;
                    const currentsetup = prevState.setups;
                    currentsetup.push({
                      setupsuccess: true,
                      licenceid: data.licenceid,
                      employeeid: this.props.team.employees[this.state.counter].id
                    });

                    return {
                      ...prevState,
                      counter: newcounter,
                      setups: currentsetup
                    };
                  });
                }
                //if (this.state.counter == team.employees.length) {
                //Finished
                //console.log("FINISHED");
                //this.props.savingFunction({ action: "success" });
                // }
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
            closeFunction={() => {
              //console.log("CLOSE");
              close();
            }}
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

        {this.state.edit && this.editOrAdd()}
      </PopupBase>
    );
  }
}
export default compose(
  graphql(ADD_TO_TEAM, { name: "addServiceToTeam" }),
  graphql(ADD_EXTERNAL_PLAN, { name: "addExternalBoughtPlan" })
)(AddServiceToTeam);
