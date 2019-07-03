import * as React from "react";
import UniversalSearchBox from "../../../../components/universalSearchBox";
import TeamAdd from "../adding/TeamAdd";
import { Query } from "react-apollo";
import { fetchTeams } from "../../../../queries/departments";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import TeamDelete from "../deleting/TeamDelete";
import TeamGrid from "../grid/teamGrid";
import AddEmployeeToTeam from "../adding/addEmployeeToTeam";
import AddTeamGeneralData from "../../addTeamGeneralData";

interface Props {
  heading?: String;
  employee: any;
  close: Function;
}

interface State {
  search: String;
  deleteTeam: any;
  addTeam: any;
}

class ManageTeams extends React.Component<Props, State> {
  state = {
    search: "",
    deleteTeam: null,
    addTeam: null
  };

  onChange(s, refetch) {
    console.log("ON CHANGE", s);
    switch (s.action) {
      case "remove":
        this.setState({ deleteTeam: s.content });
        break;
      case "add":
        this.setState({ addTeam: s.content });
        break;

      default:
        console.log(s);
        break;
    }
    //TODO SAVING STUFF
  }

  render() {
    console.log("AET", this.props, this.state);
    return (
      <Query query={fetchTeams} variables={{ userid: this.props.employee.id }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return null;
          }
          if (error) {
            return `Error! ${error}`;
          }
          return (
            <PopupBase
              fullmiddle={true}
              customStyles={{ maxWidth: "1152px" }}
              close={() => this.props.close()}
              buttonStyles={{ marginTop: "0px" }}>
              <span className="mutiplieHeading">
                <span className="bHeading">{this.props.heading || "Manage Teams"}</span>
              </span>
              <span className="secondHolder" style={{ left: "0px", float: "left" }}>
                Assigned Teams
              </span>
              <span
                className="secondHolder"
                style={{ left: "calc(50% + 16px - 200px)", float: "left" }}>
                Available Teams
              </span>
              <UniversalSearchBox
                placeholder="Search available teams"
                getValue={v => this.setState({ search: v })}
              />
              <TeamGrid
                teams={data.fetchTeams}
                search={this.state.search}
                onChange={s => this.onChange(s, refetch)}
              />

              {this.props.children}

              {this.state.deleteTeam && (
                <TeamDelete
                  close={() => this.setState({ deleteTeam: null })}
                  employee={this.props.employee}
                  team={this.state.deleteTeam}
                  savingFunction={so => {
                    refetch();
                    this.setState({ deleteTeam: null });
                  }}
                />
              )}

              {this.state.addTeam && this.state.addTeam!.new && (
                <PopupBase fullmiddle={true} close={() => this.setState({ addTeam: null })}>
                  <AddTeamGeneralData
                    close={() => this.setState({ addTeam: null })}
                    savingFunction={so => {
                      if (so.action == "success") {
                        this.setState({ addTeam: so.content });
                      }
                    }}
                  />
                </PopupBase>
              )}

              {this.state.addTeam && !this.state.addTeam!.new && (
                <AddEmployeeToTeam
                  close={() => this.setState({ addTeam: null })}
                  employee={this.props.employee}
                  team={this.state.addTeam}
                  savingFunction={so => {
                    refetch();
                    this.setState({ addTeam: null });
                  }}
                />
              )}
            </PopupBase>
          );
        }}
      </Query>
    );
  }
}
export default ManageTeams;
