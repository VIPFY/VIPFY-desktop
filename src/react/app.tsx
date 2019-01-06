import * as React from "react";
import { withRouter } from "react-router";
import { graphql, Query, withApollo } from "react-apollo";
import Store = require("electron-store");

import { signInUser, REDEEM_SETUPTOKEN } from "./mutations/auth";
import { me } from "./queries/auth";
import { AppContext, refetchQueries } from "./common/functions";
import { filterError } from "./common/functions";

import Popup from "./components/Popup";
import LoadingDiv from "./components/LoadingDiv";
import Login from "./pages/login";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import PostLogin from "./pages/postlogin";
import gql from "graphql-tag";
import Tutorial from "./tutorials/basicTutorial";

interface AppProps {
  client: ApolloClient<InMemoryCache>;
  history: any;
  logoutFunction: Function;
  me: any;
  moveTo: Function;
  relogMeIn: Function;
  logMeIn: Function;
  logMeOut: Function;
  setName: Function;
  signIn: any;
  signUp: any;
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
  login: boolean;
  error: string;
  firstLogin: boolean;
  placeid: string;
  popup: PopUp;
  showTutorial: boolean;
  renderElements: { key: string; element: any }[];
  page: string;
  sidebarloaded: boolean;
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
  login: false,
  error: "",
  firstLogin: false,
  placeid: "",
  popup: INITIAL_POPUP,
  showTutorial: false,
  renderElements: [],
  page: "dashboard",
  sidebarloaded: false
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
    }
  }
`;

class App extends React.Component<AppProps, AppState> {
  state: AppState = INITIAL_STATE;

  references: { key; element }[] = [];

  componentDidMount() {
    this.props.logoutFunction(this.logMeOut);
    this.props.history.push("/area");
    this.redeemSetupToken();
  }

  redeemSetupToken = async () => {
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
      const { ok, token } = res.data.redeemSetupToken;
      localStorage.setItem("token", token);
      this.setState({ login: true });
      store.delete("setuptoken");
    } catch (err) {
      console.log("setup token error", err);
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

  logMeOut = () => {
    this.setState(INITIAL_STATE); // clear state
    this.props.client.cache.reset(); // clear graphql cache
    localStorage.removeItem("token");
    this.props.history.push("/");
    location.reload();
  };

  logMeIn = async (email: string, password: string) => {
    try {
      const res = await this.props.signIn({ variables: { email, password } });
      const { ok, token } = res.data.signIn;

      if (ok) {
        localStorage.setItem("token", token);
        await this.setState({ login: true });

        return true;
      }
    } catch (err) {
      this.setState({ login: false, error: filterError(err) });
      localStorage.setItem("token", "");
      console.log("LoginError", err);

      return filterError(err);
    }
  };

  moveTo = (path: string) => {
    console.log("moveTO", path);
    this.setState({ page: path });
    this.props.history.push(`/area/${path}`);
  };

  welcomeNewUser = (placeid: string) => {
    console.log("NEW USER");
    this.setState({ firstLogin: true, placeid, showTutorial: true });
  };

  renderComponents = () => {
    if (localStorage.getItem("token")) {
      return (
        <Query query={me} fetchPolicy="network-only">
          {({ data, loading, error }) => {
            if (loading) {
              console.log("LOADING");
              return <LoadingDiv text="Preparing Vipfy for you" />;
            }

            if (error) {
              console.log("ERROR", error);
              this.props.client.cache.reset(); //clear graphql cache

              return (
                <Login
                  login={this.logMeIn}
                  moveTo={this.moveTo}
                  register={this.registerMe}
                  error={filterError(error)}
                />
              );
            }

            return (
              <PostLogin
                sidebarloaded={this.sidebarloaded}
                setName={this.setName}
                logMeOut={this.logMeOut}
                showPopup={data => this.renderPopup(data)}
                moveTo={this.moveTo}
                {...data.me}
                employees={data.me.company.employees}
                profilepicture={data.me.profilepicture || data.me.company.profilepicture}
              />
            );
          }}
        </Query>
      );
    } else {
      return (
        <Login
          afterRegistration={this.welcomeNewUser}
          login={this.logMeIn}
          moveTo={this.moveTo}
          error={this.state.error}
        />
      );
    }
  };

  showTutorial = showTutorial => {
    this.setState({ showTutorial });
  };

  sidebarloaded = () => {
    this.setState({ sidebarloaded: true });
  };

  setrenderElements = references => {
    this.setState({ renderElements: references });
  };

  addRenderElement = reference => {
    if (!this.references.find(e => e.key === reference.key)) {
      this.references.push(reference);
    }
  };

  render() {
    const { placeid, firstLogin, popup, showTutorial, page, sidebarloaded } = this.state;

    return (
      <Query query={tutorial}>
        {({ data, loading, error }) => {
          if (error) {
            console.log("TutError", error);
          }
          console.log("TUTORIAL", data, "Props", this.props);
          return (
            <AppContext.Provider
              value={{
                showPopup: (data: PopUp) => this.renderPopup(data),
                firstLogin,
                placeid,
                disableWelcome: () => this.setState({ firstLogin: false }),
                renderTutorial: e => this.renderTutorial(e),
                setrenderElements: e => this.setrenderElements(e),
                data,
                addRenderElement: e => this.addRenderElement(e)
              }}
              className="full-size">
              {this.renderComponents()}
              {console.log("REFERENCES", this.references, showTutorial)}
              {showTutorial && sidebarloaded ? (
                <Tutorial
                  tutorialdata={data}
                  renderElements={this.references}
                  showTutorial={this.showTutorial}
                  page={page}
                />
              ) : (
                ""
              )}
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
            </AppContext.Provider>
          );
        }}
      </Query>
    );
  }
}

export default graphql(signInUser, {
  name: "signIn"
})(withApollo(withRouter(App)));
