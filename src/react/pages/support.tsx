import * as React from "react";
import FreshdeskWidget from "@personare/react-freshdesk-widget";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { me } from "../queries/auth";
import LoadingDiv from "../components/LoadingDiv";
import WebView = require("react-electron-web-view");

interface Props {}
const fetchSupportToken = gql`
  query {
    fetchSupportToken
  }
`;
class SupportPage extends React.Component<Props> {
  render() {
    console.log("SUPP", this.props);

    let cssClass = "marginLeft";
    if (this.props.chatOpen) {
      cssClass += " chat-open";
    }
    if (this.props.sidebarOpen) {
      cssClass += " sidebar-open";
    }
    let cssClassWeb = "newMainPosition";
    if (this.props.chatOpen) {
      cssClass += " chat-open";
    }
    if (this.props.sidebarOpen) {
      cssClass += " sidebar-open";
    }
    return (
      <div className={cssClass}>
        <Query query={fetchSupportToken} fetchPolicy="network-only">
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
            console.log(data);
            //const requester = data.me.emails[0].email;
            //return <FreshdeskWidget url="https://vipfy.freshdesk.com" autofill={{ requester }} disable={["requester"]}/>;
            console.log(data.fetchSupportToken);
            return (
              <WebView
                id="support"
                preload="./preload-launcher.js"
                webpreferences="webSecurity=no"
                className={cssClassWeb}
                src={`https://vipfy.zendesk.com/access/jwt?jwt=${
                  data.fetchSupportToken
                }&return_to=https://vipfy.zendesk.com`}
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
  }
}

export default SupportPage;
