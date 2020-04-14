import * as React from "react";
import Login from "../components/signin/login";
import ChangeAccount from "../components/dataForms/ChangeAccount";
import AddMachineUser from "../components/signin/addMachineUser";
import Store from "electron-store";
import RegisterCompany from "../components/signin/companyRegister";
import PasswordRecovery from "../components/signin/PasswordRecovery";
import NewPassword from "../components/signin/NewPassword";
import RecoveryKey from "../components/signin/RecoveryKey";

interface Props {
  login: Function;
  moveTo: Function;
  error: string;
  resetError: Function;
}

export default (props: Props) => {
  const [progress, setProgress] = React.useState("login");
  const [responseData, setResponseData] = React.useState(null);
  const [email, setEmail] = React.useState("");

  const changeProgress = (s) => {
    props.resetError();
    const store = new Store();

    if (s != "registerCompany" && (!store.has("accounts") || store.get("accounts").length == 0)) {
      setProgress("createUser");
    } else {
      setProgress(s);
    }
  };

  React.useEffect(() => {
    const store = new Store();
    if (!store.has("accounts") || store.get("accounts").length == 0) {
      setProgress("createUser");
    } else {
      setEmail(store.get("accounts")[store.get("accounts").length - 1].email);
    }
  }, []);

  switch (progress) {
    case "login":
      return (
        <Login
          type="login"
          backFunction={() => null}
          continueFunction={(pw, email) => props.login(email, pw)}
          goToRecovery={() => changeProgress("passwordRecovery")}
          email={email}
          changeUser={() => changeProgress("selectUser")}
          error={props.error}
        />
      );

    case "selectUser":
      return (
        <ChangeAccount
          backFunction={() => changeProgress("login")}
          addMachineUser={() => changeProgress("createUser")}
          selectAccount={(email) => {
            setEmail(email);
            changeProgress("login");
          }}
          registerCompany={() => changeProgress("registerCompany")}
        />
      );

    case "createUser":
      return (
        <AddMachineUser
          continueFunction={(email: string) => {
            setProgress("login");
            setEmail(email);
          }}
          backFunction={() => changeProgress("selectuser")}
          registerCompany={() => changeProgress("registerCompany")}
        />
      );

    case "registerCompany":
      return (
        <RegisterCompany
          backFunction={() => changeProgress("login")}
          continueFunction={() => props.moveTo("/area/dashboard")}
        />
      );

    case "passwordRecovery":
      return (
        <PasswordRecovery
          setResponseData={(data) => setResponseData(data)}
          email={email}
          continueFunction={() => changeProgress("setNewPassword")}
          backFunction={() => changeProgress("login")}
        />
      );

    case "setNewPassword":
      return (
        <NewPassword
          responseData={responseData}
          setResponseData={(data) => setResponseData(data)}
          continueFunction={() => changeProgress("setNewPassword")}
        />
      );

    case "newRecoveryCode":
      return (
        <RecoveryKey
          recoveryCode={responseData}
          continueFunction={() => props.moveTo("/area/dashboard")}
        />
      );

    default:
      return (
        <Login
          type="login"
          backFunction={() => null}
          continueFunction={(v) => props.login(email, v)}
          email={email}
          changeUser={() => changeProgress("selectUser")}
          goToRecovery={() => changeProgress("passwordRecovery")}
          error={props.error}
        />
      );
  }
};
