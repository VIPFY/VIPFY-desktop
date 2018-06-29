import * as React from "react";
import { Component } from "react";
import { graphql, compose } from "react-apollo";

import { fetchDepartments, fetchDepartmentsData } from "../queries/departments";
import { addCreateEmployee, addEmployee, removeEmployee, fireEmployee } from "../mutations/auth";

class Team extends Component {
  state = {
    showAdd: 0,
    showDA: 0,
    showEI: "",
    searchFocus: false,
    inputFoucs: false,
    newEmail: ""
  };

  toggleSearch = bool => {
    console.log("FOCUS", bool);
    this.setState({ searchFocus: bool });
  };
  toggleInput = bool => {
    console.log("FOCUS", bool);
    this.setState({ inputFocus: bool });
  };

  toggleAdd = index => {
    if (this.state.showAdd === index) {
      this.setState({ showAdd: 0 });
    } else {
      this.setState({ newEmail: "" });
      this.setState({ showAdd: index });
    }
  };

  toggleDA = index => {
    if (this.state.showDA === index) {
      this.setState({ showDA: 0 });
    } else {
      this.setState({ showDA: index });
    }
  };

  toggleEmployeeInfo = (index, did) => {
    if (this.state.showEI === `${did} ${index}`) {
      this.setState({ showEI: "" });
    } else {
      this.setState({ showEI: `${did} ${index}` });
    }
  };

  showRemainingApps(usedApps) {
    return;
  }

  showEmployees(employees, did) {
    let employeeArray: JSX.Element[] = [];

    employees.forEach(employee => {
      console.log("D", employee);
      employeeArray.push(
        <div
          key={`employee-${did}-${employee.employeeid}`}
          className="employee"
          onClick={() => this.toggleEmployeeInfo(employee.employeeid, did)}>
          <img
            className="rightProfileImage"
            style={{
              float: "left"
            }}
            src={`https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${employee.profilepicture ||
              "9b.jpg"}`}
          />
          <div className="employeeName">
            {employee.firstname} {employee.lastname}
          </div>
          <div className="employeeTags">
            <span className="employeeTag">{}</span>
          </div>
          <div
            className={
              this.state.showEI === `${did} ${employee.employeeid}`
                ? "employeeInfo"
                : "employeeInfoNone"
            }>
            <div
              className="deleteEmployee"
              onClick={() => this.removeEmployee(employee.employeeid, did)}>
              Remove Employee from department
            </div>
            <div className="deleteEmployee" onClick={() => this.fireEmployee(employee.employeeid)}>
              Fire Employee
            </div>
          </div>
        </div>
      );
    });

    return employeeArray;
  }

  showAddEmployees(allEmployees, departmentEmployees, departmentid) {
    let employeeArray: JSX.Element[] = [];
    allEmployees.forEach(employee => {
      console.log("AE", employee);
      if (
        !departmentEmployees.find(function(obj) {
          return obj.employeeid === employee.employeeid;
        })
      ) {
        employeeArray.push(
          <div
            key={`allEmpolyee-${employee.employeeid}`}
            className="addItem"
            onClick={() => this.addEmployee(employee.employeeid, departmentid)}>
            <img
              className="rightProfileImage"
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
    return employeeArray;
  }

  addNewEmail(e) {
    e.preventDefault();
    //console.log("ADD", e.target.value);
    this.setState({ newEmail: e.target.value });
  }

  showDepartments(departments) {
    let lastdepartmentid = 0;
    let departmentArray: JSX.Element[] = [];
    let allEmployees = [];
    let children: Object[] = [];
    let level = 0;
    if (departments) {
      departments.forEach(department => {
        if (lastdepartmentid === 0) {
          allEmployees = department.employees;
          children.push({ level: 0, id: department.id });
        }
        level = children.find(function(elm) {
          return elm.id === department.id;
        }).level;
        console.log("DEPART", level, children, department.id);
        if (department.childids) {
          department.childids.forEach(id => {
            children.push({ level: level + 1, id: id });
          });
        }
        lastdepartmentid = department.id;
        console.log("D", department);
        departmentArray.push(
          <div
            key={`department-${department.id}`}
            className="departmentHolder"
            style={{ marginLeft: level + "rem" }}>
            <div className="departmentIcon">{department.department.name.substring(0, 2)}</div>
            <div className="departmentName" onClick={() => this.toggleDA(department.id)}>
              {department.department.name}
              <span className="fas fa-pencil-alt departmentEdit" />
              <div
                className={
                  this.state.showDA === department.id
                    ? "departmentAddInfo"
                    : "departmentAddInfoNone"
                }>
                Add new subdepartment
              </div>
            </div>
            <div className="employeeHolder">
              <div className="addEmployeeHolder">
                <div
                  className={
                    this.state.showAdd === department.id ? "addHolderAll" : "addHolderAllNone"
                  }>
                  <div
                    className={
                      this.state.searchFocus ? "searchbarHolder searchbarFocus" : "searchbarHolder"
                    }>
                    <div className="searchbarButton">
                      <i className="fas fa-search" />
                    </div>
                    <input
                      onFocus={() => this.toggleSearch(true)}
                      onBlur={() => this.toggleSearch(false)}
                      className="searchbar"
                      placeholder="Search for someone..."
                    />
                  </div>
                  <div className="addHolder">
                    {this.showAddEmployees(allEmployees, department.employees, department.id)}
                  </div>
                  <div className="addUser">
                    <div
                      className={
                        this.state.inputFocus ? "searchbarHolder searchbarFocus" : "searchbarHolder"
                      }>
                      <div className="searchbarButton">
                        <i className="fas fa-user-plus" />
                      </div>
                      <input
                        onFocus={() => this.toggleInput(true)}
                        onBlur={() => this.toggleInput(false)}
                        className="searchbar"
                        placeholder="Add someone new..."
                        value={this.state.newEmail}
                        onChange={e => this.addNewEmail(e)}
                      />
                      <span
                        className="buttonAddEmployee fas fa-arrow-right"
                        onClick={() => this.addCreateEmployee(this.state.newEmail, department.id)}
                      />
                    </div>
                  </div>
                </div>
                <span
                  className="addEmployee fas fa-user-plus"
                  onClick={() => this.toggleAdd(department.id)}
                />
              </div>
              {this.showEmployees(department.employees, department.id)}
            </div>
            <div className="serviceHolder">{}</div>
          </div>
        );
      });
    }
    return departmentArray;
  }

  showNewDepartments(departments) {
    console.log("ABCABC", departments);
    let lastdepartmentid = 0;
    let departmentArray: JSX.Element[] = [];
    let level = 0;
    if (departments) {
      departments.forEach(department => {
        if (department.level === 1) {
          console.log("PUSH", department.id);
          departmentArray.push(
            <div
              key={`departmentN-${department.id}`}
              className="departmentHolder"
              style={{ marginLeft: level - 1 + "rem" }}>
              <div className="departmentIcon">
                {department.children_data[0].name.substring(0, 2)}
              </div>
              <div className="departmentName" onClick={() => this.toggleDA(department.id)}>
                {department.children_data[0].name}
                <span className="fas fa-pencil-alt departmentEdit" />
                <div
                  className={
                    this.state.showDA === department.id
                      ? "departmentAddInfo"
                      : "departmentAddInfoNone"
                  }>
                  Add new subdepartment
                </div>
              </div>
            </div>
          );
        }
      });
    }
    return departmentArray;
  }

  addCreateEmployee = async (email, departmentid) => {
    console.log("ADDNEW", email, departmentid);
    const res = await this.props.addCreateEmployee({
      variables: { email, departmentid },
      refetchQueries: [{ query: fetchDepartments }]
    });
    this.toggleAdd(departmentid);
    this.setState({ newEmail: "" });
    console.log("ADDCREATE", res);
  };

  addEmployee = async (unitid, departmentid) => {
    console.log("ADDALREADY", unitid, departmentid);
    const res = await this.props.addEmployee({
      variables: { unitid, departmentid },
      refetchQueries: [{ query: fetchDepartments }]
    });
    this.toggleAdd(departmentid);
    console.log("ADDCREATE", res);
  };

  removeEmployee = async (unitid, departmentid) => {
    console.log("RemoveALREADY", unitid, departmentid);
    const res = await this.props.removeEmployee({
      variables: { unitid, departmentid },
      refetchQueries: [{ query: fetchDepartments }]
    });
    this.toggleEmployeeInfo(0, 0);
    console.log("ADDCREATE", res);
  };

  fireEmployee = async unitid => {
    console.log("RemoveALREADY", unitid);
    const res = await this.props.fireEmployee({
      variables: { unitid },
      refetchQueries: [{ query: fetchDepartments }]
    });
    this.toggleEmployeeInfo(0, 0);
    console.log("ADDCREATE", res);
  };

  render() {
    let cssClass = "fullWorking";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }
    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }
    {
      console.log("DEPARTMENTS", this.props);
    }
    return (
      <div className={cssClass}>
        <div className="UMS">
          {this.showDepartments(this.props.departments.fetchDepartments)}
          {this.showNewDepartments(this.props.departmentsdata.fetchDepartmentsData)}
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(addCreateEmployee, {
    name: "addCreateEmployee"
  }),
  graphql(addEmployee, {
    name: "addEmployee"
  }),
  graphql(removeEmployee, {
    name: "removeEmployee"
  }),
  graphql(fireEmployee, {
    name: "fireEmployee"
  }),
  graphql(fetchDepartments, {
    name: "departments"
  }),
  graphql(fetchDepartmentsData, {
    name: "departmentsdata"
  })
)(Team);
