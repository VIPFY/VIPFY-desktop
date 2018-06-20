import * as React from "react";
import { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { withRouter, Redirect } from "react-router";
import { graphql, compose, withApollo } from "react-apollo";
import gql from "graphql-tag";

import { signInUser } from "./mutations/auth";
import { filterError } from "./helpers";

import Login from "./pages/login";
import Area from "./pages/area";
import Bug from "./pages/bug";

const SignUp = gql`
  mutation signUp($email: String!, $newsletter: Boolean!) {
    signUp(email: $email, newsletter: $newsletter) {
      ok
      token
      refreshToken
    }
  }
`;

export type AppProps = {
  history: any[];
  signIn: any;
  signUp: any;
  client: any;
};

export type AppState = {
  login: boolean;
  firstname: string;
  lastname: string;
  teams: boolean;
  billing: boolean;
  marketplace: boolean;
  employees: number;
  profilepicture: string;
  error: string | null;
};

class App extends Component<AppProps, AppState> {
  state: AppState = {
    login: false,
    firstname: "",
    lastname: "",
    teams: false,
    billing: false,
    marketplace: false,
    employees: 3,
    profilepicture: "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg",
    error: null
  };

  logMeOut = () => {
    this.setState({ login: false });
    this.props.client.cache.reset(); //clear graphql cache
    localStorage.setItem("token", "");
    localStorage.setItem("refreshToken", "");
    this.props.history.push("/");
  };

  setName = (firstname, lastname) => {
    console.log("SETNAME", firstname, lastname);
    this.setState({ firstname: firstname });
    this.setState({ lastname: lastname });
  };

  logMeIn = async (email, password) => {
    try {
      const res = await this.props.signIn({ variables: { email, password } });
      const { ok, token, refreshToken, user } = res.data.signIn;
      if (ok) {
        console.log("SIGNIN", user);
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        this.setState({ login: true });
        this.setState({ firstname: user.firstname });
        this.setState({ lastname: user.lastname });
        this.setState({ teams: user.teams });
        this.setState({ billing: user.billing });
        this.setState({ marketplace: user.marketplace });
        this.setState({ profilepicture: user.profilepicture || user.company.profilepicture });
        this.setState({ employees: user.company.employees });

        this.props.history.push("/area/dashboard");
        return true;
      }
    } catch (err) {
      this.setState({ login: false });
      localStorage.setItem("token", "");
      localStorage.setItem("refreshToken", "");
      console.log("LoginError", err);
      this.setState({ error: filterError(err) });

      return filterError(err);
    }

    //this.props.history.push("/area/advisor")
  };

  registerMe = async (email, newsletter) => {
    try {
      const res = await this.props.signUp({ variables: { email, newsletter } });
      const { ok, token, refreshToken } = res.data.signUp;
      if (ok) {
        console.log("SIGNUP", res.data);
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        console.log("TOKEN", res.data);
        this.setState({ login: true });
      }
    } catch (err) {
      this.setState({ login: false });
      localStorage.setItem("token", "");
      localStorage.setItem("refreshToken", "");
      this.setState({ error: filterError(err) });
      console.log("LoginError", err);
    }

    this.props.history.push("/area/advisor");
  };

  render() {
    return (
      <div className="fullSize">
        <Switch>
          <Route
            exact
            path="/"
            render={props => (
              <Login
                login={this.logMeIn}
                register={this.registerMe}
                error={this.state.error}
                {...props}
              />
            )}
          />
          <Route
            path="/area"
            render={props => (
              <Area
                logMeOut={this.logMeOut}
                {...props}
                firstname={this.state.firstname}
                lastname={this.state.lastname}
                profilepicture={this.state.profilepicture}
                teams={this.state.teams}
                billing={this.state.billing}
                marketplace={this.state.marketplace}
                employees={this.state.employees}
                setName={this.setName}
              />
            )}
          />
          <Route component={Bug} />
        </Switch>
      </div>
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
)(withApollo(withRouter(App, history)));
