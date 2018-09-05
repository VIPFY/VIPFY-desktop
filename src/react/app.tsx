import * as React from "react";
import { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { withRouter, Redirect } from "react-router";
import { graphql, compose, withApollo } from "react-apollo";
import gql from "graphql-tag";

import { signInUser } from "./mutations/auth";
import { me } from "./queries/auth";
import { AppContext } from "./common/functions";
import { filterError } from "./common/functions";

import Area from "./pages/area";
import Bug from "./pages/bug";
import Popup from "./components/Popup";
import LoadingDiv from "./components/LoadingDiv";
import Login from "./pages/login";

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
  middlename: string;
  lastname: string;
  birthday: string;
  language: string;
  teams: boolean;
  billing: boolean;
  domains: boolean;
  marketplace: boolean;
  employees: number;
  profilepicture: string;
  error: string | null;
  userid: number;
  company: any;
  popup: object;
  moveTo: Function;
  updateUser: Function;
  showPopup: Function;
};

const INITIAL_POPUP = {
  show: false,
  header: "",
  body: () => <div>No content</div>,
  props: {}
};

class App extends Component<AppProps, AppState> {
  state: AppState = {
    login: false,
    firstname: "",
    middlename: "",
    lastname: "",
    birthday: "",
    language: "",
    teams: false,
    billing: false,
    domains: false,
    marketplace: false,
    employees: 3,
    profilepicture: "artist.jpg",
    error: null,
    userid: -1,
    company: null,
    popup: INITIAL_POPUP,
    moveTo: path => this.moveTo(path),
    updateUser: (name, value) => this.setState({ [name]: value }),
    showPopup: data => this.renderPopup(data)
  };

  componentDidMount = () => {
    this.props.logoutFunction(this.logMeOut);
  };

  renderPopup = ({ header, body, props, type }) => {
    this.setState({ popup: { show: true, header, body, props, type } });
  };

  closePopup = () => this.setState({ popup: INITIAL_POPUP });

  moveTo = path => {
    if (!(this.props.history.location.pathname === path)) {
      this.props.history.push(path);
    }
  };

  relogMeIn = async () => {
    if (this.props.me.error) {
      this.logMeOut();
    } else if (this.props.me.me) {
      const { company, profilepicture, id, ...userData } = this.props.me.me;
      this.setState({ login: true, profilepicture: profilepicture || company.profilepicture });
      this.setState({ employees: company.employees, userid: id, company });
      await this.setState({ ...userData });

      if (this.props.history.location.pathname === "/") {
        this.moveTo("/area/dashboard");
      }
    }
  };

  logMeOut = () => {
    this.setState({ login: false });
    this.props.client.cache.reset(); //clear graphql cache
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    this.moveTo("/");
    //this.props.history.push("/");
  };

  setName = (firstname, lastname) => this.setState({ firstname, lastname });

  logMeIn = async (email, password) => {
    try {
      const res = await this.props.signIn({ variables: { email, password } });
      const { ok, token, refreshToken, user } = res.data.signIn;

      if (ok) {
        const { id, firstname, lastname, teams, billing, domains, marketplace } = user;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        this.setState({ login: true, firstname, lastname });
        this.setState({ teams, billing, domains, marketplace });
        this.setState({ profilepicture: user.profilepicture || user.company.profilepicture });
        this.setState({ employees: user.company.employees });
        this.setState({ userid: id, company: user.company });

        return true;
      }
    } catch (err) {
      this.setState({ login: false, error: filterError(err) });
      localStorage.setItem("token", "");
      localStorage.setItem("refreshToken", "");
      console.log("LoginError", err);

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
      this.setState({ login: false, error: filterError(err) });
      localStorage.setItem("token", "");
      localStorage.setItem("refreshToken", "");
      console.log("LoginError", err);
    }
    this.moveTo("/area/advisor");
  };

  render() {
    const { error, ...userData } = this.state;

    if (this.props.me.loading) {
      return <LoadingDiv text="Preparing Vipfy for you" />;
    }

    if (!this.state.login && localStorage.getItem("token")) {
      this.relogMeIn();
    }

    return (
      <AppContext.Provider value={this.state} className="full-size">
        <Switch>
          <Route
            exact
            path="/"
            render={props => (
              <Login
                login={this.logMeIn}
                moveTo={this.moveTo}
                register={this.registerMe}
                error={error}
                {...props}
              />
            )}
          />
          <Route
            path="/area"
            render={props => (
              <Area logMeOut={this.logMeOut} setName={this.setName} {...props} {...userData} />
            )}
          />
          <Route component={Bug} />
        </Switch>

        {this.state.popup.show ? (
          <Popup
            popupHeader={this.state.popup.header}
            popupBody={this.state.popup.body}
            bodyProps={this.state.popup.props}
            onClose={this.closePopup}
            type={this.state.popup.type}
          />
        ) : (
          ""
        )}
      </AppContext.Provider>
    );
  }
}

export default compose(
  graphql(me, {
    name: "me",
    options: { fetchPolicy: "network-only" }
  }),
  graphql(signInUser, {
    name: "signIn"
  }),
  graphql(SignUp, {
    name: "signUp"
  })
)(withApollo(withRouter(App, history)));
