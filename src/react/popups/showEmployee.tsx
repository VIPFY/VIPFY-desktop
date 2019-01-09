import * as React from "react";

class ShowEmployee extends React.Component {
  state = {};

  delEmp = () => {
    this.props.acceptFunction(this.props.userid, this.props.did);
  };

  render() {
    return (
      <div className="addEmployeeHolderP">
        <span className="heading">Do you want to delete {this.props.name}?</span>

        <div className="checkoutButton" onClick={() => this.props.onClose()}>
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
