import * as React from "react";
import { withRouter } from "react-router";
import { graphql, Query, compose, withApollo } from "react-apollo";
import gql from "graphql-tag";

import { signInUser } from "./mutations/auth";
import { me } from "./queries/auth";
import { AppContext } from "./common/functions";
import { filterError } from "./common/functions";

import Area from "./pages/area";
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

interface AppProps {
  client: any;
  history: any;
  logoutFunction: Function;
  me: any;
  moveTo: Function;
  relogMeIn: Function;
  logMeIn: Function;
  logMeOut: Function;
  signIn: any;
  signUp: any;
}

interface AppState {
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
  createdate: string;
  profilepicture: string;
  error: string;
  userid: number;
  company: any;
  popup: {
    show: boolean;
    header: string;
    body: any;
    props: any;
    type: string;
  };
  updateUser: Function;
  showPopup: Function;
}

const INITIAL_POPUP = {
  show: false,
  header: "",
  body: () => <div>No content</div>,
  props: {},
  type: ""
};

class App extends React.Component<AppProps, AppState> {
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
    createdate: "",
    marketplace: false,
    employees: 3,
    profilepicture: "artist.jpg",
    error: "",
    userid: -1,
    company: null,
    popup: INITIAL_POPUP,
    updateUser: (name, value) => this.setState({ [name]: value }),
    showPopup: data => this.renderPopup(data)
  };

  componentDidMount() {
    this.props.logoutFunction(this.logMeOut);
  }

  renderPopup = ({ header, body, props, type }) => {
    this.setState({ popup: { show: true, header, body, props, type } });
  };

  closePopup = () => this.setState({ popup: INITIAL_POPUP });

  relogMeIn = async data => {
    if (localStorage.getItem("token")) {
      const { company, profilepicture, id, ...userData } = data;
      await this.setState({
        login: true,
        employees: company.employees,
        userid: id,
        company,
        profilepicture: profilepicture || company.profilepicture,
        ...userData
      });
      console.log("RELOGIN Done", this.state.login);
    } else {
      this.logMeOut();
    }
  };

  logMeOut = () => {
    this.setState({ login: false });
    this.props.client.cache.reset(); //clear graphql cache
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    this.props.history.push("/");
  };

  logMeIn = async (email, password) => {
    try {
      const res = await this.props.signIn({ variables: { email, password } });
      const { ok, token, refreshToken, user } = res.data.signIn;

      if (ok) {
        const { id, company, profilepicture, ...userData } = user;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        await this.setState({
          login: true,
          userid: id,
          company,
          employees: company.employees,
          profilepicture: profilepicture || company.profilepicture,
          ...userData
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
        this.setState({ login: true });
      }
      this.props.history.push("/area/advisor");
    } catch (err) {
      this.setState({ login: false, error: filterError(err) });
      localStorage.setItem("token", "");
      localStorage.setItem("refreshToken", "");
      console.log("LoginError", err);
    }
  };

  renderComponents = () => {
    if (!this.state.login && localStorage.getItem("token")) {
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

            return <Area logMeOut={this.logMeOut} reLogIn={this.relogMeIn} userData={data.me} />;
          }}
        </Query>
      );
    } else if (this.state.login && localStorage.getItem("token")) {
      return <Area logMeOut={this.logMeOut} {...this.state} />;
    } else {
      return (
        <Login
          login={this.logMeIn}
          moveTo={this.moveTo}
          register={this.registerMe}
          error={this.state.error}
        />
      );
    }
  };

  render() {
    return (
      <AppContext.Provider value={this.state} className="full-size">
        {this.renderComponents()}
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
  graphql(signInUser, {
    name: "signIn"
  }),
  graphql(SignUp, {
    name: "signUp"
  })
)(withApollo(withRouter(App)));
