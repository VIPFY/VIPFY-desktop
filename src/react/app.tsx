import * as React from "react";
import { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { withRouter, Redirect} from "react-router";
import { graphql, compose } from "react-apollo";
import { me } from "./queries/auth";

import { signInUser } from "./mutations/auth";

import Login from "./pages/login";
import Area from "./pages/area";
import Bug from "./pages/bug";


class App extends Component {
  state = {
    login: false,
    firstname: "",
    lastname: ""
  }

  logMeOut = () => {
    this.setState({login:  false})
    localStorage.setItem("token", "");
    localStorage.setItem("refreshToken", "");
    this.props.history.push("/")
  }

  logMeIn = async (email, password) => {
    try {
      const res = await this.props.signIn({variables: { email, password }})
        const { ok, token, refreshToken, user} = res.data.signIn;
        if (ok) {
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);
          this.setState({login:  true})
          this.setState({firstname: user.firstname})
          this.setState({lastname: user.lastname})
          this.setState({profilepicture: user.profilepicture})
        }
      }
      catch(err) {
        console.log("LoginError")
      }


      this.props.history.push("/area/dashboard")

  }

  render() {
    return (
      <div className="fullSize">
        <Switch>
          <Route exact path="/" render={
              (props) => (<Login login={this.logMeIn} {...props} />)}/>
          <Route path="/area" render={(props) => (<Area logMeOut={this.logMeOut} {...props}
                firstname={this.state.firstname} lastname={this.state.lastname} profilepic={this.state.profilepicture} />) } />
          <Route component={Bug} />
        </Switch>
      </div>
    );
  }
}

export default compose(
  graphql(signInUser, {
    name: "signIn"
  }))
  (withRouter(App, history))