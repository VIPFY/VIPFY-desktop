import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import LoadingDiv from "../components/LoadingDiv";
import WebView = require("react-electron-web-view");

interface Props {
  chatOpen: boolean;
  sidebarOpen: boolean;
  fromErrorPage?: boolean;
}

const FETCH_SUPPORT_TOKEN = gql`
  query {
    fetchSupportToken
  }
`;

export default (props: Props) => {
  let cssClass = "marginLeft";
  if (props.chatOpen) {
    cssClass += " chat-open";
  }
  if (props.sidebarOpen) {
    cssClass += " sidebar-open";
  }

  return (
    <div className={cssClass} style={{ position: "relative" }}>
      <Query query={FETCH_SUPPORT_TOKEN} fetchPolicy="network-only">
        {({ loading, error, data }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error) {
            return (
              <div>
                There was an internal error, please go to our external support support page //TODO
              </div>
            );
          }

          return (
            <WebView
              id="support"
              preload="./preload-launcher.js"
              webpreferences="webSecurity=no"
              className="newMainPositionFull"
              src={`https://vipfy.zendesk.com/access/jwt?jwt=${
                data.fetchSupportToken
              }&return_to=https://vipfy.zendesk.com${
                props.fromErrorPage ? "/hc/en-us/requests/new" : ""
              }`}
              partition="services"
              onLoadCommit={e => console.log("LoadCommit", e)}
              onNewWindow={e => console.log("NewWindow", e)}
              onWillNavigate={e => console.log("WillNavigate", e)}
              onDidStartLoading={e => console.log("DidStartLoading", e)}
              onDidStartNavigation={e => console.log("DidStartNavigation", e)}
              onDidFinishLoad={e => console.log("DidFinishLoad", e)}
              onDidStopLoading={e => console.log("DidStopLoading", e)}
              onDomReady={e => {
                console.log("DomReady", e);
                //this.maybeHideLoadingScreen();
                if (!e.target.isDevToolsOpened()) {
                  //e.target.openDevTools();
                }
              }}
              onDialog={e => console.log("Dialog", e)}
              onIpcMessage={e =>
                e.target.send("loginData", {
                  token: data.fetchSupportToken
                })
              }
            />
          );
        }}
      </Query>
    </div>
  );
};
