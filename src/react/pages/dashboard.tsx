import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Welcome from "../popups/welcome";
import LoadingDiv from "../components/LoadingDiv";

import { FETCH_COMPANY } from "../queries/departments";
import { filterError, AppContext } from "../common/functions";

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

  showApps(licences) {
    let appLogos: JSX.Element[] = [];

    if (licences) {
      licences.sort(function(a, b) {
        let nameA = a.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.boughtplanid.planid.appid.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });
      if (licences.length > 0) {
        licences.forEach((licence, key) => {
          appLogos.push(
            <div
              className="logoAppsTile"
              key={`useableLogo-${key}`}
              onClick={() => this.setApp(licence.id)}
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                  licence.boughtplanid.planid.appid.icon
                })`
              }}>
              {licence.boughtplanid.planid.options &&
              licence.boughtplanid.planid.options.external ? (
                <div className="ribbon ribbon-top-right">
                  <span>external</span>
                </div>
              ) : (
                ""
              )}
              <span className="nameAppsTile">
                {licence.boughtplanid.alias
                  ? licence.boughtplanid.alias
                  : licence.boughtplanid.planid.appid.name}
              </span>
            </div>
          );
        });
      } else {
        return <div className="noApp">No Apps for you at the moment :(</div>;
      }
    }
    return appLogos;
  }

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
    const { /*rcApps,*/ licences } = this.props;

    if (/*rcApps.loading ||*/ licences.loading) {
      //return <LoadingDiv text="Fetching Recommendations..." />;
      return <LoadingDiv text="Fetching Licences..." />;
    }

    /*if (rcApps.error) {
      return filterError(rcApps.error);
    }*/

    return (
      <div className="dashboard-working">
        <div className="dashboardHeading">
          <div>My Apps</div>
        </div>
        <div className="appsTile">{this.showApps(licences.fetchLicences)}</div>
        {/*<div className="dashboardHeading">
          <div>Our Recommendations</div>
        </div>
        {this.showRec(licences.fetchLicences)} //TODO Reimplement reccomendations*/}
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
