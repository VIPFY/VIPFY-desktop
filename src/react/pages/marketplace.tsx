import * as React from "react";
import { graphql } from "react-apollo";

import { fetchApps } from "../queries/products";
import LoadingDiv from "../components/LoadingDiv";

interface Props {
  history: any;
  products: any;
}

class Marketplace extends React.Component<Props> {
  renderLoading(apps) {
    if (apps) {
      apps.sort((a, b) => {
        const textA = a.name.toUpperCase();
        const textB = b.name.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      return (
        <div className="marketplace">
          {apps.length > 0 ? (
            apps.map(appDetails => this.renderAppCard(appDetails))
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

  openAppDetails = id => this.props.history.push(`/area/marketplace/${id}/`);

  renderAppCard = ({ id, logo, name, teaserdescription }) => (
    <div className="appThumbnail" key={id} onClick={() => this.openAppDetails(id)}>
      <div
        className="app-thumbnail-logo"
        style={{
          backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${logo})`
        }}>
        {!logo && <i className="fal fa-rocket" />}
      </div>
      <div className="caption">
        <h3>{name}</h3>
        <div className="appdiscripton">
          <p>{teaserdescription}</p>
        </div>
        <div className="app-short-info-holder" />
      </div>
    </div>
  );

  render() {
    return this.renderLoading(this.props.products.allApps);
  }
}

export default graphql(fetchApps, {
  name: "products"
})(Marketplace);
