import * as React from "react";
import { graphql } from "react-apollo";

import { fetchApps } from "../queries/products";
import LoadingDiv from "../components/LoadingDiv";

class Marketplace extends React.Component {
  renderLoading(apps) {
    if (apps) {
      return (
        <div className="marketplace">
          {apps.map(appDetails => {
            return this.renderAppCard(appDetails);
          })}
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
