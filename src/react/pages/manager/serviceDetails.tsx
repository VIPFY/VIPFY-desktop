import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { graphql, compose, Query, withApollo } from "react-apollo";
import * as Dropzone from "react-dropzone";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { QUERY_SEMIPUBLICUSER } from "../../queries/user";
import LicencesSection from "../../components/manager/licencesSection";
import PersonalDetails from "../../components/manager/personalDetails";
import TeamsSection from "../../components/manager/teamsSection";

import { fetchTeam } from "../../queries/departments";
import TeamGeneralData from "../../components/manager/teamGeneralData";
import EmployeeSection from "../../components/manager/serviceDetails/employeeSection";
import ServiceSection from "../../components/manager/serviceSection";
import { fetchCompanyService } from "../../queries/products";
import ServiceGeneralData from "../../components/manager/serviceGeneralData";
import ServiceTeamsSection from "../../components/manager/serviceTeamsSection";
import EmptySection from "../../components/manager/serviceDetails/emptySection";
import PrintServiceSquare from "../../components/manager/universal/squares/printServiceSquare";

const UPDATE_PIC = gql`
  mutation onUpdateTeamPic($file: Upload!, $teamid: ID!) {
    updateTeamPic(file: $file, teamid: $teamid) {
      unitid {
        id
      }
      profilepicture
    }
  }
`;

interface Props {
  moveTo: Function;
  updatePic: Function;
  client: ApolloClient<InMemoryCache>;
}

interface State {
  loading: boolean;
  search: string;
}

class ServiceDetails extends React.Component<Props, State> {
  state = {
    loading: false,
    search: ""
  };

  uploadPic = async (picture: File) => {
    const { teamid } = this.props.match.params;
    await this.setState({ loading: true });

    try {
      await this.props.updatePic({ variables: { file: picture, teamid } });

      await this.setState({ loading: false });
    } catch (err) {
      await this.setState({ loading: false });
    }
  };

  render() {
    const serviceid = this.props.match.params.serviceid;
    return (
      <Query
        pollInterval={60 * 10 * 1000 + 1000}
        query={fetchCompanyService}
        variables={{ serviceid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }

          const service = data.fetchCompanyService && data.fetchCompanyService.app;

          return (
            <div className="managerPage">
              <div className="heading">
                <span className="h1">
                  <span style={{ cursor: "pointer" }} onClick={() => this.props.moveTo("emanager")}>
                    Service Manager
                  </span>
                  <span className="h2">{service.name}</span>
                </span>

                <UniversalSearchBox
                  getValue={v => {
                    this.setState({ search: v });
                  }}
                />
              </div>
              <div className="section">
                <div className="heading">
                  <h1>General Data</h1>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <form>
                      <label>
                        <PrintServiceSquare
                          appidFunction={s => s}
                          service={service}
                          className="managerBigSquare"
                          additionalStyles={{ marginLeft: "16px", marginTop: "16px" }}
                        />
                      </label>
                    </form>
                  </div>
                  <div style={{ width: "calc(100% - 176px - (100% - 160px - 5*176px)/4)" }}>
                    <div className="table" style={{ marginTop: "24px" }}>
                      <ServiceGeneralData servicedata={data.fetchCompanyService} />
                    </div>
                  </div>
                </div>
              </div>
              <ServiceTeamsSection
                service={service}
                teams={data.fetchCompanyService.teams}
                moveTo={this.props.moveTo}
                search={this.state.search}
              />
              <EmployeeSection
                search={this.state.search}
                service={service}
                licences={data.fetchCompanyService.licences}
                moveTo={this.props.moveTo}
              />
              <EmptySection
                search={this.state.search}
                service={service}
                licences={data.fetchCompanyService.licences}
                moveTo={this.props.moveTo}
              />
            </div>
          );
        }}
      </Query>
    );
  }
}
export default compose(graphql(UPDATE_PIC, { name: "updatePic" }))(withApollo(ServiceDetails));
