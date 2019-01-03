import * as React from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import { graphql, compose, Query, withApollo } from "react-apollo";

import Advisor from "./advisor";
import AppPage from "./apppage";
import Billing from "./billing";
import Chat from "./chat";
import Dashboard from "./dashboard";
import Domains from "./domains";
import Marketplace from "./marketplace";
import MessageCenter from "./messagecenter";
import Navigation from "./navigation";
import Profile from "./profile";
import Settings from "./settings";
import Sidebar from "../components/Sidebar";
import Team from "./team";
import Webview from "./webview";
import ErrorPage from "./error";

import { fetchLicences, me } from "../queries/auth";
import { fetchRecommendedApps } from "../queries/products";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import SupportPage from "./support";
import Security from "./security";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import Integrations from "./integrations";
import AppAdmin from "./appadmin";
import ViewHandler from "./viewhandler";

interface AreaProps {
  history: any[];
  fetchLicences: any;
  login: boolean;
  logMeOut: () => void;
  location: any;
  userData: any;
  userid: number;
  client: ApolloClient<InMemoryCache>;
  moveTo: Function;
}

interface AreaState {
  app: number;
  licenceID: number;
  viewID: number;
  chatOpen: boolean;
  sideBarOpen: boolean;
  domain: string;
  script: Element | null;
  script3: Element | null;
  webviews: any[];
  openInstancens: any;
}

class Area extends React.Component<AreaProps, AreaState> {
  state: AreaState = {
    app: -1, //Very Old style - should be removed sometime
    licenceID: -1, //Old style - should be removed sometime
    viewID: -1,
    chatOpen: false,
    sideBarOpen: true,
    domain: "",
    script: null,
    script3: null,
    webviews: [],
    openInstancens: {}
  };

  componentDidMount = async () => {
    require("electron").ipcRenderer.on("change-page", (event, page) => {
      this.props.history.push(page);
    });

    const meme = await this.props.client.query({ query: me });
    console.log(meme);

    const script = document.createElement("script");

    script.src =
      "https://static.zdassets.com/ekr/snippet.js?key=dae43c43-7726-40fb-be8a-7468a19337e0";
    script.id = "ze-snippet";
    script.async = false;
    script.onload = () => {
      const script3 = document.createElement("script");

      const datascript = JSON.stringify({
        name: `${meme.data.me.firstname} ${meme.data.me.lastname}`,
        email: `${meme.data.me.emails[0].email}`,
        organization: `${meme.data.me.company.name}`
      });
      console.log(datascript);
      script3.innerHTML = `zE(function() {zE.identify(${datascript});});`;
      script3.id = "ze-snippet3";
      script3.async = false;

      document.head.appendChild(script3);

      this.setState({ script3 });
    };
    console.log("DIDMOUNT - setSTATE", this.state.script);
    this.setState({ script });
    console.log("DIDMOUNT - setSTATE2", this.state.script);
    document.head.appendChild(script);

    //this.addWebview(1171);
    //this.addWebview(1001);
    //this.addWebview(1001);
    //this.addWebview(1001);
  };

  componentWillUnmount() {
    console.log("AREA UNMOUNT");
    /*if (this.state.script) {
      console.log(this.state.script);
      document.head.removeChild(this.state.script);
    }*/
  }

  moveTo = path => {
    /*if (!(this.props.location.pathname === path)) {
      this.props.history.push(path);
    }*/
    this.props.moveTo(path);
  };

  setApp = (boughtplan: number) => {
    if (this.state.openInstancens[boughtplan]) {
      this.setState(prevState => {
        const newstate = {
          ...prevState,
          app: boughtplan,
          licenceID: boughtplan,
          viewID: Object.keys(prevState.openInstancens[boughtplan])[0]
        };
        return newstate;
      });
      this.props.history.push(`/area/app/${boughtplan}`);
    } else {
      this.addWebview(boughtplan, true);
      this.props.history.push(`/area/app/${boughtplan}`);
    }
  };

  setDomain = (boughtplan: number, domain: string) => {
    console.log("SET DOMAIN");
    this.setState({ app: boughtplan, licenceID: boughtplan, domain });
    this.props.history.push(`/area/app/${boughtplan}`);
  };

  componentDidCatch(error, info) {
    console.log("ERROR", error, info);
    this.moveTo("/area/error");
  }

  setSidebar = value => {
    this.setState({ sideBarOpen: value });
  };

  toggleChat = () => {
    console.log("CHAT");
    this.setState(prevState => ({ chatOpen: !prevState.chatOpen }));
  };

  toggleSidebar = () => {
    this.setState(prevState => ({ sideBarOpen: !prevState.sideBarOpen }));
  };

  addWebview = (licenceID, opendirect = false) => {
    const webviews = this.state.webviews;
    const l = { licenceID: licenceID, plain: true, setViewTitle: this.setViewTitle };
    const newview = <Webview {...this.state} {...this.props} {...l} />;
    this.setState(prevState => {
      const viewID = Math.max(...prevState.webviews.map(o => o.key), 0) + 1;
      const l = { licenceID: licenceID, plain: true, setViewTitle: this.setViewTitle, viewID };
      const newview = <Webview {...this.state} {...this.props} {...l} />;
      return {
        webviews: [
          ...prevState.webviews,
          {
            key: viewID,
            view: newview,
            licenceID
          }
        ],
        openInstancens: {
          ...prevState.openInstancens,
          [licenceID]:
            prevState.openInstancens && prevState.openInstancens[licenceID]
              ? {
                  ...prevState.openInstancens[licenceID],

                  [viewID]: { instanceTitle: "Home", instanceId: viewID }
                }
              : {
                  [viewID]: { instanceTitle: "Home", instanceId: viewID }
                }
        },
        app: opendirect ? licenceID : prevState.app,
        licenceID: opendirect ? licenceID : prevState.licenceID,
        viewID: opendirect ? viewID : prevState.viewID
      };
    });
  };

  setViewTitle = (title, viewID, licenceID) => {
    this.setState(prevState => ({
      openInstancens: {
        ...prevState.openInstancens,
        [licenceID]:
          prevState.openInstancens &&
          prevState.openInstancens[licenceID] &&
          prevState.openInstancens[licenceID][viewID]
            ? {
                ...prevState.openInstancens[licenceID],
                [viewID]: {
                  instanceTitle: title,
                  instanceId: viewID
                }
              }
            : { ...prevState.openInstancens[licenceID] }
      }
    }));
  };

  setInstance = viewID => {
    const licenceID = this.state.webviews.find(e => e.key == viewID).licenceID;
    this.setState({ app: licenceID, licenceID, viewID });
    this.props.history.push(`/area/app/${licenceID}`);
  };

  render() {
    console.log("APPPROPS", this.props);
    const { sideBarOpen, chatOpen } = this.state;
    const routes = [
      { path: "", component: Dashboard },
      { path: "dashboard", component: Dashboard },
      { path: "dashboard/:overlay", component: Dashboard },
      { path: "settings", component: Settings },
      { path: "profile", component: Profile },
      { path: "team", component: Team },
      { path: "security", component: Security },
      { path: "messagecenter", component: MessageCenter },
      { path: "messagecenter/:person", component: MessageCenter },
      { path: "billing", component: Billing },
      { path: "advisor", component: Advisor },
      { path: "advisor/:typeid", component: Advisor },
      { path: "marketplace", component: Marketplace },
      { path: "marketplace/:appid/", component: AppPage },
      { path: "marketplace/:appid/:action", component: AppPage },
      { path: "integrations", component: Integrations },
      //{ path: "support", component: SupportPage },
      { path: "error", component: ErrorPage },
      { path: "appadmin", component: AppAdmin }
    ];

    return (
      <div className="area">
        <Route
          render={props => {
            if (!this.props.location.pathname.includes("advisor")) {
              return (
                <Sidebar
                  sideBarOpen={sideBarOpen}
                  setApp={this.setApp}
                  viewID={this.state.viewID}
                  openInstancens={this.state.openInstancens}
                  toggleSidebar={this.toggleSidebar}
                  setInstance={this.setInstance}
                  {...this.props}
                  {...props}
                />
              );
            } else {
              return "";
            }
          }}
        />

        <Route
          render={props => {
            if (!this.props.location.pathname.includes("advisor")) {
              return (
                <Query query={FETCH_NOTIFICATIONS} pollInterval={600000}>
                  {res => (
                    <Navigation
                      chatOpen={chatOpen}
                      sideBarOpen={sideBarOpen}
                      setApp={this.setApp}
                      toggleChat={this.toggleChat}
                      toggleSidebar={this.toggleSidebar}
                      {...this.props}
                      {...props}
                      {...res}
                    />
                  )}
                </Query>
              );
            } else {
              return "";
            }
          }}
        />
        {/*<Route render={props => <Chat chatOpen={chatOpen} {...this.props} {...props} />} />*/}

        {/*<Route
          exact
          path="/area/app/:licenceid"
          render={props => {
            console.log("RERENDER WEBVIEW", this.state, this.props, props);
            return <Webview {...this.state} {...this.props} {...props} />;
          }}
        />*/}

        <Route
          exact
          path="/area/support"
          render={props => <SupportPage {...this.state} {...this.props} {...props} />}
        />

        {routes.map(({ path, component }) => {
          const RouteComponent = component;

          return (
            <Route
              key={path}
              exact
              path={`/area/${path}`}
              render={props => (
                <div
                  className={`${
                    !this.props.location.pathname.includes("advisor") ? "full-working" : ""
                  } ${chatOpen ? "chat-open" : ""} ${
                    sideBarOpen && !props.location.pathname.includes("advisor")
                      ? "side-bar-open"
                      : ""
                  }`}>
                  <RouteComponent
                    setApp={this.setApp}
                    {...this.props}
                    {...props}
                    moveTo={this.moveTo}
                  />
                </div>
              )}
            />
          );
        })}

        <Route
          exact
          path="/area/domains/"
          render={props => (
            <div
              className={`full-working ${chatOpen ? "chat-open" : ""} ${
                sideBarOpen ? "side-bar-open" : ""
              }`}>
              <Domains setDomain={this.setDomain} {...this.props} {...props} />
            </div>
          )}
        />

        <Route
          exact
          path="/area/domains/:domain"
          render={props => (
            <div
              className={`full-working ${chatOpen ? "chat-open" : ""} ${
                sideBarOpen ? "side-bar-open" : ""
              }`}>
              <Domains setDomain={this.setDomain} {...this.props} {...props} />
            </div>
          )}
        />
        <ViewHandler
          showView={this.state.viewID}
          views={this.state.webviews}
          sideBarOpen={sideBarOpen}
        />
      </div>
    );
  }
}

export default compose(
  graphql(fetchLicences, {
    name: "licences"
  }) /*
  graphql(fetchRecommendedApps, {
    name: "rcApps"
  }),*/,
  withApollo
)(withRouter(Area));
