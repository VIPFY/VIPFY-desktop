import * as React from "react";
import Login from "../components/signin/login";
import PWReset from "../components/signin/pwreset";
import ChangeAccount from "../components/dataForms/ChangeAccount";
import AddMachineUser from "../components/signin/addMachineUser";

import Store = require("electron-store");
import RegisterCompany from "../components/signin/companyRegister";

interface Props {
  login: Function;
  moveTo: Function;
  error: string;
  resetError: Function;
}

interface State {
  progress: string;
  email: string;
}

class SignIn extends React.Component<Props, State> {
  state = {
    progress: "login",
    email: ""
  };

  changeProgress(s) {
    this.props.resetError();
    const store = new Store();
    if (
      s != "pwreset" &&
      s != "registercompany" &&
      (!store.has("accounts") || store.get("accounts").length == 0)
    ) {
      this.setState({ progress: "createuser" });
    } else {
      this.setState({ progress: s });
    }
  }

  componentDidMount() {
    const store = new Store();
    if (!store.has("accounts") || store.get("accounts").length == 0) {
      this.setState({ progress: "createuser" });
    } else {
      this.setState({ email: store.get("accounts")[store.get("accounts").length - 1].email });
    }
  }

  render() {
    switch (this.state.progress) {
      case "login":
        return (
          <Login
            type="login"
            backFunction={() => this.changeProgress("pwreset")}
            continueFunction={(pw, email) => this.props.login(email, pw)}
            email={this.state.email}
            changeUser={() => this.changeProgress("selectuser")}
            error={this.props.error}
          />
        );
      case "pwreset":
        return (
          <PWReset
            continueFunction={email => this.setState({ progress: "login", email })}
            type="pwreset"
            backFunction={() => this.changeProgress("login")}
          />
        );
      case "selectuser":
        return (
          <ChangeAccount
            backFunction={() => this.changeProgress("login")}
            addMachineUser={() => this.changeProgress("createuser")}
            selectAccount={email => {
              this.setState({ email });
              this.changeProgress("login");
            }}
            registerCompany={() => this.changeProgress("registercompany")}
          />
        );
      case "createuser":
        return (
          <AddMachineUser
            continueFunction={(email: string) => this.setState({ email: email, progress: "login" })}
            backFunction={() => this.changeProgress("selectuser")}
            registerCompany={() => this.changeProgress("registercompany")}
          />
        );
      case "registercompany":
        return (
          <RegisterCompany
            backFunction={() => this.changeProgress("login")}
            continueFunction={() => this.props.moveTo("/area/dashboard")}
          />
        );
      default:
        return (
          <Login
            type="login"
            backFunction={() => this.changeProgress("pwreset")}
            continueFunction={v => this.props.login(this.state.email, v)}
            email={this.state.email}
            changeUser={() => this.changeProgress("selectuser")}
            error={this.props.error}
          />
        );
    }
  }
}
export default SignIn;
