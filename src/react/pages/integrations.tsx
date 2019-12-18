import * as React from "react";
import { graphql, compose, withApollo } from "react-apollo";

import { fetchApps } from "../queries/products";
import LoadingDiv from "../components/LoadingDiv";
import UniversalSearchBox from "../components/universalSearchBox";
import PopupSSO from "../popups/universalPopups/PopupSSO";
import AppCardIntegrations from "../components/services/appCardIntegrations";
import SelfSaving from "../popups/universalPopups/SelfSavingIllustrated";
import { SSO } from "../interfaces";

interface Props {
  products: any;
}

export type AppPageState = {
  popupSSO: boolean;
  searchstring: String;
  showLoading: boolean;
  ownSSO: SSO;
};

class Integrations extends React.Component<Props, AppPageState> {
  state = {
    popupSSO: false,
    searchstring: "",
    showLoading: false,
    ownSSO: {}
  };
  renderLoading(appsunfiltered) {
    if (appsunfiltered) {
      const apps = appsunfiltered.filter(element =>
        element.name.toLowerCase().includes(this.state.searchstring.toLowerCase())
      );
      apps.sort(function(a, b) {
        let nameA = a.name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.name.toUpperCase(); // ignore upper and lowercase

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });

      return (
        <div className="integrations">
          <div className="header">
            <UniversalSearchBox
              placeholder="Search for an service..."
              getValue={value => this.setState({ searchstring: value })}
            />

            <button
              type="button"
              className="button-external"
              onClick={() => this.setState({ popupSSO: true })}>
              <i className="fal fa-universal-access" />
              <span>Add your own Service</span>
            </button>
          </div>
          {this.showapps(apps)}
        </div>
      );
    }
    return <LoadingDiv text="Preparing marketplace" legalText="Just a moment please" />;
  }

  showapps = apps => {
    if (apps.length > 0) {
      return apps.map(appDetails => this.renderAppCard(appDetails));
    }
    if (this.state.searchstring === "") {
      return (
        <div className="nothingHere">
          <div className="h1">Nothing here :(</div>
          <div className="h2">
            That commonly means that you don't have enough rights or that VIPFY is not available in
            your country.
          </div>
        </div>
      );
    }
    return (
      <div className="nothingHere">
        <div className="h1">Nothing here :(</div>
        <div className="h2">We have no apps that fits your search.</div>
      </div>
    );
  };
  renderAppCard = ({ id, logo, icon, name, teaserdescription, needssubdomain, options }) => (
    <AppCardIntegrations
      key={id}
      id={id}
      logo={logo}
      icon={icon}
      name={name}
      teaserdescription={teaserdescription}
      needssubdomain={needssubdomain}
      options={options}
    />
  );

  render() {
    return (
      <div>
        {this.renderLoading(this.props.products.allApps)}

        {this.state.popupSSO && (
          <React.Fragment>
            <PopupSSO
              cancel={() => this.setState({ popupSSO: false })}
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
                sso={this.state.ownSSO}
                //  maxTime={7000}
                closeFunction={() => this.setState({ showLoading: false, popupSSO: false })}
              />
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default compose(
  graphql(fetchApps, {
    name: "products"
  }),
  withApollo
)(Integrations);
