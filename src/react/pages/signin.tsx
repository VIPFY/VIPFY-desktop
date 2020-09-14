import * as React from "react";
import Login from "../components/signin/login";
import ChangeAccount from "../components/dataForms/ChangeAccount";
import AddMachineUser from "../components/signin/addMachineUser";
import Store from "electron-store";
import RegisterCompany from "../components/signin/companyRegister";
import PasswordRecovery from "../components/signin/PasswordRecovery";
import NewPassword from "../components/signin/NewPassword";
import RecoveryKey from "../components/signin/RecoveryKey";
import TwoFactor from "./TwoFactor";
import CardSection from "../components/CardSection";

interface Props {
  login: Function;
  logout: Function;
  moveTo: Function;
  error: string;
  resetError: Function;
  twoFactor: string;
  unitid: string;
}

interface State {
  progress?: string;
  responseData?: any;
  email?: string;
}

class SignIn extends React.Component<Props, State> {
  state = {};
  changeProgress = progress => {
    this.props.resetError();
    const store = new Store();

    if (
      progress != "registerCompany" &&
      (!store.has("accounts") || store.get("accounts").length == 0)
    ) {
      this.setState({ progress: "createUser" });
    } else {
      this.setState({ progress });
    }
  };

  componentDidMount = () => {
    const store = new Store();
    if (!store.has("accounts") || store.get("accounts").length == 0) {
      this.setState({ progress: "registerCompany" });
    } else {
      this.setState({ email: store.get("accounts")[store.get("accounts").length - 1].email });
    }
  };

  loginComponent = () => {
    const store = new Store();
    if (this.props.twoFactor) {
      return (
        <TwoFactor
          moveTo={this.props.moveTo}
          twoFactor={this.props.twoFactor}
          unitid={this.props.unitid!}
          logout={this.props.logout}
        />
      );
    } else {
      switch (this.state.progress) {
        case "registerCompany":
          return (
            <RegisterCompany
              backFunction={() => this.changeProgress("login")}
              continueFunction={() => this.props.moveTo("dashboard")}
            />
          );

        case "passwordRecovery":
          return (
            <PasswordRecovery
              setResponseData={responseData => this.setState({ responseData })}
              continueFunction={() => this.changeProgress("setNewPassword")}
              backFunction={() => this.changeProgress("login")}
            />
          );

        case "setNewPassword":
          return (
            <NewPassword
              responseData={this.state.responseData}
              setResponseData={responseData => this.setState({ responseData })}
              continueFunction={() => this.changeProgress("login")}
            />
          );
        default:
          return (
            <Login
              type="login"
              continueFunction={(email, pw) => this.props.login(email, pw)}
              email={
                this.state.email ||
                (store.has("accounts") &&
                  store.get("accounts").length >= 0 &&
                  store.get("accounts")[store.get("accounts").length - 1].email) ||
                undefined
              }
              goToRecovery={() => this.changeProgress("passwordRecovery")}
              error={this.props.error}
            />
          );
      }
    }
  };

  printNavLink = () => {
    switch (this.state.progress) {
      case "setNewPassword":
        return (
          <div className="footerLinks">
            <a
              onClick={async () => {
                await this.props.logout();
                this.changeProgress("login");
              }}>
              Exit recovery process
            </a>
          </div>
        );
      case "registerCompany":
        return (
          <div className="footerLinks">
            <span>You already have an account?</span>
            <a onClick={() => this.changeProgress("login")}>Sign In</a>
          </div>
        );
      default:
        return (
          <div className="footerLinks">
            <span>Don't have an account? </span>
            <a onClick={() => this.changeProgress("registerCompany")}>Create a company account</a>
          </div>
        );
    }
  };

  render() {
    return (
      <div className="loginHolder">
        <div className="card loginCard">
          <CardSection>{this.loginComponent()}</CardSection>
          {!this.props.twoFactor && <CardSection>{this.printNavLink()}</CardSection>}
        </div>
      </div>
    );
  }
}
export default SignIn;
