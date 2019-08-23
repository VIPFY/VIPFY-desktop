import * as React from "react";
import { withRouter } from "react-router";
import { graphql, Query, withApollo, compose } from "react-apollo";
import Store = require("electron-store");

import { SIGN_OUT, signInUser, REDEEM_SETUPTOKEN } from "./mutations/auth";
import { me } from "./queries/auth";
import { AppContext, refetchQueries } from "./common/functions";
import { filterError } from "./common/functions";

import Popup from "./components/Popup";
import LoadingDiv from "./components/LoadingDiv";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import PostLogin from "./pages/postlogin";
import gql from "graphql-tag";
import SignIn from "./pages/signin";
import { resetLoggingContext } from "../logger";
import TwoFactor from "./pages/TwoFactor";
import HeaderNotificationProvider from "./components/notifications/headerNotificationProvider";
import HeaderNotificationContext from "./components/notifications/headerNotificationContext";
const { session } = require("electron").remote;

interface AppProps {
  client: ApolloClient<InMemoryCache>;
  history: any;
  logoutFunction: Function;
  upgradeErrorHandlerSetter: Function;
  me: any;
  moveTo: Function;
  relogMeIn: Function;
  logMeIn: Function;
  logMeOut: Function;
  setName: Function;
  signIn: any;
  signUp: any;
  signOut: Function;
}

interface PopUp {
  show: boolean;
  header: string;
  body: any;
  props: any;
  type: string;
  info: string;
}

interface AppState {
  error: string;
  placeid: string;
  popup: PopUp;
  showTutorial: boolean;
  renderElements: { key: string; element: any }[];
  page: string;
  sidebarloaded: boolean;
  reshow: string | null;
  twofactor: string | null;
  unitid: string | null;
  cookie: boolean;
}

const INITIAL_POPUP = {
  show: false,
  header: "",
  body: () => <div>No content</div>,
  props: {},
  type: "",
  info: ""
};

const INITIAL_STATE = {
  error: "",
  placeid: "",
  popup: INITIAL_POPUP,
  showTutorial: true,
  renderElements: [],
  page: "dashboard",
  sidebarloaded: false,
  reshow: null,
  twofactor: null,
  unitid: null,
  cookie: false
};

const tutorial = gql`
  {
    tutorialSteps {
      id
      page
      steptext
      renderoptions
      nextstep
    }

    me {
      id
      tutorialprogress
      emails {
        email
      }
      firstname
      lastname
      profilepicture
    }
  }
`;

class App extends React.Component<AppProps, AppState> {
  state: AppState = INITIAL_STATE;

  references: { key; element }[] = [];

  componentDidMount() {
    this.props.logoutFunction(this.logMeOut);
    this.props.upgradeErrorHandlerSetter(() => this.props.history.push("/upgrade-error"));
    session.defaultSession.cookies.get({}, (error, cookies) => {
      if (error) {
        return;
      }

      Object.values(cookies).map((cookie: { name: string }) => {
        if (cookie.name == "vipfy-session") {
          this.setState({ cookie: true });
        }
      });
    });
    this.props.history.push("/area");
    //this.redeemSetupToken();
  }

  redeemSetupToken = async refetch => {
    try {
      const store = new Store();
      if (!store.has("setupkey")) {
        return;
      }
      const setuptoken = store.get("setupkey");
      const res = await this.props.client.mutate({
        mutation: REDEEM_SETUPTOKEN,
        variables: { setuptoken }
      });
      const { token } = res.data.redeemSetupToken;
      localStorage.setItem("token", token);
      store.delete("setupkey");
      refetch();
    } catch (err) {
      const store = new Store();
      store.delete("setupkey");
    }
  };

  setName = async () => {
    // legacy function, call refetchQueries directly instead
    await refetchQueries(this.props.client, ["me"]);
  };

  renderPopup = (data: PopUp) => {
    this.setState({ popup: { show: true, ...data } });
  };

  closePopup = () => this.setState({ popup: INITIAL_POPUP });

  logMeOut = async () => {
    const impersonated = await localStorage.getItem("impersonator-token");
    if (impersonated) {
      await localStorage.setItem("token", impersonated!);
      await localStorage.removeItem("impersonator-token");
    } else {
      await localStorage.removeItem("token");
    }

    // Destroy all Sessions
    try {
      await this.props.signOut();
    } catch (err) {
      console.error(err);
    }

    // This function also destroys the session
    await this.props.client.cache.reset(); // clear graphql cache
    await resetLoggingContext();
    await session.fromPartition("services").clearStorageData();
    await this.props.history.push("/");
    await this.setState(INITIAL_STATE); // clear state
    await location.reload();
  };

  logMeIn = async (email: string, password: string, refetch: Function) => {
    try {
      const res = await this.props.signIn({ variables: { email, password } });
      const { token, twofactor, unitid } = res.data.signIn;

      if (token && !twofactor) {
        localStorage.setItem("token", token);
        //this.forceUpdate();
        //this.props.client.query({ query: me, fetchPolicy: "network-only", errorPolicy: "ignore" });
        refetch();
      } else if (twofactor && unitid) {
        localStorage.setItem("twoFAToken", token);
        this.setState({ twofactor, unitid });
      } else {
        throw new Error("Something went wrong!");
      }
    } catch (err) {
      this.setState({ error: filterError(err) });
      localStorage.setItem("token", "");
      console.log("LoginError", err);

      return filterError(err);
    }
  };

  moveTo = (path: string) => {
    if (!(this.props.location.pathname === `/area/${path}`)) {
      this.setState({ page: path });
      this.props.history.push(`/area/${path}`);
    }
  };

  renderComponents = () => {
    if (this.state.cookie) {
      return (
        <Query query={me} fetchPolicy="network-only">
          {({ data, loading, error, refetch }) => {
            if (loading) {
              return <LoadingDiv text="Preparing Vipfy for you" />;
            }

            if (error || !data || !data.me) {
              this.props.client.cache.reset(); // clear graphql cache
              this.redeemSetupToken(refetch);

              return (
                <div className="centralize backgroundLogo">
                  <SignIn
                    login={(a, b) => this.logMeIn(a, b, refetch)}
                    moveTo={this.moveTo}
                    error={error && error.networkError ? "network" : filterError(error)}
                    resetError={() => this.setState({ error: "" })}
                  />
                </div>
              );
            }

            const impersonateToken = localStorage.getItem("impersonator-token");

            const store = new Store();
            let machineuserarray: {
              email: string;
              name: string;
              fullname: string;
              profilepicture: string;
            }[] = [];

            if (!impersonateToken) {
              if (store.has("accounts")) {
                machineuserarray = store.get("accounts");
                const i = machineuserarray.findIndex(u => u.email == data.me.emails[0].email);
                if (i != -1) {
                  machineuserarray.splice(i, 1);
                }
              }
              machineuserarray.push({
                email: data.me.emails[0].email,
                name: data.me.firstname,
                fullname: `${data.me.firstname} ${data.me.lastname}`,
                profilepicture: data.me.profilepicture
              });
              store.set("accounts", machineuserarray);
            }

            return (
              <HeaderNotificationContext.Consumer>
                {context => {
                  return (
                    <PostLogin
                      sidebarloaded={this.sidebarloaded}
                      setName={this.setName}
                      logMeOut={this.logMeOut}
                      showPopup={data => this.renderPopup(data)}
                      moveTo={this.moveTo}
                      {...data.me}
                      employees={data.me.company.employees}
                      profilepicture={data.me.profilepicture}
                      context={context}
                    />
                  );
                }}
              </HeaderNotificationContext.Consumer>
            );
          }}
        </Query>
      );
    } else if (this.state.twofactor) {
      return (
        <TwoFactor
          moveTo={this.moveTo}
          twoFactor={this.state.twofactor}
          unitid={this.state.unitid}
        />
      );
    } else {
      this.redeemSetupToken(() => this.forceUpdate());

      return (
        <div className="centralize backgroundLogo">
          <SignIn
            resetError={() => this.setState({ error: "" })}
            login={(a, b) => this.logMeIn(a, b, () => this.forceUpdate())}
            moveTo={this.moveTo}
            error={this.state.error}
          />
        </div>
      );
    }
  };

  sidebarloaded = () => this.setState({ sidebarloaded: true });

  setrenderElements = references => this.setState({ renderElements: references });

  setreshowTutorial = section => {
    switch (section) {
      case "dashboard":
        this.moveTo("dashboard");
        break;
      case "profile":
        this.moveTo("profile");
        break;

      default:
    }
    this.setState({ reshow: section });
  };

  addRenderElement = reference => {
    let index = this.references.findIndex(e => e.key == reference.key);
    if (index !== -1) {
      this.references.splice(index, 1);
    }

    if (!this.references.find(e => e.key === reference.key)) {
      this.references.push(reference);
    }
  };

  render() {
    const { placeid, popup, page, sidebarloaded } = this.state;

    return (
      <AppContext.Provider
        value={{
          showPopup: (data: PopUp) => this.renderPopup(data),
          placeid,
          renderTutorial: e => this.renderTutorial(e),
          setrenderElements: e => this.setrenderElements(e),
          addRenderElement: e => this.addRenderElement(e),
          setreshowTutorial: this.setreshowTutorial
        }}
        className="full-size">
        <HeaderNotificationProvider>
          {this.renderComponents()}
          {/*sidebarloaded &&
          localStorage.getItem("token") &&
          
            <Query query={tutorial}>
            {({ data, loading, error }) => {
              if (error) {
                return null;
              }

              if (loading) {
                return null;
              }

              return (
                <Tutorial
                  tutorialdata={data}
                  renderElements={this.references}
                  page={page}
                  reshow={this.state.reshow}
                  setreshowTutorial={this.setreshowTutorial}
                />
              );
            }}
          </Query>
          }*/}
          {popup.show && (
            <Popup
              popupHeader={popup.header}
              popupBody={popup.body}
              bodyProps={popup.props}
              onClose={this.closePopup}
              type={popup.type}
              info={popup.info}
            />
          )}
        </HeaderNotificationProvider>
      </AppContext.Provider>
    );
  }
}

export default compose(
  graphql(signInUser, { name: "signIn" }),
  graphql(SIGN_OUT, { name: "signOut" })
)(withApollo(withRouter(App)));
