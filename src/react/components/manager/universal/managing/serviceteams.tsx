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
import { fetchCompanyService } from "../../../../queries/products";
import TeamLicenceDelete from "../deleting/TeamLicenceDelete";
import AddServiceToTeam from "../adding/addServiceToTeam";

interface Props {
  heading?: String;
  service: any;
  close: Function;
}

interface State {
  search: String;
  deleteTeam: any;
  addTeam: any;
}

class ManageServiceTeams extends React.Component<Props, State> {
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
      <Query query={fetchCompanyService} variables={{ serviceid: this.props.service.id }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return null;
          }
          if (error) {
            return `Error! ${error}`;
          }
          console.log("data", data);
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
                teams={
                  data.fetchCompanyService
                    ? data.fetchCompanyService.teams.map(t => {
                        return { ...t.departmentid, service: { boughtplanid: t.boughtplanid } };
                      })
                    : []
                }
                search={this.state.search}
                onChange={s => this.onChange(s, refetch)}
              />

              {this.props.children}

              {this.state.deleteTeam && (
                <TeamLicenceDelete
                  close={() => this.setState({ deleteTeam: null })}
                  team={this.state.deleteTeam}
                  service={this.state.deleteTeam!.service.boughtplanid}
                  savingFunction={so => {
                    console.log("SAVING");
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
                <AddServiceToTeam
                  close={() => this.setState({ addTeam: null })}
                  team={this.state.addTeam}
                  service={
                    data.fetchCompanyService ? data.fetchCompanyService.app : this.props.service
                  }
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
export default ManageServiceTeams;
