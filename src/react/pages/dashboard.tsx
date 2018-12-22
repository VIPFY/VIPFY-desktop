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
  /*componentDidMount() {
    if (this.props.firstLogin || true) {
      this.props.showPopup({
        header: "Welcome to Vipfy",
        body: Welcome,
        props: {
          fullName: `${this.props.firstname} ${this.props.lastname}`,
          proposal: this.props.addressProposal ? this.props.addressProposal : null,
          statisticData: this.props.statisticData,
          disableWelcome: () => this.props.disableWelcome()
        }
      });
    }
  }*/

  setApp = (licence: number) => this.props.setApp(licence);

  goTo = view => this.props.history.push(`/area${view}`);

  showRec(licences) {
    let recLogo: JSX.Element[] = [];
    let recApps: number[] = [];

    if (licences) {
      if (
        !licences.find(function(e) {
          return e.boughtplanid.planid.appid.id === 2;
        })
      ) {
        recApps.push(2);
      }
      if (
        !licences.find(function(e) {
          return e.boughtplanid.planid.appid.id === 4;
        })
      ) {
        recApps.push(4);
      }
      if (
        !licences.find(function(e) {
          return e.boughtplanid.planid.appid.id === 27;
        })
      ) {
        recApps.push(27);
      }

      if (recApps.length > 0) {
        recApps.forEach((element, key) => {
          switch (element) {
            case 2:
              recLogo.push(
                <div
                  className="logoAppsTile"
                  key={`useableLogo-${key}`}
                  onClick={() => this.props.moveTo("marketplace/2")}
                  style={{
                    backgroundImage:
                      "url(https://storage.googleapis.com/vipfy-imagestore-01/icons/weebly.jpg)"
                  }}>
                  <span className="nameAppsTile">Weebly</span>
                </div>
              );
              break;
            case 4:
              recLogo.push(
                <div
                  className="logoAppsTile"
                  key={`useableLogo-${key}`}
                  onClick={() => this.props.moveTo("marketplace/4")}
                  style={{
                    backgroundImage:
                      "url(https://storage.googleapis.com/vipfy-imagestore-01/icons/pipedrive.png)"
                  }}>
                  <span className="nameAppsTile">Pipedrive</span>
                </div>
              );
              break;
            case 27:
              recLogo.push(
                <div
                  className="logoAppsTile"
                  key={`useableLogo-${key}`}
                  onClick={() => this.props.moveTo("marketplace/27")}
                  style={{
                    backgroundImage:
                      "url(https://storage.googleapis.com/vipfy-imagestore-01/icons/20082018-e368x-sendgrid-png)"
                  }}>
                  <span className="nameAppsTile">SendGrid</span>
                </div>
              );
              break;
          }
        });
      }
    }
    if (recLogo.length > 0) {
      return <div className="appsTile">{recLogo}</div>;
    }
    return <div className="noApp">You have everything you really need at the moment :)</div>;
  }

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
        <AppList />
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
              console.log(data);
              const addressProposal = { name: data.fetchCompany.name };
              return <Dashboard {...props} addressProposal={addressProposal} {...context} />;
            }}
          </Query>
        );
      }
    }}
  </AppContext.Consumer>
);
