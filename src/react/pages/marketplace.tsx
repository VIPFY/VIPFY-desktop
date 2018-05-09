import * as React from "react";
import {Component} from "react";
import { graphql } from "react-apollo";

import { fetchApps } from "../queries/products";

class Marketplace extends Component {

  renderLoading(apps) {
    if (apps) {
      return (
        <div className="marketplace">
          {apps.map(appDetails => {
            return this.renderAppCard(appDetails)}
          )}
        </div>
      )
    }
    return (<div>LOADING</div>)
  }

  openAppDetails(id) {
    this.props.history.push(`/area/marketplace/${id}`)
  }

  renderAppCard(appDetails) {
    return(
      <div className="appThumbnail" key={appDetails.id} onClick={() => this.openAppDetails(appDetails.id)}>
        <div className="appThumbnailLogo"
            style={{backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${appDetails.logo})`}}>
        </div>
        <div className="caption">
          <h3>{appDetails.name}</h3>
          <div className="appdiscripton">
            <p>{appDetails.teaserdescription}</p>
          </div>
          <div className="app-short-info-holder">
          </div>
        </div>
      </div>
    )
  }

  render() {
    return(
      <div className="fullWorking">
        {this.renderLoading(this.props.products.allApps)}
      </div>
    )
  }
}

export default graphql(fetchApps, {
  name: "products"
})(Marketplace);
