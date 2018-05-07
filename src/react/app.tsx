import * as React from "react";
import { Component } from "react";
import { Route, Switch, Link } from "react-router-dom";
import { matchPath, withRouter, Redirect} from "react-router";

import Login from "./pages/login";
import Area from "./pages/area";
import Bug from "./pages/bug";



class App extends Component {
  state = {
    login: false
  }

  logMeIn = () => {
    console.log("LogMeIn", this)
    this.state.login =  true;
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

export default withRouter(App, history);