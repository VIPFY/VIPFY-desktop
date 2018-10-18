require("dotenv").config();

import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloProvider } from "react-apollo";

import App from "./app";
import client, { setLogoutFunction } from "./networkInterface";
import PasswordReset from "./components/signin/PasswordReset";

const Application = () => (
  <ApolloProvider client={client}>
    <Router>
      <Switch>
        <Route exact path="/passwordreset" component={PasswordReset} />
        <Route path="/" render={props => <App {...props} logoutFunction={setLogoutFunction} />} />
      </Switch>
    </Router>
  </ApolloProvider>
);

ReactDOM.render(<Application />, document.getElementById("App"));
