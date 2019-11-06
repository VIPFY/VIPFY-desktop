import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";

import Store from "electron-store";
import { emailRegex } from "../../common/constants";
import loginPic from "../../../images/login_new_user.png";

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
          <img src={loginPic} className="illustration-login" />

          <div className="holder-right">
            <h1>Login to VIPFY</h1>

            <div className="UniversalInputHolder">
              <UniversalTextInput
                id="AddEmail"
                width="312px"
                label="Email"
                errorEvaluation={this.state.email.length > 4 && !this.state.email.match(emailRegex)}
                errorhint="A valid email looks like this: john@vipfy.com"
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
                disabled={this.state.email == "" || !this.state.email.match(emailRegex)}
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
