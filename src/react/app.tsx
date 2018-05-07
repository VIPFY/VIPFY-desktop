import * as React from "react";
import { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { withRouter, Redirect} from "react-router";
import { graphql } from "react-apollo";

import { signInUser } from "./mutations/auth";

import Login from "./pages/login";
import Area from "./pages/area";
import Bug from "./pages/bug";


class App extends Component {
  state = {
    login: false
  }

  /*logMeIn = (email, password) => {
    console.log("LogMeIn", this)


    this.props
      .signIn({variables: { email, password }})
      .then(res => {
        const { ok, token, refreshToken, error } = res.data.signIn;
        console.log("RESULT GRAPHQL");
        console.log(res);
        if (ok) {
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);
          this.setState({login:  true})
        }
      })
      .catch(err => {
        console.log("BIG ERROR", err, this)
      })


      this.props.history.push("/area/dashboard")

  }*/

  logMeIn = async (email, password) => {
    try {
      const res = await this.props.signIn({variables: { email, password }})
        const { ok, token, refreshToken} = res.data.signIn;
        if (ok) {
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);
          this.setState({login:  true})
        }
      }
      catch(err) {
        console.log("LoginError")
      }


      this.props.history.push("/area/dashboard")

  }
  loggedIn() {
    console.log("LoggedIn", this)
    return this.state.login
  }

  render() {
    console.log("RENDER", this)

    return (
      <div className="fullSize">
        <Switch>
          <Route exact path="/" render={
              (props) => (<Login login={this.logMeIn} {...props} />)}/>
          <Route path="/area" render={
              (props) => (this.loggedIn() ? (<Area {...props} />):
                (<Redirect to={{pathname: "/", state: {loginError: "E-mail or Password incorrect!"} }}/>))
            } />
          <Route component={Bug} />
        </Switch>
      </div>
    );
  }
}

export default graphql(signInUser, {
  name: "signIn"
})(withRouter(App, history))