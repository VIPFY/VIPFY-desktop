import * as React from "react";
import UniversalSearchBox from "../../components/universalSearchBox";
import { graphql, compose, Query, withApollo } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { fetchCompanyService } from "../../queries/products";
import ServiceGeneralData from "../../components/manager/serviceGeneralData";
import PrintServiceSquare from "../../components/manager/universal/squares/printServiceSquare";
import OrbitSection from "../../components/manager/orbitSection";
import UniversalButton from "../../components/universalButtons/universalButton";
import CreateOrbit from "../../components/manager/universal/adding/orbit";
import { now } from "moment";
import { resizeImage } from "../../common/images";
import { AppContext } from "../../common/functions";

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
  create: boolean;
}

class ServiceDetails extends React.Component<Props, State> {
  state = {
    loading: false,
    search: "",
    create: false
  };

  uploadPic = async (picture: File) => {
    const { teamid } = this.props.match.params;
    await this.setState({ loading: true });

    try {
      const resizedImage = await resizeImage(picture);
      await this.props.updatePic({ variables: { file: resizedImage, teamid } });

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
        variables={{ serviceid }}
        fetchPolicy="network-only">
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }

          const service = data.fetchCompanyService;

          const teams = [];
          const accounts = [];
          const singleAccounts = [];

          service.orbitids.forEach(element => {
            element.teams.forEach(team => {
              if (team != null) {
                teams.push(team);
              }
            });
          });

          service.orbitids.forEach(element => {
            element.accounts.forEach(account => {
              if (account != null && (account.endtime > now() || account.endtime == null)) {
                accounts.push(account);
                account.assignments.forEach(checkunit => {
                  if (
                    checkunit &&
                    !singleAccounts.find(
                      s => s && s && checkunit.unitid && s.id == checkunit.unitid.id
                    )
                  ) {
                    singleAccounts.push(checkunit.unitid);
                  }
                });
              }
            });
          });
          return (
            <div className="managerPage">
              <div className="heading">
                <span
                  className="h1"
                  style={{
                    display: "block",
                    maxWidth: "40vw",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "rgba(37, 54, 71, 0.6)"
                  }}>
                  <span
                    style={{ cursor: "pointer", whiteSpace: "nowrap", color: "#253647" }}
                    onClick={() => this.props.moveTo("lmanager")}>
                    Service Manager
                  </span>
                  <span className="h2">{service.app.name}</span>
                </span>

                {/*<UniversalSearchBox
                  getValue={v => {
                    this.setState({ search: v });
                  }}
                />*/}
              </div>
              <div className="section">
                <div className="heading">
                  <h1>Service Data</h1>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <form>
                      <label>
                        <PrintServiceSquare
                          appidFunction={s => s}
                          service={service.app}
                          className="managerBigSquare"
                          additionalStyles={{ marginLeft: "16px", marginTop: "16px" }}
                          size={96}
                        />
                      </label>
                    </form>
                  </div>
                  <div style={{ width: "calc(100% - 176px - (100% - 160px - 5*176px)/4)" }}>
                    <div className="table" style={{ marginTop: "24px" }}>
                      <ServiceGeneralData servicedata={service.app} accounts={accounts} />
                    </div>
                  </div>
                </div>
              </div>
              {service.orbitids
                .filter(o => o.endtime == null || o.endtime > now())
                .map(orbit => (
                  <OrbitSection key={orbit.id} orbit={orbit} app={service.app} refetch={refetch} />
                ))}
              <div className="section">
                <div className="heading">
                  <h1>
                    <AppContext.Consumer>
                      {({ addRenderElement }) => (
                        <UniversalButton
                          innerRef={el => addRenderElement({ key: "createOrbit", element: el })}
                          type="high"
                          label="Create Orbit"
                          onClick={() => this.setState({ create: true })}
                        />
                      )}
                    </AppContext.Consumer>
                  </h1>
                </div>
              </div>
              {this.state.create && (
                <CreateOrbit service={service.app} close={() => this.setState({ create: false })} />
              )}
            </div>
          );
        }}
      </Query>
    );
  }
}
export default compose(graphql(UPDATE_PIC, { name: "updatePic" }))(withApollo(ServiceDetails));
