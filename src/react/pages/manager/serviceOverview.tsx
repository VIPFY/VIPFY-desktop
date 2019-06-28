import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Query, Mutation } from "react-apollo";
import { fetchCompanyTeams } from "../../queries/departments";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import AddTeamGeneralData from "../../components/manager/addTeamGeneralData";
import AddTeamEmployeeData from "../../components/manager/addTeamEmployeeData";
import AddTeamServices from "../../components/manager/addTeamServices";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import { fetchCompanyServices } from "../../queries/products";
import { now } from "moment";
import AddServiceGeneralData from "../../components/manager/serviceDetails/addServiceGeneralData";
import AddTeam from "../../components/manager/serviceDetails/addTeam";
import AddEmployee from "../../components/manager/serviceDetails/addEmployee";
import PrintTeamSquare from "../../components/manager/universal/squares/printTeamSquare";
import ColumnTeams from "../../components/manager/universal/columns/columnTeams";
import ColumnEmployees from "../../components/manager/universal/columns/columnEmployee";
import ManageServiceTeams from "../../components/manager/universal/managing/serviceteams";
import ManageServiceEmployees from "../../components/manager/universal/managing/serviceemployees";

interface Props {
  moveTo: Function;
}

interface State {
  search: string;
  add: Boolean;
  addStage: number;
  addservice: Object | null;
  teams: { id: number; name: number; profilepicture: string }[];
  addemployees: any[];
  saving: Boolean;
  deleting: number | null;
  willdeleting: number | null;
  keepLicences: { service: number; employee: number }[];
}

const CREATE_SERVICE = gql`
  mutation createService($serviceData: JSON!, $addedTeams: [JSON]!, $addedEmployees: [JSON]!) {
    createService(
      serviceData: $serviceData
      addedTeams: $addedTeams
      addedEmployees: $addedEmployees
    )
  }
`;

const DELETE_SERVICE = gql`
  mutation deleteService($serviceid: ID!) {
    deleteService(serviceid: $serviceid)
  }
`;

class ServiceOverview extends React.Component<Props, State> {
  state = {
    search: "",
    add: false,
    addservice: null,
    addStage: 1,
    teams: [],
    addemployees: [],
    saving: false,
    deleting: null,
    willdeleting: null,
    keepLicences: [],
    currentServices: []
  };

  addService(singles) {
    this.setState({ addemployees: singles, saving: true, add: false });
  }

  addProcess(refetch) {
    switch (this.state.addStage) {
      case 1:
        return (
          <AddServiceGeneralData
            continue={data => this.setState({ addservice: data, addStage: 2 })}
            close={() => this.setState({ add: false })}
            addservice={this.state.addservice}
            currentServices={this.state.currentServices}
          />
        );
      case 2:
        return (
          /*<AddTeam
            continue={data => {
              this.setState({ teams: data, addStage: 3 });
            }}
            close={() => this.setState({ addStage: 1 })}
            service={this.state.addservice}
            addedTeams={this.state.teams}
            teams={[]}
          />*/
          <ManageServiceTeams
            service={this.state.addservice}
            close={() => {
              this.setState({ add: false });
              refetch();
            }}>
            <div className="buttonsPopup">
              <UniversalButton
                label="Close"
                type="low"
                onClick={() => {
                  this.setState({ add: false });
                  refetch();
                }}
              />
              <div className="buttonSeperator" />
              <UniversalButton
                label="Manage Employees"
                type="high"
                onClick={() => this.setState({ addStage: 3 })}
              />
            </div>
          </ManageServiceTeams>
        );
      case 3:
        return (
          /*<AddEmployee
            continue={singles => this.addService(singles)}
            close={() => this.setState({ addStage: 2 })}
            addedLicences={this.state.addemployees}
            licences={[]}
            service={this.state.addservice}
          />*/
          <ManageServiceEmployees
            service={this.state.addservice}
            close={() => {
              this.setState({ add: false });
              refetch();
            }}>
            <div className="buttonsPopup">
              <UniversalButton
                label="Close"
                type="low"
                onClick={() => {
                  this.setState({ add: false });
                  refetch();
                }}
              />
            </div>
          </ManageServiceEmployees>
        );
      default:
        return <div />;
    }
  }

  printServices(services) {
    const serviceArray: JSX.Element[] = [];
    services.forEach(service => {
      if (service.licences.find(l => l.endtime == null || l.endtime > now())) {
        serviceArray.push(
          <div
            key={service.name}
            className="tableRow"
            onClick={() => this.props.moveTo(`lmanager/${service.app.id}`)}>
            <div className="tableMain">
              <div className="tableColumnBig">
                <div
                  title={service.app.name}
                  className="managerSquare"
                  style={{
                    backgroundImage:
                      service.app.icon.indexOf("/") != -1
                        ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                            service.app.icon
                          )})`
                        : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                            service.app.icon
                          )})`,
                    backgroundColor: "unset"
                  }}
                />
                <span className="name">{service.app.name}</span>
              </div>
              <ColumnTeams teams={service.teams} teamidFunction={team => team.departmentid} />
              <ColumnEmployees
                employees={service.licences}
                checkFunction={l =>
                  ((l.unitid != null && l.endtime == null) || l.endtime > now()) &&
                  (l.options == null || l.options.teamlicence == null)
                }
                employeeidFunction={e => e.unitid}
              />
            </div>
            <div className="tableEnd">
              <div className="editOptions">
                <i className="fal fa-external-link-alt editbuttons" />
                <i
                  className="fal fa-trash-alt editbuttons"
                  onClick={e => {
                    e.stopPropagation();
                    this.setState({ willdeleting: service });
                  }}
                />
              </div>
            </div>
          </div>
        );
      }
    });
    return serviceArray;
  }
  render() {
    return (
      <div className="managerPage">
        <div className="heading">
          <h1>Service Manager</h1>
          <UniversalSearchBox
            getValue={v => {
              this.setState({ search: v });
            }}
          />
        </div>
        <div className="section">
          <div className="heading">
            <h1>Services</h1>
          </div>
          <Query query={fetchCompanyServices} fetchPolicy="network-only">
            {({ loading, error, data, refetch }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return `Error! ${error.message}`;
              }

              //Sort teams
              let services: any[] = [];
              let interservices: any[] = [];
              if (data.fetchCompanyServices) {
                interservices = data.fetchCompanyServices;
                interservices.sort(function(a, b) {
                  let nameA = a.app.name.toUpperCase();
                  let nameB = b.app.name.toUpperCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  // namen müssen gleich sein
                  return 0;
                });
                if (this.state.search != "") {
                  services = interservices.filter(service => {
                    return service.app.name.toUpperCase().includes(this.state.search.toUpperCase());
                  });
                } else {
                  services = interservices;
                }
              }
              return (
                <div className="table" key="table">
                  <div className="tableHeading">
                    <div className="tableMain">
                      <div className="tableColumnBig">
                        <h1>Name</h1>
                      </div>
                      <div className="tableColumnBig">
                        <h1>Teams</h1>
                      </div>
                      <div className="tableColumnBig">
                        <h1>Single Users</h1>
                      </div>
                    </div>
                    <div className="tableEnd">
                      <UniversalButton
                        type="high"
                        label="Add Service"
                        customStyles={{
                          fontSize: "12px",
                          lineHeight: "24px",
                          fontWeight: "700",
                          marginRight: "16px",
                          width: "92px"
                        }}
                        onClick={() =>
                          this.setState({
                            add: true,
                            addStage: 1,
                            addemployees: [],
                            addservice: null,
                            teams: [],
                            currentServices: data.fetchCompanyServices
                          })
                        }
                      />
                    </div>
                  </div>
                  {services.length > 0 && this.printServices(services)}
                  {this.state.add && (
                    <PopupBase
                      fullmiddle={true}
                      customStyles={{ maxWidth: "1152px" }}
                      close={() => this.setState({ add: false })}>
                      {this.addProcess(refetch)}
                    </PopupBase>
                  )}
                </div>
              );
            }}
          </Query>
        </div>
        {this.state.saving && (
          <Mutation mutation={CREATE_SERVICE}>
            {createService => (
              <PopupSelfSaving
                savingmessage="Adding new service"
                savedmessage="New service succesfully added"
                saveFunction={async () => {
                  await createService({
                    variables: {
                      serviceData: this.state.addservice,
                      addedTeams: this.state.teams,
                      addedEmployees: this.state.addemployees
                    },
                    refetchQueries: [{ query: fetchCompanyServices }]
                  });
                }}
                closeFunction={() =>
                  this.setState({
                    saving: false,
                    addemployees: [],
                    teams: [],
                    addservice: null,
                    addStage: 1
                  })
                }
              />
            )}
          </Mutation>
        )}
        {this.state.willdeleting && (
          <PopupBase
            fullmiddle={true}
            dialog={true}
            close={() => this.setState({ willdeleting: null })}
            closeable={false}>
            <p>Do you really want to delete the service and all its licences?</p>
            <UniversalButton type="low" closingPopup={true} label="Cancel" />
            <UniversalButton
              type="low"
              label="Delete"
              onClick={() => {
                this.setState(prevState => {
                  return {
                    willdeleting: null,
                    deleting: prevState.willdeleting!.id
                  };
                });
              }}
            />
          </PopupBase>
        )}
        {this.state.deleting && (
          <Mutation mutation={DELETE_SERVICE}>
            {deleteTeam => (
              <PopupSelfSaving
                savingmessage="Deleting service"
                savedmessage="Service succesfully deleted"
                saveFunction={async () =>
                  await deleteTeam({
                    variables: {
                      serviceid: this.state.deleting
                    },
                    refetchQueries: [{ query: fetchCompanyServices }]
                  })
                }
                closeFunction={() =>
                  this.setState({
                    deleting: null,
                    keepLicences: []
                  })
                }
              />
            )}
          </Mutation>
        )}
      </div>
    );
  }
}
export default ServiceOverview;
