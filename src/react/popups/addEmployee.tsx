import * as React from "react";
import { Component } from "react";
import GenericInputField from "../components/GenericInputField";

class AddEmployee extends Component {
  state = {
    email: null,
    name: null,
    password: "AppleGinTonic",
    focus: 0,
    emailError: null
  };

  onEnter = async fieldid => {
    console.log("ONENTER", fieldid);
    await this.setState({ focus: fieldid });
  };

  addEmp = () => {
    if (this.state.email && this.state.email.includes("@")) {
      console.log("ACC", this.state.email, this.state.name, this.state.password);
      this.setState({ emailError: null });
      this.props.acceptFunction(this.state.email, this.props.did);
    } else {
      console.log("Error", this.state.email);
      this.setState({ emailError: "Please insert Email!" });
    }
  };

  render() {
    console.log("Add", this.props);

    return (
      <div className="addEmployeeHolderP">
        <span className="heading">Who do you want to add to your company?</span>
        <div className="field">
          <div className="label">Email:</div>
          <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Please insert Email"
            onBlur={value => this.setState({ email: value })}
            focus={this.state.focus === 0}
            onEnter={() => this.onEnter(1)}
            onClick={() => this.onEnter(0)}
          />
          {this.state.emailError ? <div className="emailError">{this.state.emailError}</div> : ""}
        </div>
        <div className="field">
          <div className="label">Name:</div>
          <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Please insert name"
            onBlur={value => this.setState({ name: value })}
            focus={this.state.focus === 1}
            onEnter={() => this.onEnter(2)}
            onClick={() => this.onEnter(1)}
          />
        </div>
        <div className="field">
          <div className="label">Password:</div>
          <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Password"
            default="AppleGinTonic"
            onBlur={value => this.setState({ password: value })}
            focus={this.state.focus === 2}
            onEnter={() => this.onEnter(3)}
            onClick={() => this.onEnter(2)}
          />
        </div>
        <div className="checkoutButton" onClick={() => this.addEmp()}>
          Add Employee
        </div>
      </div>
    );
  }
}
export default AddEmployee;
