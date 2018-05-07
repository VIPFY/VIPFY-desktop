import * as React from "react";
import {Component} from "react";
import {history} from "history";

class Login extends Component {
  state = {
    loginMove: false,
    forgotMove: false,
    error: "noError",
    errorbool: false,
    focus: 1
  }

  componentWillMount() {
    console.log("MOUNT", this)
    if (this.props.location.state) {
      if (this.props.location.state.loginError) {
        this.state.error = this.props.location.state.loginError
        this.state.errorbool = true
      }
    }
  }

  loginClick() {
    this.handleEnter(null, null, true)
  }

  login() {
    this.setState({loginMove: true})
    console.log("EMail", this.emailInput.value)
    console.log("Pass", this.passInput.value)

    //this.props.history.push("/dashboard")
    this.props.login(this.emailInput.value, this.passInput.value)
  }

  forgetClick() {
    this.setState({forgotMove: true})
  }

  handleEnter(e, field, force) {
    if (force || e.key === "Enter") {
      let email = this.emailInput.value
      let pass = this.passInput.value
      console.log("EMail", this.emailInput.value)
      console.log("Pass", this.passInput.value)
      console.log("Focus", this.state.focus)
      this.state.errorbool = false
      if (email.includes("@") && email.includes(".") && !(pass ==="")) {
        //Email Basic Check and Password not empty -> Check
        this.login()
      } else if (!(email.includes("@") && email.includes("."))) {
        //Email Basic Check not successfull -> Delete PassInput and focus email (again)
        this.passInput.value = ""
        this.emailInput.focus()
        this.setState({focus: 1, errorbool: true, error: "Not an E-mail Address."})
      } else if (pass==="") {
        //Email Basic Check ok, but no password -> if focus before on email than just focus, otherwise also error
        if (!(this.state.focus === 1)) {
          this.setState({errorbool: true, error: "Please insert your password."})
        }
        this.passInput.focus()
        this.setState({focus: 2})
      } else {
        this.passInput.value = ""
        this.emailInput.focus()
        this.setState({focus: 1, errorbool: true, error: "Not an E-mail Address or Password not set"})
      }
    } else {
      this.setState({focus: field})
    }
  }

  render() {

    return (
      <div className="centralize backgroundLogo">
        <div className="loginHolder">
          <div className="formHeading">Please log in</div>
          <div className={this.state.errorbool===false? "formError noError" : "formError oneError"}>{this.state.error}</div>
          <label>Username:</label>
          <input className="inputField" placeholder="Your E-mail Address" autoFocus
            onKeyPress={(e) => this.handleEnter(e, 1)}
            ref={(input) => { this.emailInput = input; }}
          />
          <label>Password:</label>
          <input className="inputField" placeholder="Your Password" type="password"
            onKeyPress={(e) => this.handleEnter(e, 2)}
            ref={(input) => { this.passInput = input; }} />
          <div className="buttonHolder">
            <div className={this.state.forgotMove ? "buttonForgot button buttonMoved": "buttonForgot button"} onClick={this.forgetClick.bind(this)}>
              <span className={this.state.forgotMove ? "buttonMove": ""}>Forgot Password</span>
            </div>
            <div className={this.state.loginMove ? "buttonLogin button buttonMoved": "buttonLogin button"} onClick={this.loginClick.bind(this)}>
              <span className={this.state.loginMove ? "buttonMove": ""}>Login</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
