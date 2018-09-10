import * as React from "react";
import { Component } from "react";
import GenericInputField from "../components/GenericInputField";

class ShowEmployee extends Component {
  state = {};

  delEmp = () => {
    this.props.acceptFunction(this.props.userid, this.props.did);
  };

  render() {
    console.log("Add", this.props);

    return (
      <div className="addEmployeeHolderP">
        <span className="heading">Do you want to delete {this.props.name}?</span>

        <div className="checkoutButton" onClick={() => this.closePopup()}>
          Cancel
        </div>
        <div className="checkoutButton" onClick={() => this.delEmp()}>
          Delete
        </div>
      </div>
    );
  }
}
export default ShowEmployee;
