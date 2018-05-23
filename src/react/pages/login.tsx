import * as React from "react";
import { Component } from "react";

class Login extends Component {
  state = {
    loginMove: false,
    forgotMove: false,
    error: this.props.error + "" || "No error",
    errorbool: this.props.error ? true : false,
    focus: 1,
    login: true,
    newsletter: false
  };

  componentWillMount() {
    if (this.props.location.state) {
      if (this.props.location.state.loginError) {
        this.setState({
          error: this.props.location.state.loginError,
          errorbool: true
        });
      }
    }
  }

  cheat() {
    this.emailInput.value = "nv@vipfy.com";
    this.passInput.value = "12345678";
    this.handleEnter(null, null, true);
  }

  loginClick() {
    this.handleEnter(null, null, true);
  }

  login = async () => {
    const ok = await this.props.login(
      this.emailInput.value,
      this.passInput.value
    );

    if (ok === true) {
      await this.setState({ loginMove: true });
    } else {
      this.setState({ errorbool: true, error: ok });
    }
  };

  forgetClick() {
    this.setState({ forgotMove: true });
  }

  handleEnter(e, field, force) {
    if (field === 3 && (force || e.key === "Enter")) {
      let email = this.registerInput.value;
      if (email.includes("@") && email.includes(".")) {
        this.register();
        return;
      } else {
        this.registerInput.focus();
        this.setState({
          focus: 3,
          errorbool: true,
          error: "Not an E-mail Address."
        });
        return;
      }
    }
    if (force || e.key === "Enter") {
      let email = this.emailInput.value;
      let pass = this.passInput.value;
      this.state.errorbool = false;
      if (email.includes("@") && email.includes(".") && !(pass === "")) {
        //Email Basic Check and Password not empty -> Check
        this.login();
      } else if (!(email.includes("@") && email.includes("."))) {
        //Email Basic Check not successfull -> Delete PassInput and focus email (again)
        this.passInput.value = "";
        this.emailInput.focus();
        this.setState({
          focus: 1,
          errorbool: true,
          error: "Not an E-mail Address."
        });
      } else if (pass === "") {
        //Email Basic Check ok, but no password -> if focus before on email than just focus, otherwise also error
        if (!(this.state.focus === 1)) {
          this.setState({
            errorbool: true,
            error: "Please insert your password."
          });
        }
        this.passInput.focus();
        this.setState({ focus: 2 });
      } else {
        this.passInput.value = "";
        this.emailInput.focus();
        this.setState({
          focus: 1,
          errorbool: true,
          error: "Not an E-mail Address or Password not set"
        });
      }
    } else {
      this.setState({ focus: field });
    }
  }

  changeLogin(bool) {
    this.state.errorbool = false;
    this.setState({ registerMove: false });
    this.setState({ forgotMove: false });
    this.setState({ login: bool });
  }

  registerClick() {
    this.handleEnter(null, 3, true);
  }

  register() {
    this.setState({ registerMove: true });
    this.props.register(this.registerInput.value, this.state.newsletter);
    console.log("REGISTER");
  }

  render() {
    if (this.state.login) {
      return (
        <div className="centralize backgroundLogo">
          <div className="loginHolder">
            <div className="formHeading" onDoubleClick={() => this.cheat()}>
              Please log in
            </div>
            <div
              className={
                this.state.errorbool === false
                  ? "formError noError"
                  : "formError oneError"
              }>
              {this.state.error}
            </div>
            <label>Username:</label>
            <input
              className="inputField"
              placeholder="Your E-mail Address"
              autoFocus
              onKeyPress={e => this.handleEnter(e, 1)}
              ref={input => {
                this.emailInput = input;
              }}
            />
            <label>Password:</label>
            <input
              className="inputField"
              placeholder="Your Password"
              type="password"
              onKeyPress={e => this.handleEnter(e, 2)}
              ref={input => {
                this.passInput = input;
              }}
            />
            <div className="buttonHolder">
              <div
                className={
                  this.state.forgotMove
                    ? "buttonForgot button buttonMoved"
                    : "buttonForgot button"
                }
                onClick={this.forgetClick.bind(this)}>
                <span className={this.state.forgotMove ? "buttonMove" : ""}>
                  Forgot Password
                </span>
              </div>
              <div
                className={
                  this.state.loginMove
                    ? "buttonLogin button buttonMoved"
                    : "buttonLogin button"
                }
                onClick={this.loginClick.bind(this)}>
                <span className={this.state.loginMove ? "buttonMove" : ""}>
                  Login
                </span>
              </div>
            </div>
          </div>
          <div
            className="newUserButton button"
            onClick={() => this.changeLogin(false)}>
            Register Now
          </div>
        </div>
      );
    } else {
      return (
        <div className="centralize backgroundLogo">
          <div
            className="newUserButton button"
            onClick={() => this.changeLogin(true)}>
            Already registered? Login Now
          </div>
          <div className="loginHolder">
            <div className="formHeading">Please register</div>
            <div
              className={
                this.state.errorbool === false
                  ? "formError noError"
                  : "formError oneError"
              }>
              {this.state.error}
            </div>
            <label>Username:</label>
            <input
              className="inputField"
              placeholder="Your E-mail Address"
              autoFocus
              onKeyPress={e => this.handleEnter(e, 3)}
              ref={input => {
                this.registerInput = input;
              }}
            />
            <div className="buttonHolder">
              <div
                className={
                  this.state.registerMove
                    ? "buttonLogin button buttonMoved"
                    : "buttonLogin button"
                }
                onClick={() => this.registerClick()}>
                <span className={this.state.registerMove ? "buttonMove" : ""}>
                  Register
                </span>
              </div>
              <div className="registerInfo">
                <input
                  type="checkbox"
                  value={this.state.newsletter}
                  onClick={() =>
                    this.setState(prevState => ({
                      newsletter: !prevState.newsletter
                    }))
                  }
                />
                I agree to receive updates from Vipfy
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Login;
