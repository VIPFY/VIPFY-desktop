import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";

import Store = require("electron-store");
import { string } from "prop-types";

interface Props {
  type: string;
  email: string;
  continueFunction: Function;
  backFunction: Function;
  error?: string;
  changeUser: Function;
}

interface State {
  field1: string;
  field2: string;
  changed: Boolean;
}

class Login extends React.Component<Props, State> {
  state = {
    field1: "",
    field2: "",
    changed: false
  };

  render() {
    const store = new Store();
    let user: {
      email: string;
      name: string;
      fullname: string;
      profilepicture: string;
    } | null = null;
    if (store.has("accounts")) {
      const machineuserarray = store.get("accounts");
      console.log("Users", machineuserarray);
      user = machineuserarray.find(u => u.email == this.props.email);
      console.log("User", user);
    }

    return (
      <div className="dataGeneralForm">
        <div className="logo" />
        <h1>{user ? `Welcome back, ${user.name}` : "Welcome"}</h1>

        <div className="UniversalInputHolder">
          <div className="preloggedFullname">
            <div
              className="accountBullet"
              style={
                user
                  ? user!.profilepicture
                    ? user!.profilepicture.indexOf("/") != -1
                      ? {
                          backgroundImage: `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                            user!.profilepicture
                          )})`
                        }
                      : {
                          backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${encodeURI(
                            user!.profilepicture
                          )})`
                        }
                    : {}
                  : {}
              }
            />
            <span>{user ? user.fullname : this.props.email}</span>
          </div>
          <button onClick={() => this.props.changeUser()} className="notperson">
            {user ? `Not ${user.name}?` : "Change User"}
          </button>
        </div>
        <div className="UniversalInputHolder">
          <UniversalTextInput
            id="upw"
            width="312px"
            type="password"
            label="Password"
            livevalue={v => this.setState({ field2: v, changed: true })}
            errorEvaluation={this.props.error && !this.state.changed}
            errorhint={
              this.props.error && !this.state.changed ? (
                <React.Fragment>
                  <i className="fal fa-exclamation-circle" />
                  <span>
                    {this.props.error == "network"
                      ? "Can't reach Server. Please check your internet connection."
                      : "Password incorrect"}
                  </span>
                </React.Fragment>
              ) : null
            }
            onEnter={() => this.props.continueFunction(this.state.field2)}
          />
        </div>
        <div className="oneIllustrationHolder" />
        <div className="buttonHolder">
          <UniversalButton
            label="Forgot Password"
            type="low"
            onClick={() => this.props.backFunction()}
          />

          <UniversalButton
            label="Login"
            type="high"
            disabeld={this.state.field2 == ""}
            onClick={() => this.props.continueFunction(this.state.field2)}
          />
        </div>
      </div>
    );
  }
}
export default Login;
