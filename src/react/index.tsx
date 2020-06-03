//require("dotenv").config();

import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { ipcRenderer } from "electron";

declare module "*.scss" {
  const content: any;
  export default content;
}

import App from "./app";
import client, {
  setLogoutFunction,
  setUpgradeErrorHandler,
  setShowPlanFunction
} from "./networkInterface";
import OuterErrorBoundary from "./error";
import * as is from "electron-is";
import UpgradeError from "./upgradeerror";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { remote } from "electron";
const { session } = remote;
import { version } from "../../package.json";
import UniversalLoginTestFetcher from "./components/admin/UniversalLoginTest/UniversalLoginTestFetcher";
import UniversalLoginTest from "./components/admin/UniversalLoginTest/UniversalLoginTest";

interface IndexProps {
  client: ApolloClient<InMemoryCache>;
}

class Application extends React.Component<IndexProps> {
  implementShortCuts = async e => {
    const mainWindow = remote.getCurrentWindow();

    if (e.keyCode == 82 && e.ctrlKey) {
      mainWindow.reload();
    } else if (e.keyCode == 73 && e.ctrlKey && e.shiftKey) {
      if (mainWindow.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    } else if (e.keyCode == 74 && e.ctrlKey && e.shiftKey) {
      if ((await ipcRenderer.invoke("getDevToolsContentId")) == null) {
        ipcRenderer.invoke("openDevTools");
      } else {
        ipcRenderer.invoke("closeDevTools");
      }
    }
  };

  componentDidMount() {
    if (process.env.DEVELOPMENT) {
      window.addEventListener("keyup", this.implementShortCuts, true);
    }

    // inline styles to make them available to smartlook
    const style = document.createElement("style");

    if (is.macOS()) {
      document.body.classList.add("mac");
    }

    document.getElementById("versionnumber")!.innerText = version;
  }

  componentWillUnmount() {
    if (process.env.DEVELOPMENT) {
      window.removeEventListener("keyup", this.implementShortCuts, true);
    }

    if (is.macOS()) {
      document.body.classList.remove("mac");
    }

    this.props.client.cache.reset(); // clear graphql cache
    localStorage.removeItem("token");
    session.fromPartition("services").clearStorageData();
  }

  render = () => {
    return (
      <ApolloProvider client={client}>
        <OuterErrorBoundary>
          <Router>
            <Switch>
              <Route exact path="/upgrade-error" component={UpgradeError} />
              {process.env.REACT_APP_TESTING && (
                <Route
                  exact
                  path="/universal-login-test"
                  component={
                    process.env.REACT_APP_TEST_SSO_WITH_OPTIONS
                      ? UniversalLoginTestFetcher
                      : UniversalLoginTest
                  }
                />
              )}
              <Route
                path="/"
                render={props => (
                  <App
                    {...props}
                    showPlanFunction={setShowPlanFunction}
                    logoutFunction={setLogoutFunction}
                    upgradeErrorHandlerSetter={setUpgradeErrorHandler}
                  />
                )}
              />
            </Switch>
          </Router>
        </OuterErrorBoundary>
      </ApolloProvider>
    );
  };
}

ReactDOM.render(<Application />, document.getElementById("App"));
