import * as React from "react";
import { graphql } from "react-apollo";

import { fetchApps } from "../queries/products";
import LoadingDiv from "../components/LoadingDiv";

class Marketplace extends React.Component {
  renderLoading(apps) {
    if (apps) {
      return (
        <div className="marketplace">
          {apps.length > 0 ? (
            apps.map(appDetails => {
              return this.renderAppCard(appDetails);
            })
          ) : (
            <div className="nothingHere">
              <div className="h1">Nothing here :(</div>
              <div className="h2">
                That commonly means that you don't have enough rights or that VIPFY is not available
                in your country.
              </div>
            </div>
          )}
        </div>
      );
    }
    return <LoadingDiv text="Preparing marketplace" legalText="Just a moment please" />;
  }

  openAppDetails(id) {
    this.props.history.push(`/area/marketplace/${id}/`);
  }

  renderAppCard(appDetails) {
    return (
      <div
        className="appThumbnail"
        key={appDetails.id}
        onClick={() => this.openAppDetails(appDetails.id)}>
        <div
          className="app-thumbnail-logo"
          style={{
            backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${
              appDetails.logo
            })`
          }}
        />
        <div className="caption">
          <h3>{appDetails.name}</h3>
          <div className="appdiscripton">
            <p>{appDetails.teaserdescription}</p>
          </div>
          <div className="app-short-info-holder" />
        </div>
      </div>
    );
  }

  render() {
    return this.renderLoading(this.props.products.allApps);
  }
}

export default graphql(fetchApps, {
  name: "products"
})(Marketplace);
