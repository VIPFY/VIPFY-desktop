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


  loginClick() {
    this.setState({loginMove: true})
    console.log("EMail", this.emailInput.value)
    console.log("Pass", this.passInput.value)

    this.props.history.push("/dashboard")
  }
  forgetClick() {
    this.setState({forgotMove: true})
  }

  handleEnter(e, field) {
    if (e.key === "Enter") {
      let email = this.emailInput.value
      let pass = this.passInput.value
      console.log("EMail", this.emailInput.value)
      console.log("Pass", this.passInput.value)
      console.log("Focus", this.state.focus)
      this.state.errorbool = false
      if (email.includes("@") && email.includes(".") && !(pass ==="")) {
        //Email Basic Check and Password not empty -> Check
        this.loginClick()
      } else if (!(email.includes("@") && email.includes("."))) {
        //Email Basic Check not successfull -> Delete PassInput and focus email (again)
        this.state.error = "Not a E-mail Address."
        this.state.errorbool = true
        this.passInput.value = ""
        this.emailInput.focus()
        this.setState({focus: 1})
      } else if (pass==="") {
        //Email Basic Check ok, but no password -> if focus before on email than just focus, otherwise also error
        if (!(this.state.focus === 1)) {
          this.state.error = "Please insert your password."
          this.state.errorbool = true
        }
        this.passInput.focus()
        this.setState({focus: 2})
      } else {
        this.state.error = "Not a E-mail Address or Password not set"
        this.state.errorbool = true
        this.passInput.value = ""
        this.emailInput.focus()
        this.setState({focus: 1})
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
