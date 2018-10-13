import * as React from "react";
import { withRouter } from "react-router";
import { graphql, Query, compose, withApollo } from "react-apollo";
import gql from "graphql-tag";

import { signInUser } from "./mutations/auth";
import { me } from "./queries/auth";
import { AppContext, refetchQueries } from "./common/functions";
import { filterError } from "./common/functions";

import Area from "./pages/area";
import Popup from "./components/Popup";
import LoadingDiv from "./components/LoadingDiv";
import Login from "./pages/login";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";

const SignUp = gql`
  mutation signUp($email: String!, $newsletter: Boolean!) {
    signUp(email: $email, newsletter: $newsletter) {
      ok
      token
      refreshToken
    }
  }
`;

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

interface AppState {
  login: boolean;
  error: string;
  firstLogin: boolean;
  address: string;
  popup: {
    show: boolean;
    header: string;
    body: any;
    props: any;
    type: string;
    info: string;
  };
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
  address: "",
  popup: INITIAL_POPUP
};

class App extends React.Component<AppProps, AppState> {
  state: AppState = INITIAL_STATE;

  componentDidMount() {
    this.props.logoutFunction(this.logMeOut);
  }

  setName = async () => {
    // legacy function, call refetchQueries directly instead
    await refetchQueries(this.props.client, ["me"]);
  };

  renderPopup = data => {
    this.setState({ popup: { show: true, ...data } });
  };

  closePopup = () => this.setState({ popup: INITIAL_POPUP });

  logMeOut = () => {
    this.setState(INITIAL_STATE); // clear state
    this.props.client.cache.reset(); // clear graphql cache
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    this.props.history.push("/");
  };

  logMeIn = async (email, password) => {
    try {
      const res = await this.props.signIn({ variables: { email, password } });
      const { ok, token, refreshToken } = res.data.signIn;

      if (ok) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        await this.setState({
          login: true
        });

        return true;
      }
    } catch (err) {
      this.setState({ login: false, error: filterError(err) });
      localStorage.setItem("token", "");
      localStorage.setItem("refreshToken", "");
      console.log("LoginError", err);

      return filterError(err);
    }
  };

  moveTo = (path: string) => this.props.history.push(`/area/${path}`);

  registerMe = async (email, newsletter) => {
    try {
      const res = await this.props.signUp({ variables: { email, newsletter } });
      const { ok, token, refreshToken } = res.data.signUp;
      if (ok) {
        console.log("SIGNUP", res.data);
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        console.log("TOKEN", res.data);
      }
    } catch (err) {
      localStorage.setItem("token", "");
      localStorage.setItem("refreshToken", "");
      this.setState({ login: false, error: filterError(err) });
      console.log("LoginError", err);
    }
  };

  welcomeNewUser = address => {
    this.setState({ firstLogin: true, address });
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
              <Area
                setName={this.setName}
                logMeOut={this.logMeOut}
                showPopup={data => this.renderPopup(data)}
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
          register={this.registerMe}
          error={this.state.error}
        />
      );
    }
  };

  render() {
    const { address, firstLogin } = this.state;

    return (
      <AppContext.Provider
        value={{
          showPopup: data => this.renderPopup(data),
          firstLogin,
          address
        }}
        className="full-size">
        {this.renderComponents()}
        {this.state.popup.show ? (
          <Popup
            popupHeader={this.state.popup.header}
            popupBody={this.state.popup.body}
            bodyProps={this.state.popup.props}
            onClose={this.closePopup}
            type={this.state.popup.type}
            info={this.state.popup.info}
          />
        ) : (
          ""
        )}
      </AppContext.Provider>
    );
  }
}

export default compose(
  graphql(signInUser, {
    name: "signIn"
  }),
  graphql(SignUp, {
    name: "signUp"
  })
)(withApollo(withRouter(App)));
