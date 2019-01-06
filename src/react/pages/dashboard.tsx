import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import AppList from "../components/profile/AppList";
import LoadingDiv from "../components/LoadingDiv";

import { FETCH_COMPANY } from "../queries/departments";
import { filterError, ErrorComp, AppContext } from "../common/functions";

const FETCH_ADDRESS_PROPOSAL = gql`
  query onFetchAddressProposal($placeid: String!) {
    fetchAddressProposal(placeid: $placeid)
  }
`;

interface Props {
  firstname: string;
  history: any;
  lastname: string;
  rcApps: any;
  setApp: Function;
  moveTo: Function;
  showPopup: Function;
  licences: any;
  placeid?: string;
  firstLogin: boolean;
  disableWelcome: Function;
  addressProposal?: object;
  vatId: string;
  statisticData: object;
}

class Dashboard extends React.Component<Props, {}> {
  setApp = (licence: number) => this.props.setApp(licence);

  render() {
    if (this.props.licences.loading) {
      return <LoadingDiv text="Fetching Licences..." />;
    }

    if (this.props.licences.error) {
      return <ErrorComp error={filterError(this.props.licences.error)} />;
    }

    if (this.props.licences.length < 1) {
      return <div className="noApp">No Apps for you at the moment :(</div>;
    }

    return (
      <div className="dashboard-working">
        <div className="dashboardHeading">
          <div>My Apps</div>
        </div>
        <AppList setApp={this.setApp} />
      </div>
    );
  }
}

export default props => (
  <AppContext.Consumer>
    {context => {
      if (context.firstLogin && context.placeid) {
        return (
          <Query query={FETCH_ADDRESS_PROPOSAL} variables={{ placeid: context.placeid }}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv text="Fetching Recommendations..." />;
              }

              if (error) {
                return filterError(error);
              }

              return (
                <Dashboard {...props} addressProposal={data.fetchAddressProposal} {...context} />
              );
            }}
          </Query>
        );
      } else {
        return (
          <Query query={FETCH_COMPANY}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv text="Fetching Recommendations..." />;
              }

              if (error) {
                return filterError(error);
              }
              const addressProposal = { name: data.fetchCompany.name };
              return <Dashboard {...props} addressProposal={addressProposal} {...context} />;
            }}
          </Query>
        );
      }
    }}
  </AppContext.Consumer>
);
