require("dotenv").config();

import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import fs = require("fs");

declare module "*.scss" {
  const content: any;
  export default content;
}

import App from "./app";
import client, { setLogoutFunction } from "./networkInterface";
import PasswordReset from "./components/signin/PasswordReset";
import OuterErrorBoundary from "./error";

class Application extends React.Component {
  componentDidMount() {
    // inline styles to make them available to smartlook
    const style = document.createElement("style");
    fs.readFile(__dirname + "/../css/layout.css", "utf8", function(err, contents) {
      //console.log(err);
      //console.log(contents);
      document.head!.appendChild(style);
      style.innerHTML = contents;
    });
  }

  render = () => {
    return (
      <ApolloProvider client={client}>
        <OuterErrorBoundary>
          <Router>
            <Switch>
              <Route exact path="/passwordreset" component={PasswordReset} />
              <Route
                path="/"
                render={props => <App {...props} logoutFunction={setLogoutFunction} />}
              />
            </Switch>
          </Router>
        </OuterErrorBoundary>
      </ApolloProvider>
    );
  };
}

ReactDOM.render(<Application />, document.getElementById("App"));
