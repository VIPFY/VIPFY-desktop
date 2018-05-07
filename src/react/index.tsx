require("dotenv").config();

import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter as Router } from "react-router-dom";
import { ApolloProvider } from "react-apollo";

import App from "./app";
import client from "./networkInterface";

const Application = () => (
  <ApolloProvider client={client}>
    <Router>
      <App />
    </Router>
  </ApolloProvider>
);

ReactDOM.render(<Application />, document.getElementById("App"));