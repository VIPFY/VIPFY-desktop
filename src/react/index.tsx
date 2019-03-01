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
import * as is from "electron-is";
import { remote } from "electron";

class Application extends React.Component {
  implementShortCuts = e => {
    const mainWindow = remote.getCurrentWindow();

    if (e.keyCode == 82) {
      mainWindow.reload();
    } else if (e.keyCode == 73) {
      if (mainWindow.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  };

  componentDidMount() {
    if (process.env.DEVELOPMENT) {
      window.addEventListener("keyup", this.implementShortCuts, true);
    }
    // inline styles to make them available to smartlook
    const style = document.createElement("style");
    fs.readFile(__dirname + "/../css/layout.css", "utf8", (err, contents) => {
      style.innerHTML = contents;
      document.head!.appendChild(style);
      // use setTimeout to allow some time for layouting
      window.setTimeout(() => this.forceUpdate(), 0);
    });

    if (is.macOS()) {
      document.body.classList.add("mac");
    }
  }

  componentWillUnmount() {
    if (process.env.DEVELOPMENT) {
      window.removeEventListener("keyup", this.implementShortCuts, true);
    }

    if (is.macOS()) {
      document.body.classList.remove("mac");
    }
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
