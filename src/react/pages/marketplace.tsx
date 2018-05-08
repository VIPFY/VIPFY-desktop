import * as React from "react";
import {Component} from "react";

import { Link } from "react-router-dom";

class Marketplace extends Component {

  render() {
    console.log("Marketplace", this)

    if (this.props.match.params.appname) {
        //SHOW APP DETAILS
        return (<div>{this.props.match.params.appname} <Link to="../marketplace">LINK zum Marketplace</Link></div>)
    } else {
        //Show Marketplaceoverview
        return (<div> Marketplace <Link to="marketplace/pipedrive">LINK zu Pipedrive</Link></div>)
    }
  }
}

export default Marketplace;
