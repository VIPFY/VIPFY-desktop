import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import UniversalTextInput from "../universalForms/universalTextInput";

interface Props {
  type: string;
  preloggedin?: { email: string; name: string; fullname: string };
  continueFunction?: Function;
  backFunction?: Function;
}

interface State {
  field1: string;
  field2: string;
}

class SignUpInGeneral extends React.Component<Props, State> {
  state = {
    field1: "",
    field2: ""
  };
  componentWillReceiveProps() {
    this.setState({ field1: "", field2: "" });
  }

  fields = {
    login: {
      title: `Welcome back, ${this.props.preloggedin!.name}`,
      prelogged: true,
      field2: "Password",
      field2id: "pwa",
      continue: "Continue",
      continueFunction: () => this.props.continueFunction!(this.state.field2),
      back: "Forgot Password",
      backFunction: () => this.props.backFunction!()
    },
    create: {
      title: "Add VIPFY-user to this machine",
      field1: "Email",
      field2: "Password",
      continue: "Add",
      continueFunction: () => console.log("C"),
      back: "Cancel",
      backFunction: () => console.log("B")
    },
    welcome: {
      title: "Welcome to VIPFY",
      field1: "Email",
      field2: "Company",
      continue: "Register",
      continueFunction: () => console.log("C")
    },
    pwreset: {
      title: "Password Reset",
      text1: "Enter your email and we’ll send you instructions on how to reset your password",
      field2: "Email",
      field2id: "ema",
      continue: "Continue",
      continueFunction: () => console.log("C"),
      back: "Back",
      backFunction: () => this.props.backFunction!()
    }
  };

  render() {
    console.log(this.fields, this.props, this.state);
    return (
      <div className="dataGeneralForm">
        <div className="logo" />
        <h1>{this.fields[this.props.type].title}</h1>
        {this.fields[this.props.type].prelogged ? (
          <div className="UniversalInputHolder">
            <div className="preloggedFullname">
              <span>{this.props.preloggedin!.fullname}</span>
            </div>
            <button className="notperson">Not {this.props.preloggedin!.name}?</button>
          </div>
        ) : this.fields[this.props.type].field1 ? (
          <div className="UniversalInputHolder">
            <UniversalTextInput
              id={this.fields[this.props.type].field1id}
              width="312px"
              label={this.fields[this.props.type].field1}
              livevalue={v => this.setState({ field1: v })}
            />
          </div>
        ) : (
          <div className="textHolder">
            <div>{this.fields[this.props.type].text1}</div>
          </div>
        )}
        <div className="UniversalInputHolder">
          <UniversalTextInput
            id={this.fields[this.props.type].field2id}
            width="312px"
            type={this.fields[this.props.type].field2 == "Password" ? "password" : ""}
            label={this.fields[this.props.type].field2}
            livevalue={v => this.setState({ field2: v })}
          />
        </div>
        <div className="oneIllustrationHolder" />
        <div
          className="buttonHolder"
          style={this.fields[this.props.type].back ? {} : { justifyContent: "space-around" }}>
          {this.fields[this.props.type].back && (
            <UniversalButton
              label={this.fields[this.props.type].back}
              type="low"
              onClick={() => this.fields[this.props.type].backFunction()}
            />
          )}
          <UniversalButton
            label={this.fields[this.props.type].continue}
            type="high"
            disabeld={
              (this.fields[this.props.type].field1 && this.state.field1 == "") ||
              this.state.field2 == ""
            }
            onClick={() => this.fields[this.props.type].continueFunction()}
          />
        </div>
      </div>
    );
  }
}

export default SignUpInGeneral;
