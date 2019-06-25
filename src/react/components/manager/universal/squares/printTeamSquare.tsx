import * as React from "react";
import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";

interface Props {
  team: any;
  className: string | null;
  saveupdate?: Function;
  addToTeam: Function;
  addLicence: Function;
}

interface State {
  saving: Boolean;
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

class PrintTeamSquare extends React.Component<Props, State> {
  state = {
    saving: false
  };
  componentDidUpdate = async (prevProps, prevState) => {
    if (
      this.props.saveupdate &&
      this.props.team.integrating &&
      this.props.team.setupfinished &&
      !prevProps.team.setupfinished
    ) {
      if (this.props.saveupdate) {
        this.props.saveupdate({ state: "saving", teamid: this.props.team.unitid.id });
      }
      this.setState({ saving: true });
    }
    if (this.props.saveupdate && this.state.saving && !prevState.saving) {
      const newemps = this.props.team.employees.filter(e => e.setupfinished);
      const teamaddpromises = [];
      try {
        newemps.forEach(e =>
          this.props.addToTeam({
            variables: { employeeid: e.id, teamid: this.props.team.unitid.id }
          })
        );
      } catch (error) {
        //throw new Error(error);
        this.setState({ saving: false });
        console.log(error);
      }
      await Promise.all(teamaddpromises);

      const newservices = this.props.team.services.filter(s => s.setupfinished);
      const servicepromises = [];
      try {
        newservices.forEach(s =>
          servicepromises.push(
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
      } catch (error) {
        this.setState({ saving: false });
        if (this.props.saveupdate) {
          this.props.saveupdate({ state: "error", teamid: this.props.team.unitid.id });
        }
        console.log(error);
      }
      this.setState({ saving: false });
      if (this.props.saveupdate) {
        this.props.saveupdate({ state: "saved", teamid: this.props.team.unitid.id });
      }

      console.log("Create Licences");
    }
  };

  render() {
    const { team } = this.props;
    return (
      <div
        key={team.name}
        title={team.name}
        className={this.props.className || "managerSquare"}
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
            : { backgroundColor: "#5d76ff" }
        }>
        {team.profilepicture
          ? ""
          : team.internaldata && team.internaldata.letters
          ? team.internaldata.letters
          : team.name.slice(0, 1)}
      </div>
    );
  }
}
export default compose(
  graphql(ADD_EMPLOYEE_TO_TEAM, { name: "addToTeam" }),
  graphql(ADD_LICENCE_TO_USER, { name: "addLicence" })
)(PrintTeamSquare);
