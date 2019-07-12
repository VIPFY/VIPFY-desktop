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

interface Props {
  heading?: String;
  team: any;
  close: Function;
}

interface State {
  search: String;
  deleteService: any;
  addService: any;
  ownSSO: any;
  showLoading: Boolean;
}

class ManageTeamServices extends React.Component<Props, State> {
  state = {
    search: "",
    deleteService: null,
    addService: null,
    ownSSO: null,
    showLoading: false
  };

  onChange(s, refetch) {
    console.log("ON CHANGE", s);
    switch (s.action) {
      case "remove":
        this.setState({ deleteService: s.content });
        break;
      case "add":
        this.setState({ addService: s.content });
        break;

      default:
        console.log(s);
        break;
    }
    //TODO SAVING STUFF
  }

  render() {
    return (
      <Query
        pollInterval={60 * 10 * 1000 + 700}
        query={fetchTeam}
        variables={{ teamid: this.props.team.unitid.id }}>
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
                <span className="bHeading">{this.props.heading || "Manage Services"}</span>
              </span>
              <span className="secondHolder" style={{ left: "0px", float: "left" }}>
                Assigned Services
              </span>
              <span
                className="secondHolder"
                style={{ left: "calc(50% + 16px - 200px)", float: "left" }}>
                Available Services
              </span>
              <UniversalSearchBox
                placeholder="Search available services"
                getValue={v => this.setState({ search: v })}
              />
              <ServiceGrid
                services={data.fetchTeam.services}
                search={this.state.search}
                onChange={s => this.onChange(s, refetch)}
              />

              {this.props.children}

              {this.state.deleteService && (
                <TeamLicenceDelete
                  close={() => this.setState({ deleteService: null })}
                  team={data.fetchTeam}
                  service={this.state.deleteService}
                  savingFunction={so => {
                    console.log("SAVING");
                    refetch();
                    this.setState({ deleteService: null });
                  }}
                />
              )}

              {this.state.addService && this.state.addService!.new && (
                <>
                  <PopupSSO
                    cancel={() => this.setState({ addService: null })}
                    add={values => {
                      if (values.logo) {
                        values.images = [values.logo, values.logo];
                      }
                      delete values.logo;

                      this.setState({ ownSSO: { ...values }, showLoading: true });
                    }}
                  />

                  {this.state.showLoading && (
                    <SelfSaving
                      sso={this.state.ownSSO!}
                      userids={data.fetchTeam.employees.map(e => e.id)}
                      //  maxTime={7000}
                      closeFunction={() => {
                        this.setState({ showLoading: false, addService: null });
                        refetch();
                      }}
                    />
                  )}
                </>
              )}

              {this.state.addService && !this.state.addService!.new && (
                <AddServiceToTeam
                  close={() => this.setState({ addService: null })}
                  team={data.fetchTeam}
                  service={this.state.addService}
                  savingFunction={so => {
                    refetch();
                    this.setState({ addService: null });
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
export default ManageTeamServices;
