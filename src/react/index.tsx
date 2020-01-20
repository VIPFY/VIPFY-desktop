//require("dotenv").config();

import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloProvider } from "react-apollo";

declare module "*.scss" {
  const content: any;
  export default content;
}

import App from "./app";
import client, { setLogoutFunction, setUpgradeErrorHandler } from "./networkInterface";
import PasswordReset from "./components/signin/PasswordReset";
import OuterErrorBoundary from "./error";
import * as is from "electron-is";
import UpgradeError from "./upgradeerror";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { remote } from "electron";
const { session } = remote;
import { version } from "../../package.json";

interface IndexProps {
  client: ApolloClient<InMemoryCache>;
}

class Application extends React.Component<IndexProps> {
  implementShortCuts = e => {
    const mainWindow = remote.getCurrentWindow();

    if (e.keyCode == 82 && e.ctrlKey) {
      mainWindow.reload();
    } else if (e.keyCode == 73 && e.ctrlKey && e.shiftKey) {
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
    // fs.readFile(__dirname + "/../css/layout.css", "utf8", (err, contents) => {
    //   console.log("LOG: Application -> componentDidMount -> err", err);
    //   style.innerHTML = contents;
    //   document.head!.appendChild(style);
    //   // use setTimeout to allow some time for layouting
    //   window.setTimeout(() => this.forceUpdate(), 0);
    // });

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
              <Route exact path="/passwordreset" component={PasswordReset} />
              <Route exact path="/upgrade-error" component={UpgradeError} />
              <Route
                path="/"
                render={props => (
                  <App
                    {...props}
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

//install context menu
// window.addEventListener("DOMContentLoaded", () => {
//   //webview
//   require("electron-context-menu")({
//     showInspectElement: false,
//     showCopyImageAddress: true,
//     showSaveImageAs: true,
//     window: document.getElementById("webview")
//   });
//   //normal windows
//   require("electron-context-menu")({
//     showInspectElement: config.allowDevTools
//   });

//   document!.getElementById("versionnumber")!.innerHTML += pjson.version;
// });

ReactDOM.render(<Application />, document.getElementById("App"));
