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

interface Props {
  heading?: String;
  employee: any;
  close: Function;
}

interface State {
  search: String;
  deleteService: any;
  addService: any;
  ownSSO: any;
  showLoading: Boolean;
}

class ManageServices extends React.Component<Props, State> {
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
    console.log("MS", this.props, this.state);
    return (
      <Query query={fetchUserLicences} variables={{ unitid: this.props.employee.id }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return null;
          }
          if (error) {
            return `Error! ${error}`;
          }

          const services = [];
          data.fetchUsersOwnLicences.forEach(
            l => !(l.tags && l.tags[0] == "vacation") && services.push(l)
          );

          return (
            <PopupBase
              fullmiddle={true}
              customStyles={{ maxWidth: "1152px" }}
              close={() => this.props.close()}
              buttonStyles={{ marginTop: "0px" }}>
              <span className="mutiplieHeading">
                <span className="bHeading">{this.props.heading || "Manage Licences"}</span>
              </span>
              <span className="secondHolder">Available Services</span>
              <UniversalSearchBox
                placeholder="Search available services"
                getValue={v => this.setState({ search: v })}
              />
              <ServiceGrid
                services={services}
                search={this.state.search}
                onChange={s => this.onChange(s, refetch)}
              />

              {this.props.children}

              {this.state.deleteService && (
                <LicenceDelete
                  close={() => this.setState({ deleteService: null })}
                  employee={this.props.employee}
                  licence={this.state.deleteService}
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
                      userids={[this.props.employee.id]}
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
                <AddEmployeeToService
                  close={() => this.setState({ addService: null })}
                  employee={this.props.employee}
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
export default ManageServices;
