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
  innerRef: any;
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
    switch (s.action) {
      case "remove":
        this.setState({ deleteService: s.content });
        break;
      case "add":
        this.setState({ addService: s.content });
        break;

      default:
        console.log("Change Service", s);
        break;
    }
    //TODO SAVING STUFF
  }

  render() {
    return (
      <PopupBase
        fullmiddle={true}
        customStyles={{ maxWidth: "1152px" }}
        close={() => this.props.close()}
        buttonStyles={{ marginTop: "0px" }}
        ref={this.props.innerRef}>
        <span className="mutiplieHeading">
          <span className="bHeading">{this.props.heading || "Manage Services"}</span>
        </span>
        <span className="secondHolder" style={{ left: "0px", float: "left" }}>
          Assigned Services
        </span>
        <span className="secondHolder" style={{ left: "calc(50% + 16px - 200px)", float: "left" }}>
          Available Services
        </span>
        <UniversalSearchBox
          placeholder="Search available services"
          getValue={v => this.setState({ search: v })}
        />
        <Query
          pollInterval={60 * 10 * 1000 + 200}
          query={fetchUserLicences}
          variables={{ unitid: this.props.employee.id }}
          fetchPolicy="network-only">
          {({ loading, error, data, refetch }) => {
            if (loading) {
              return "Loading";
            }
            if (error) {
              return `Error! ${error}`;
            }

            const services = [];
            data.fetchUsersOwnLicences.forEach(
              l => !(l.tags && l.tags.includes("vacation")) && services.push(l)
            );

            return (
              <>
                <ServiceGrid
                  services={services}
                  search={this.state.search}
                  onChange={s => this.onChange(s, refetch)}
                />

                {this.state.deleteService && (
                  <LicenceDelete
                    close={() => this.setState({ deleteService: null })}
                    employee={this.props.employee}
                    licence={this.state.deleteService}
                    savingFunction={so => {
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
              </>
            );
          }}
        </Query>
        {this.props.children}
      </PopupBase>
    );
  }
}
export default React.forwardRef((props, ref) => <ManageServices innerRef={ref} {...props} />);
