import * as React from "react";
import { Component } from "react";
import { randomPassword } from "../common/passwordgen";
import GenericInputField from "../components/GenericInputField";

interface Props {
  onClose: Function;
  needsubdomain?: boolean | false;
  appname: String;
  addAccount: Function;
  appid: number;
  showloading: boolean;
  app: any;
}

interface State {
  showpwchange: boolean;
  showsubdomain: boolean;
  accountdetails: boolean;
  pw1: String;
  pw2: String;
  pw3: String;
  username: String;
  password: String;
  subdomain: String;
  focus: number;
  options?: Object;
}

class AddAccount extends Component<Props, State> {
  state = {
    showpwchange: false,
    showsubdomain: true,
    accountdetails: true,
    pw1: "",
    pw2: "",
    pw3: "",
    username: "",
    password: "",
    subdomain: "",
    focus: this.props.needsubdomain ? 1 : 2
  };

  componentDidMount = async () => {
    const pw1 = await randomPassword();
    const pw2 = await randomPassword();
    const pw3 = await randomPassword();
    this.setState({ pw1, pw2, pw3 });
  };

  toggleshowpwchange = (): void =>
    this.setState(prevState => ({ showpwchange: !prevState.showpwchange }));

  toggleshowsubdomain = (): void =>
    this.setState(prevState => ({ showsubdomain: !prevState.showsubdomain }));

  toggleaccountdetails = (): void =>
    this.setState(prevState => ({ accountdetails: !prevState.accountdetails }));

  onEnter = async fieldid => {
    await this.setState({ focus: fieldid });
  };

  addAccountTHIS = () => {
    if (this.props.needsubdomain && this.props.app) {
      this.props.addAccount(
        this.state.username,
        this.state.password,
        `${this.props.app.options.predomain}${this.state.subdomain}${
          this.props.app.options.afterdomain
        }`,
        this.props.appid
      );
    } else {
      this.props.addAccount(
        this.state.username,
        this.state.password,
        this.state.subdomain,
        this.props.appid
      );
    }
  };

  render() {
    const { clipboard } = require("electron");

    //console.log("P", this.props);

    if (this.props.showloading) {
      return <h3>Adding your account</h3>;
    }

    return (
      <React.Fragment>
        <h3>
          {this.props.needsubdomain ? "Three" : "Two"} simple steps to integrate your existing
          account for {this.props.appname} into Vipfy
        </h3>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleshowpwchange()}>
            <i
              className={`button-hide fas ${
                this.state.showpwchange ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Step 1: Change your password to a non-standad secure one</span>
          </div>
          <div className={`inside ${this.state.showpwchange ? "in" : "out"}`}>
            <div className="inside-padding">
              <h4>
                Please login into your existing account and change the password to a secure one.
              </h4>
              <h4 style={{ color: "#c73544" }}>
                Do not use one of your standard passwords nor a weak one (e.g. 1234)
              </h4>
              <h5>Some good examples are:</h5>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  className="pwexample"
                  title="Click to copy to clipboard"
                  onClick={() => clipboard.writeText(this.state.pw1)}>
                  {this.state.pw1}
                </span>
                <span
                  className="pwexample"
                  title="Click to copy to clipboard"
                  onClick={() => clipboard.writeText(this.state.pw2)}>
                  {this.state.pw2}
                </span>
                <span
                  className="pwexample"
                  title="Click to copy to clipboard"
                  onClick={() => clipboard.writeText(this.state.pw3)}>
                  {this.state.pw3}
                </span>
              </div>
            </div>
          </div>
        </div>
        {console.log("C4", this.props.needsubdomain)}
        {this.props.needsubdomain ? (
          <div className="genericHolder">
            <div className="header" onClick={() => this.toggleshowsubdomain()}>
              <i
                className={`button-hide fas ${
                  this.state.showsubdomain ? "fa-angle-left" : "fa-angle-down"
                }`}
                //onClick={this.toggle}
              />
              <span>Step 2: Enter your subdomain</span>
            </div>
            <div className={`inside ${this.state.showsubdomain ? "in" : "out"}`}>
              <div
                className="inside-padding"
                style={{ display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
                <div className="domainAroundLeft">
                  {this.props.app ? this.props.app.options.predomain : ""}
                </div>
                <div className="field" style={{ width: this.props.options ? "10em" : "20em" }}>
                  <div className="label">Subdomain:</div>
                  {console.log("C5", this.props)}
                  <input
                    className={`inputBoxField inputBoxUnderline ${
                      this.props.app ? "textRight" : ""
                    }`}
                    placeholder="Your subdomain"
                    onChange={e => {
                      const subdomain = e.target.value;
                      this.setState({ subdomain });
                    }}
                    autoFocus={true}
                  />
                </div>
                <div className="domainAroundRight">
                  {this.props.app ? this.props.app.options.afterdomain : ""}
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleaccountdetails()}>
            <i
              className={`button-hide fas ${
                this.state.accountdetails ? "fa-angle-left" : "fa-angle-down"
              }`}
              //onClick={this.toggle}
            />
            <span>Step {this.props.needsubdomain ? "3" : "2"}: Enter your account details</span>
          </div>
          <div className={`inside ${this.state.accountdetails ? "in" : "out"}`}>
            <div
              className="inside-padding"
              style={{ display: "flex", justifyContent: "space-around" }}>
              <div className="field" style={{ width: "20em" }}>
                <div className="label">Username / Email:</div>
                <input
                  className="inputBoxField inputBoxUnderline"
                  placeholder="Please insert your username/email"
                  onChange={e => {
                    const username = e.target.value;
                    this.setState({ username });
                  }}
                  autoFocus={this.props.needsubdomain ? false : true}
                />
              </div>
              <div className="field" style={{ width: "20em" }}>
                <div className="label">Password:</div>
                <input
                  className="inputBoxField inputBoxUnderline"
                  placeholder="Please insert your password"
                  type="password"
                  onChange={e => {
                    const password = e.target.value;
                    this.setState({ password });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="centerText">
          <button
            className="naked-button genericButton"
            onClick={() => this.props.onClose()}
            style={{ marginRight: "0.5em", backgroundColor: "#c73544" }}>
            <span className="textButton">
              {/*<i className="fal fa-long-arrow-alt-left" />*/}
              <i className="fal fa-times" />
            </span>
            <span className="textButtonBesideLeft">Cancel</span>
          </button>

          <button
            className="naked-button genericButton"
            onClick={() => this.addAccountTHIS()}
            style={{
              marginLeft: "0.5em",
              backgroundColor:
                this.state.username &&
                this.state.password &&
                this.state.username !== "" &&
                this.state.password !== ""
                  ? ""
                  : "#c5c5c5"
            }}>
            <span className="textButton">
              <i className="fal fa-check" />
            </span>
            <span className="textButtonBeside">
              {this.state.username &&
              this.state.password &&
              this.state.username !== "" &&
              this.state.password !== ""
                ? "Add Account"
                : "Please fill out all required fields"}
            </span>
          </button>
        </div>

        {/*<span className="heading">Do you want to delete {this.props.name}?</span>

        <div className="checkoutButton" onClick={() => this.props.closePopup()}>
          Cancel
        </div>
        <div className="checkoutButton" onClick={() => this.delEmp()}>
          Delete
    </div>*/}
      </React.Fragment>
    );
  }
}
export default AddAccount;
