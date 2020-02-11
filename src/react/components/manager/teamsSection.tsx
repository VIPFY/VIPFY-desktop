import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query } from "react-apollo";
import { fetchTeams } from "../../queries/departments";
import Team from "./employeeDetails/team";
import AssignNewTeamMemberFromMember from "./universal/adding/assignNewTeamMemberFromMember";

interface Props {
  employeeid: number; //TODO CHANGE TO EMPLOYEE
  employeename: string;
  employee: any;
  moveTo: Function;
  isadmin?: Boolean;
}

interface State {
  add: Boolean;
}

class TeamsSection extends React.Component<Props, State> {
  state = {
    add: false
  };

  render() {
    return (
      <Query
        pollInterval={60 * 10 * 1000 + 800}
        query={fetchTeams}
        variables={{ userid: this.props.employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }

          if (error) {
            return `Error! ${error.message}`;
          }

          let teamArray: JSX.Element[] = [];
          if (data.fetchTeams) {
            data.fetchTeams.sort(function(a, b) {
              let nameA = a.name.toUpperCase(); // ignore upper and lowercase
              let nameB = b.name.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }

              // namen müssen gleich sein
              return 0;
            });
            data.fetchTeams.forEach(team => {
              teamArray.push(
                <Team
                  key={team.name}
                  employee={this.props.employee}
                  team={team}
                  moveTo={this.props.moveTo}
                  isadmin={this.props.isadmin}
                />
              );
            });
            return (
              <div className="section">
                <div className="heading">
                  <h1>Teams</h1>
                  {this.props.isadmin && (
                    <UniversalButton
                      type="high"
                      label="Manage Teams"
                      customStyles={{
                        fontSize: "12px",
                        lineHeight: "24px",
                        fontWeight: "700",
                        marginRight: "16px",
                        width: "120px"
                      }}
                      onClick={() => {
                        this.setState({ add: true });
                      }}
                    />
                  )}
                </div>
                <div className="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      <div className="tableColumnSmall">
                        <h1>Team</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>Created at</h1>
                      </div>
                      <div className="tableColumnSmall">
                        <h1>#Teammembers</h1>
                      </div>
                      <div className="tableColumnSmall">{/*<h1>#Shared Licences</h1>*/}</div>
                      <div className="tableColumnSmall">{/*<h1>Leader</h1>*/}</div>
                    </div>
                    <div className="tableEnd"></div>
                  </div>
                  {teamArray}
                </div>
                {this.state.add && (
                  <AssignNewTeamMemberFromMember
                    employee={this.props.employee}
                    close={() => this.setState({ add: false })}
                  />
                )}
              </div>
            );
          }
        }}
      </Query>
    );
  }
}

export default TeamsSection;
