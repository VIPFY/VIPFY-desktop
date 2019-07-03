import * as React from "react";
import UniversalSearchBox from "../../../../components/universalSearchBox";
import { Query } from "react-apollo";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import ServiceGrid from "../grid/serviceGrid";
import { fetchUserLicences } from "../../../../queries/departments";
import AddEmployeeToService from "../adding/addEmployeeToService";
import LicenceDelete from "../deleting/LicenceDelete";
import PopupSSO from "../../../../popups/universalPopups/PopupSSO";
import SelfSaving from "../../../../popups/universalPopups/SelfSavingIllustrated";
import { fetchTeam } from "../../../../queries/departments";
import TeamLicenceDelete from "../deleting/TeamLicenceDelete";
import AddServiceToTeam from "../adding/addServiceToTeam";
import EmployeeGrid from "../grid/employeeGrid";
import AddEmployeePersonalData from "../../addEmployeePersonalData";
import AddEmployeeToTeam from "../adding/addEmployeeToTeam";
import TeamDelete from "../deleting/TeamDelete";

interface Props {
  heading?: String;
  team: any;
  close: Function;
}

interface State {
  search: String;
  deleteEmployee: any;
  addEmployee: any;
  ownSSO: any;
  showLoading: Boolean;
}

class ManageTeamEmployees extends React.Component<Props, State> {
  state = {
    search: "",
    deleteEmployee: null,
    addEmployee: null,
    ownSSO: null,
    showLoading: false
  };

  onChange(s, refetch) {
    console.log("ON CHANGE", s);
    switch (s.action) {
      case "remove":
        this.setState({ deleteEmployee: s.content });
        break;
      case "add":
        this.setState({ addEmployee: s.content });
        break;

      default:
        console.log(s);
        break;
    }
    //TODO SAVING STUFF
  }

  render() {
    console.log("TMS", this.props, this.state);
    return (
      <Query query={fetchTeam} variables={{ teamid: this.props.team.unitid.id }}>
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
                <span className="bHeading">{this.props.heading || "Manage Employees"}</span>
              </span>
              <span className="secondHolder" style={{ left: "0px", float: "left" }}>
                Assigned Employees
              </span>
              <span
                className="secondHolder"
                style={{ left: "calc(50% + 16px - 200px)", float: "left" }}>
                Available Employees
              </span>
              <UniversalSearchBox
                placeholder="Search available employees"
                getValue={v => this.setState({ search: v })}
              />
              <EmployeeGrid
                employees={data.fetchTeam.employees}
                search={this.state.search}
                onChange={s => this.onChange(s, refetch)}
              />

              {this.props.children}

              {this.state.deleteEmployee && (
                <TeamDelete
                  close={() => this.setState({ deleteEmployee: null })}
                  employee={this.state.deleteEmployee}
                  team={data.fetchTeam}
                  savingFunction={so => {
                    refetch();
                    this.setState({ deleteEmployee: null });
                  }}
                />
              )}

              {this.state.addEmployee && this.state.addEmployee!.new && (
                <PopupBase fullmiddle={true} close={() => this.setState({ addEmployee: null })}>
                  <AddEmployeePersonalData
                    continue={data => {
                      this.setState({
                        addEmployee: {
                          id: data.unitid,
                          firstname: data.parsedName.firstname,
                          lastname: data.parsedName.lastname,
                          middlename: data.parsedName.middlename,
                          profilepicture: data.profilepicture
                        }
                      });
                      refetch();
                    }}
                    close={() => this.setState({ addEmployee: null })}
                    addpersonal={this.state.addEmployee}
                  />
                </PopupBase>
              )}

              {this.state.addEmployee && !this.state.addEmployee!.new && (
                <AddEmployeeToTeam
                  close={() => this.setState({ addEmployee: null })}
                  employee={this.state.addEmployee}
                  team={data.fetchTeam}
                  savingFunction={so => {
                    refetch();
                    this.setState({ addEmployee: null });
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
export default ManageTeamEmployees;
