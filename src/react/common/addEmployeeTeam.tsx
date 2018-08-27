import * as React from "react";
import { Component } from "react";
import onClickOutside from "react-onclickoutside";
import InputFieldEmail from "../common/inputFieldEmail";

class AddEmployeeTeam extends Component {
  state = {
    searchFocus: false,
    searchString: ""
  };

  handleClickOutside = () => {
    this.props.handleOutside();
  };

  toggleSearchFocus = bool => {
    this.setState({ searchFocus: bool });
  };

  searchString(e) {
    e.preventDefault();
    this.setState({ searchString: e.target.value });
  }

  showAddEmployeesNew(departmentEmployees, departmentid) {
    let employeeArray: JSX.Element[] = [];
    if (this.props.fetchDepartments) {
      this.props.fetchDepartments[0].employees.forEach(employee => {
        if (
          !departmentEmployees.find(function(obj) {
            return obj.id === employee.employeeid;
          }) &&
          (employee.firstname.toLowerCase().includes(this.state.searchString.toLowerCase()) ||
            employee.lastname.toLowerCase().includes(this.state.searchString.toLowerCase()))
        ) {
          employeeArray.push(
            <div
              key={`allEmpolyee-${employee.employeeid}`}
              className="addItem"
              onClick={() => this.props.addEmployee(employee.employeeid, departmentid)}>
              <img
                className="right-profile-image"
                style={{
                  float: "left"
                }}
                src={`https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${employee.profilepicture ||
                  "9b.jpg"}`}
              />
              <span className="addName">
                {employee.firstname} {employee.lastname}
              </span>
            </div>
          );
        }
      });
    }
    return employeeArray;
  }

  render() {
    return (
      <div className="addHolderAll">
        <div
          className={this.state.searchFocus ? "searchbarHolder searchbarFocus" : "searchbarHolder"}>
          <div className="searchbarButton">
            <i className="fas fa-search" />
          </div>
          <input
            onFocus={() => this.toggleSearchFocus(true)}
            onBlur={() => this.toggleSearchFocus(false)}
            className="searchbar"
            placeholder="Search for someone..."
            value={this.state.searchString || ""}
            onChange={e => this.searchString(e)}
          />
        </div>
        <div className="addHolder">
          {this.showAddEmployeesNew(this.props.employees, this.props.departmentId)}
        </div>
        <div className="addUser">
          <InputFieldEmail
            onSubmit={this.props.addCreateEmployee}
            classNameButton="buttonAddEmployee fas fa-arrow-right"
            departmentid={this.props.departmentId}
          />
        </div>
      </div>
    );
  }
}
export default onClickOutside(AddEmployeeTeam);
