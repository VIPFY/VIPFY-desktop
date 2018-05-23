import * as React from "react";
import { Component } from "react";
import { Route } from "react-router-dom";
import { graphql, compose } from "react-apollo";
import { me, fetchLicences } from "../queries/auth";
import { fetchRecommendedApps } from "../queries/products";

import Dashboard from "./dashboard";
import Navigation from "./navigation";
import Webview from "./webview";
import Settings from "./settings";
import Marketplace from "./marketplace";
import AppPage from "./apppage";
import Billing from "./billing";
import Advisor from "./advisor";

export type AreaProps = {
  history: any[];
  me: any;
  fetchLicences: any;
};

export type AreaState = {
  app: string;
};

class Area extends Component<AreaProps, AreaState> {
  state: AreaState = {
    app: "vipfy"
  };

  setapp = appname => {
    console.log(appname);
    this.setState({ app: appname });
    this.props.history.push("/area/webview");
  };

  loggedIn = async () => {
    try {
      const res = await this.props.me.refetch();
      if (res) {
        return true;
      }
    } catch (err) {
      console.log("ErrorLI", err);
      this.props.history.push("/");
      return false;
    }
    this.props.history.push("/");
    return false;
  };

  render() {
    if (this.loggedIn()) {
      console.log("AREA", this.props);
      return (
        <div className="area">
          <Route
            render={props => (
              <Navigation setapp={this.setapp} {...this.props} {...props} />
            )}
          />
          <Route
            exact
            path="/area/dashboard"
            render={props => (
              <Dashboard {...props} setapp={this.setapp} {...this.props} />
            )}
          />
          <Route
            exact
            path="/area/webview"
            render={props => <Webview app={this.state.app} {...props} />}
          />
          <Route
            exact
            path="/area/settings"
            render={props => <Settings {...props} {...this.props} />}
          />
          <Route
            exact
            path="/area/billing"
            render={props => <Billing {...props} {...this.props} />}
          />
          <Route
            exact
            path="/area/advisor"
            render={props => <Advisor {...props} {...this.props} />}
          />
          <Route
            exact
            path="/area/marketplace"
            render={props => <Marketplace {...props} {...this.props} />}
          />
          <Route
            path="/area/marketplace/:appid"
            render={props => (
              <AppPage
                setapp={this.setapp}
                match={this.match}
                {...this.props}
                {...props}
              />
            )}
          />
        </div>
      );
    } else {
      console.log("AREA FALSE");
      return "";
    }
  }
}

export default compose(
  graphql(me, {
    name: "me",
    options: { fetchPolicy: "network-only" }
  }),
  graphql(fetchLicences, {
    name: "licences"
  }),
  graphql(fetchRecommendedApps, {
    name: "rcApps"
  })
)(Area);
