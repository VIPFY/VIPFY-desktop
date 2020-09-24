import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import * as is from "electron-is";
import { ipcRenderer, remote } from "electron";
const { session } = remote;

declare module "*.scss" {
  const content: any;
  export default content;
}

import client, {
  setLogoutFunction,
  setUpgradeErrorHandler,
  setShowPlanFunction
} from "./networkInterface";

import App from "./app";
import { ErrorBoundary } from "./ErrorBoundary";
import { UpgradeErrorPage } from "./UpgradeErrorPage";
import { version } from "../../package.json";
import UniversalLoginTestFetcher from "./components/admin/UniversalLoginTest/UniversalLoginTestFetcher";
import UniversalLoginTest from "./components/admin/UniversalLoginTest/UniversalLoginTest";
import config from "../configurationManager";
import { ApolloClientType } from "./interfaces";

interface IndexProps {
  client: ApolloClientType;
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
    if (config.allowDevTools) {
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
        <ErrorBoundary>
          <Router>
            <Switch>
              <Route exact path="/upgrade-error" component={UpgradeErrorPage} />
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
        </ErrorBoundary>
      </ApolloProvider>
    );
  };
}

ReactDOM.render(<Application />, document.getElementById("App"));
