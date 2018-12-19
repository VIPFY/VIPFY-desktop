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
  popup: INITIAL_POPUP
};

const tutorial = gql`
  {
    tutorialSteps {
      id
      page
      steptext
      highlightelement
    }
  }
`;

class App extends React.Component<AppProps, AppState> {
  state: AppState = INITIAL_STATE;

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

  moveTo = (path: string) => this.props.history.push(`/area/${path}`);

  welcomeNewUser = (placeid: string) => {
    this.setState({ firstLogin: true, placeid });
  };

  renderComponents = () => {
    if (localStorage.getItem("token")) {
      return (
        <Query query={me} fetchPolicy="network-only">
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Preparing Vipfy for you" />;
            }

            if (error) {
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

  render() {
    const { placeid, firstLogin, popup } = this.state;

    return (
      <Query query={tutorial}>
        {({ data, loading, error }) => {
          if (error) {
            console.log("TutError", error);
          }
          console.log("TUTORIAL", data);
          return (
            <AppContext.Provider
              value={{
                showPopup: (data: PopUp) => this.renderPopup(data),
                firstLogin,
                placeid,
                disableWelcome: () => this.setState({ firstLogin: false }),
                data
              }}
              className="full-size">
              {this.renderComponents()}
              {popup.show ? (
                <Popup
                  popupHeader={popup.header}
                  popupBody={popup.body}
                  bodyProps={popup.props}
                  onClose={this.closePopup}
                  type={popup.type}
                  info={popup.info}
                />
              ) : (
                ""
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
