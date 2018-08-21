import * as React from "react";
import { Component } from "react";
import onClickOutside from "react-onclickoutside";

class DepartmentLicenceEdit extends Component {
  handleClickOutside = () => {
    this.props.handleOutside();
  };

  render() {
    return (
      <div className="addHolderAll">
        <div
          className="addHolder"
          onClick={() =>
            this.props.revokeLicencesFromDepartment(
              this.props.departmentid,
              this.props.boughtplanid
            )
          }>
          Revoke App from department
        </div>
      </div>
    );
  }
}

export default onClickOutside(DepartmentLicenceEdit);
