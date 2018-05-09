import * as React from "react";
import {Component} from "react";
import { graphql, compose } from "react-apollo";

import { fetchAppById, fetchReviews } from "../queries/products";

class AppPage extends Component {

  render() {
    console.log("AppPage", this)
    if (this.props.product.fetchAppById) {
      let appDetails = this.props.product.fetchAppById
      return (
        <div className="fullWorking paddingPage">
          <div className="appLogoLarge"
          style={{backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${appDetails.logo})`}}></div>
        </div>
      );
    }
    return (<div>Loading</div>)
  }
}

export default  compose(
  graphql(fetchAppById, {
    options: props => ({ variables: { id: props.match.params.appid } }),
    name: "product"
  }),
  graphql(fetchReviews, {
    options: props => ({ variables: { appid: props.match.params.appid } }),
    name: "productReview"
  })
)(AppPage);
