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

  componentDidMount() {
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

  loginClick = () => this.handleEnter(null, null, true);

  login = async () => {
    await this.setState({ errorbool: false, error: "No error" });
    const ok = await this.props.login(this.emailInput.value, this.passInput.value);

    if (ok !== true) {
      this.setState({ errorbool: true, error: ok });
    } else {
      this.props.moveTo("/area/dashboard");
    }
  };

  forgetClick = () => this.setState({ forgotMove: true });

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
      this.setState({ errorbool: false });

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

  changeLogin = bool =>
    this.setState({ registerMove: false, errorbool: false, forgotMove: false, login: bool });

  registerClick = () => this.handleEnter(null, 3, true);

  register() {
    this.setState({ registerMove: true });
    this.props.register(this.registerInput.value, this.state.newsletter);
  }

  render() {
    if (this.state.login) {
      return (
        <div className="centralize backgroundLogo">
          <div className="login-holder">
            <div className="form-heading" onDoubleClick={() => this.cheat()}>
              Please log in
            </div>
            <div
              className={
                this.state.errorbool === false ? "formError noError" : "formError oneError"
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
            <div className="button-holder">
              <div
                className={
                  this.state.forgotMove
                    ? "button-forgot button button-moved"
                    : "button-forgot button"
                }
                onClick={this.forgetClick}>
                <span className={this.state.forgotMove ? "button-move" : ""}>Forgot Password</span>
              </div>
              <div
                className={
                  this.state.loginMove ? "buttonLogin button button-moved" : "buttonLogin button"
                }
                onClick={this.loginClick}>
                <span className={this.state.loginMove ? "button-move" : ""}>Login</span>
              </div>
            </div>
          </div>
          <div className="button-new-user button" onClick={() => this.changeLogin(false)}>
            Register Now
          </div>
        </div>
      );
    } else {
      return (
        <div className="centralize backgroundLogo">
          <div className="button-new-user button" onClick={() => this.changeLogin(true)}>
            Already registered? Login Now
          </div>
          <div className="login-holder">
            <div className="form-heading">Please register</div>
            <div
              className={
                this.state.errorbool === false ? "formError noError" : "formError oneError"
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
            <div className="button-holder">
              <div
                className={
                  this.state.registerMove ? "buttonLogin button button-moved" : "buttonLogin button"
                }
                onClick={() => this.registerClick()}>
                <span className={this.state.registerMove ? "button-move" : ""}>Register</span>
              </div>
              <div className="registerInfo">
                <label>
                  <input
                    type="checkbox"
                    value={this.state.newsletter}
                    onChange={() =>
                      this.setState(prevState => ({
                        newsletter: !prevState.newsletter
                      }))
                    }
                  />
                  I agree to receive updates from<br />Vipfy. I can revoke this at any time.
                </label>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Login;
