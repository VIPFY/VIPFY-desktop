import * as React from "react";
import { Component } from "react";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";

import { fetchLicences } from "../queries/auth";

import { fetchDepartments, fetchDepartmentsData, fetchUnitApps } from "../queries/departments";
import {
  addCreateEmployee,
  addEmployee,
  removeEmployee,
  fireEmployee,
  addSubDepartment,
  editDepartment,
  deleteSubDepartment,
  distributeLicenceToDepartment,
  revokeLicencesFromDepartment
} from "../mutations/auth";

class Team extends Component {
  state = {
    showAdd: 0,
    showDA: 0,
    showPApps: 0,
    showEI: "",
    searchFocus: false,
    inputFoucs: false,
    newEmail: "",
    newDepartment: "",
    departmentName: "",
    showAppOption: ""
  };

  toggleSearch = bool => {
    this.setState({ searchFocus: bool });
  };
  toggleInput = bool => {
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
      this.setState({ newDepartment: "" });
      this.setState({ showDA: index });
    }
  };

  togglePApps = index => {
    if (this.state.showPApps === index) {
      this.setState({ showPApps: 0 });
    } else {
      this.setState({ newDepartment: "" });
      this.setState({ showPApps: index });
    }
  };

  toggleEmployeeInfo = (index, did) => {
    if (this.state.showEI === `${did} ${index}`) {
      this.setState({ showEI: "" });
    } else {
      this.setState({ showEI: `${did} ${index}` });
    }
  };

  toggleBoughtInfo = (did, index) => {
    if (this.state.showAppOption === `app-${did}-${index}`) {
      this.setState({ showAppOption: "" });
    } else {
      this.setState({ showAppOption: `app-${did}-${index}` });
    }
    console.log("GEÄNDERT", this.state.showAppOption);
  };

  showRemainingApps(usedApps) {
    return;
  }

  showEmployees(employees, did) {
    let employeeArray: JSX.Element[] = [];

    employees.forEach(employee => {
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

  showAddEmployeesNew(departmentEmployees, departmentid) {
    let employeeArray: JSX.Element[] = [];
    if (this.props.departments.fetchDepartments) {
      console.log(
        "AE",
        this.props.departments.fetchDepartments[0],
        departmentEmployees,
        departmentid
      );
      this.props.departments.fetchDepartments[0].employees.forEach(employee => {
        if (
          !departmentEmployees.find(function(obj) {
            return obj.id === employee.employeeid;
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
    }
    return employeeArray;
  }

  addNewEmail(e) {
    e.preventDefault();
    this.setState({ newEmail: e.target.value });
  }

  addNewDepartment(e) {
    e.preventDefault();
    this.setState({ newDepartment: e.target.value });
  }

  editDepartmentName(e) {
    e.preventDefault();
    this.setState({ departmentName: e.target.value });
  }

  showNewDepartments(department, thislevel) {
    let lastdepartmentid = 0;
    let departmentArray: JSX.Element[] = [];
    let subdepartmentArray: JSX.Element[] = [];
    let level = 0;
    if (department) {
      if (department.level === thislevel) {
        //this.setState({ departmentName: department.department.name });
        departmentArray.push(
          <div
            key={`department-${department.parent}`}
            className="departmentHolder"
            style={{ marginLeft: department.level - 2 + "rem" }}>
            <div className="departmentIcon">{department.department.name.substring(0, 2)}</div>
            <div className="departmentName">
              <div onClick={() => this.toggleDA(department.parent)}>
                {department.department.name}
                <span className="fas fa-pencil-alt departmentEdit" />
              </div>
              <div
                className={
                  this.state.showDA === department.parent
                    ? "departmentAddInfo"
                    : "departmentAddInfoNone"
                }>
                <div
                  className={
                    this.state.searchFocus ? "searchbarHolder searchbarFocus" : "searchbarHolder"
                  }>
                  <div className="searchbarButton">
                    <i className="fas fa-pencil-alt" />
                  </div>
                  <input
                    onFocus={() => this.toggleSearch(true)}
                    onBlur={() => this.toggleSearch(false)}
                    className="searchbar"
                    value={this.state.departmentName || department.department.name}
                    onChange={e => this.editDepartmentName(e)}
                  />
                  <span
                    className="buttonAddEmployee fas fa-arrow-right"
                    onClick={() =>
                      this.editDepartment(this.state.departmentName, department.parent)
                    }
                  />
                </div>
                <div onClick={() => this.deleteDepartment(department.parent)}>
                  Delete Department
                </div>
                <div className="addUser">
                  <div
                    className={
                      this.state.inputFocus ? "searchbarHolder searchbarFocus" : "searchbarHolder"
                    }>
                    <div className="searchbarButton">
                      <i className="fas fa-plus" />
                    </div>
                    <input
                      onFocus={() => this.toggleInput(true)}
                      onBlur={() => this.toggleInput(false)}
                      className="searchbar"
                      placeholder="Add new subdepartment..."
                      value={this.state.newDepartment}
                      onChange={e => this.addNewDepartment(e)}
                    />
                    <span
                      className="buttonAddEmployee fas fa-arrow-right"
                      onClick={() =>
                        this.addSubDepartment(this.state.newDepartment, department.parent)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="employeeHolder">
              <div className="addEmployeeHolder">
                <div
                  className={
                    this.state.showAdd === department.parent ? "addHolderAll" : "addHolderAllNone"
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
                    {this.showAddEmployeesNew(department.children_data, department.parent)}
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
                        onClick={() =>
                          this.addCreateEmployee(this.state.newEmail, department.parent)
                        }
                      />
                    </div>
                  </div>
                </div>
                <span
                  className="addEmployee fas fa-user-plus"
                  onClick={() => this.toggleAdd(department.parent)}
                />
              </div>

              {department.children_data.map(element => {
                if (element.unitid) {
                  if (
                    this.props.departmentsdata.fetchDepartmentsData.find(function(obj) {
                      return obj.parent === element.unitid;
                    })
                  ) {
                    subdepartmentArray = subdepartmentArray.concat(
                      this.showNewDepartments(
                        this.props.departmentsdata.fetchDepartmentsData.find(function(obj) {
                          return obj.parent === element.unitid;
                        }),
                        thislevel + 1
                      )
                    );
                  } else {
                    subdepartmentArray = subdepartmentArray.concat(
                      this.showNewDepartments(
                        {
                          parent: element.unitid,
                          level: thislevel + 1,
                          children_data: [],
                          department: {
                            name: element.name,
                            apps: element.apps
                          }
                        },
                        thislevel + 1
                      )
                    );
                  }
                  return "";
                } else {
                  return (
                    <div
                      className="employee"
                      key={`empolyee-${element.id}`}
                      onClick={() => this.toggleEmployeeInfo(element.id, department.parent)}>
                      <img
                        className="rightProfileImage"
                        style={{
                          float: "left"
                        }}
                        src={`https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${element.profilepicture ||
                          "9b.jpg"}`}
                      />
                      <div className="employeeName">
                        {element.firstname} {element.lastname}
                      </div>
                      <div className="employeeTags">
                        <span className="employeeTag">{}</span>
                      </div>
                      <div
                        className={
                          this.state.showEI === `${department.parent} ${element.id}`
                            ? "employeeInfo"
                            : "employeeInfoNone"
                        }>
                        <div
                          className="deleteEmployee"
                          onClick={() => this.removeEmployee(element.id, department.parent)}>
                          Remove Employee from department
                        </div>
                        <div
                          className="deleteEmployee"
                          onClick={() => this.fireEmployee(element.id)}>
                          Fire Employee
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
            <div className="serviceHolder">
              <div className="addEmployeeHolder">
                <div
                  className={
                    this.state.showPApps === department.parent ? "addHolderAll" : "addHolderAllNone"
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
                      placeholder="Search for an app..."
                    />
                  </div>
                  <div className="addHolder">{this.departmentPossibleApps(department.parent)}</div>
                </div>
                <span className="fas fa-plus" onClick={() => this.togglePApps(department.parent)} />
              </div>
              {this.departmentapps(department.department.apps, department.parent)}
            </div>
          </div>
        );
      }
    }
    return departmentArray.concat(subdepartmentArray);
  }

  departmentapps(apps, departmentid) {
    let appArray: JSX.Element[] = [];
    console.log("APO", apps);
    if (apps) {
      apps.map(app => {
        appArray.push(
          <div
            className="employee"
            key={`app-${departmentid}-${app.boughtplanid}`}
            onClick={() => this.toggleBoughtInfo(departmentid, app.boughtplanid)}>
            <img
              className="rightProfileImage"
              style={{
                float: "left"
              }}
              src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${app.icon ||
                "21062018-htv58-scarlett-jpeg"}`}
            />
            <div className="employeeName">{app.name}</div>
            <div className="employeeTags">
              <span className="employeeTag">{}</span>
            </div>
            <div
              className={
                this.state.showAppOption === `app-${departmentid}-${app.boughtplanid}`
                  ? "addHolderAll"
                  : "addHolderAllNone"
              }>
              <div
                className="addHolder"
                onClick={() => this.revokeLicencesFromDepartment(departmentid, app.boughtplanid)}>
                Revoke App from department
              </div>
            </div>
          </div>
        );
      });
    }
    return appArray;
  }

  departmentPossibleApps(departmentid) {
    console.log("TESTAPP", departmentid);

    return (
      <Query query={fetchUnitApps} variables={{ departmentid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          console.log("APPS", data);

          let appArray: JSX.Element[] = [];

          if (data.fetchUnitApps) {
            appArray = data.fetchUnitApps.map((app, key) => (
              <div
                className="PApp"
                key={key}
                onClick={() =>
                  this.distributeLicenceToDepartment(departmentid, app.boughtplan.id, "admin")
                }>
                <img
                  className="rightProfileImage"
                  style={{
                    float: "left"
                  }}
                  src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${app.appicon ||
                    "21062018-htv58-scarlett-jpeg"}`}
                />
                <div className="employeeName">
                  {app.appname} {app.boughtplan.id}
                </div>
                <div className="employeeTags">
                  <span className="employeeTag">{}</span>
                </div>
              </div>
            ));
          }
          return appArray;
        }}
      </Query>
    );

    /*console.log("TESTAPP", departmentid);
    let appArray: JSX.Element[] = [];
    try {
      const res = await this.props.fetchunitapps({
        variables: { departmentid }
      });
      console.log("RES");
      console.log("RES", res);
    } catch (error) {
      console.log("ERROR");
      console.log("ERROR", error);
    }
    if (apps) {
      apps.map(app => {
        appArray.push(
          <div className="employee" key={`app-${app.id}-new`}>
            <img
              className="rightProfileImage"
              style={{
                float: "left"
              }}
              src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${app.icon ||
                "21062018-htv58-scarlett-jpeg"}`}
            />
            <div className="employeeName">{app.name}</div>
            <div className="employeeTags">
              <span className="employeeTag">{}</span>
            </div>
          </div>
        );
      });
    }*/
    //return "";
  }

  addCreateEmployee = async (email, departmentid) => {
    const res = await this.props.addCreateEmployee({
      variables: { email, departmentid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    this.toggleAdd(departmentid);
    this.setState({ newEmail: "" });
  };

  addEmployee = async (unitid, departmentid) => {
    const res = await this.props.addEmployee({
      variables: { unitid, departmentid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    this.toggleAdd(departmentid);
  };

  removeEmployee = async (unitid, departmentid) => {
    const res = await this.props.removeEmployee({
      variables: { unitid, departmentid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    this.toggleEmployeeInfo(0, 0);
  };

  fireEmployee = async unitid => {
    const res = await this.props.fireEmployee({
      variables: { unitid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    this.toggleEmployeeInfo(0, 0);
  };

  addSubDepartment = async (name, departmentid) => {
    const res = await this.props.addSubDepartment({
      variables: { departmentid, name },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    this.toggleDA(departmentid);
    this.setState({ newDepartment: "" });
  };

  editDepartment = async (name, departmentid) => {
    const res = await this.props.editDepartment({
      variables: { departmentid, name },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    this.toggleDA(departmentid);
    this.setState({ newDepartment: "" });
  };

  distributeLicenceToDepartment = async (departmentid, boughtplanid, licencetype) => {
    const res = await this.props.distributeLicenceToDepartment({
      variables: { departmentid, boughtplanid, licencetype },
      refetchQueries: [{ query: fetchDepartmentsData }, { query: fetchLicences }]
    });
    this.togglePApps(departmentid);
  };

  revokeLicencesFromDepartment = async (departmentid, boughtplanid) => {
    console.log("REVOKE", departmentid, boughtplanid);
    const res = await this.props.revokeLicencesFromDepartment({
      variables: { departmentid, boughtplanid },
      refetchQueries: [{ query: fetchDepartmentsData }, { query: fetchLicences }]
    });
    this.toggleBoughtInfo(departmentid, boughtplanid);
  };

  deleteDepartment = async departmentid => {
    console.log("DELETE", departmentid);
    const res = await this.props.deleteSubDepartment({
      variables: { departmentid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    this.toggleDA(0);
    this.setState({ newDepartment: "" });
  };

  render() {
    let cssClass = "fullWorking";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }
    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }
    console.log("DEPARTMENTS", this.props);
    return (
      <div className={cssClass}>
        <div className="UMS">
          {/*this.showDepartments(this.props.departments.fetchDepartments)*/}
          {this.props.departmentsdata.fetchDepartmentsData
            ? this.showNewDepartments(this.props.departmentsdata.fetchDepartmentsData[0], 2)
            : ""}
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(addCreateEmployee, {
    name: "addCreateEmployee"
  }),
  graphql(addSubDepartment, {
    name: "addSubDepartment"
  }),
  graphql(editDepartment, {
    name: "editDepartment"
  }),
  graphql(deleteSubDepartment, {
    name: "deleteSubDepartment"
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
  }),
  graphql(distributeLicenceToDepartment, {
    name: "distributeLicenceToDepartment"
  }),
  graphql(revokeLicencesFromDepartment, {
    name: "revokeLicencesFromDepartment"
  })
)(Team);
