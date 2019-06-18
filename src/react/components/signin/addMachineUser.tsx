import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";

import Store = require("electron-store");

interface Props {
  continueFunction: Function;
  backFunction: Function;
  registerCompany: Function;
}

interface State {
  email: string;
}

class AddMachineUser extends React.Component<Props, State> {
  state = { email: "" };

  render() {
    const store = new Store();

    return (
      <div className="dataGeneralForm">
        <div className="holder">
          <div className="logo" />
          <img
            src={`${__dirname}/../../../images/login_new_user.png`}
            className="illustration-login"
          />

          <div className="holder-right">
            <h1>Login to VIPFY</h1>

            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="AddEmail"
                width="312px"
                label="Email"
                livevalue={v => this.setState({ email: v })}
                onEnter={() => this.props.continueFunction(this.state.email)}
              />
            </div>

            <div className="login-buttons">
              {store.has("accounts") && store.get("accounts").length > 0 ? (
                <UniversalButton
                  label="Cancel"
                  type="low"
                  onClick={() => this.props.backFunction()}
                />
              ) : (
                <UniversalButton
                  label="Register Company"
                  type="low"
                  onClick={() => this.props.registerCompany()}
                />
              )}

              <UniversalButton
                label="Add Email"
                type="high"
                disabeld={this.state.email == ""}
                onClick={() => this.props.continueFunction(this.state.email)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default AddMachineUser;
