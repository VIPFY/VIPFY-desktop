import * as React from "react";
import { Component } from "react";
import { graphql, compose, Query } from "react-apollo";
import DepartmentEdit from "../common/departmentEdit";
import UserEditTeam from "../common/userEditTeam";
import AddEmployeeTeam from "../common/addEmployeeTeam";
import DepartmentLicenceEdit from "../common/departmentLicenceEdit";
import DepartmentAddApp from "../common/departmentAddApp";
import Popup from "../common/popup";

import { fetchLicences } from "../queries/auth";

import { fetchDepartments, fetchDepartmentsData } from "../queries/departments";
import {
  addCreateEmployee,
  addEmployee,
  removeEmployee,
  fireEmployee,
  addSubDepartment,
  editDepartment,
  deleteSubDepartment,
  distributeLicenceToDepartment,
  distributeLicence,
  revokeLicence,
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
    showAppOption: "",
    popup: null
  };

  toggleSearch = bool => {
    this.setState({ searchFocus: bool });
  };
  toggleInput = bool => {
    this.setState({ inputFocus: bool });
  };

  showPopup = type => {
    this.setState({ popup: type });
  };
  closePopup = () => {
    this.setState({ popup: null });
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
  };

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
              {this.state.showDA === department.parent ? (
                <DepartmentEdit
                  departmentName={department.department.name}
                  departmentId={department.parent}
                  editDepartment={this.editDepartment}
                  deleteDepartment={this.deleteDepartment}
                  addSubDepartment={this.addSubDepartment}
                  handleOutside={() => {
                    this.toggleDA(0);
                  }}
                />
              ) : (
                ""
              )}
            </div>
            <div className="employeeHolder">
              <div className="addEmployeeHolder">
                {this.state.showAdd === department.parent ? (
                  <AddEmployeeTeam
                    showAddEmployeesNew={this.showAddEmployeesNew}
                    addCreateEmployee={this.addCreateEmployee}
                    departmentId={department.parent}
                    employees={department.children_data}
                    fetchDepartments={this.props.departments.fetchDepartments}
                    addEmployee={this.addEmployee}
                    handleOutside={() => {
                      this.toggleAdd(0);
                    }}
                  />
                ) : (
                  ""
                )}
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
                      {this.state.showEI === `${department.parent} ${element.id}` ? (
                        <UserEditTeam
                          removeEmployee={this.removeEmployee}
                          unitId={element.id}
                          departmentId={department.parent}
                          fireEmployee={this.fireEmployee}
                          revokeLicence={this.revokeLicence}
                          distributeLicence={this.distributeLicence}
                          handleOutside={() => {
                            this.toggleEmployeeInfo(0, 0);
                          }}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  );
                }
              })}
            </div>
            <div className="serviceHolder">
              <div className="addEmployeeHolder">
                {this.state.showPApps === department.parent ? (
                  <DepartmentAddApp
                    departmentId={department.parent}
                    distributeLicenceToDepartment={this.distributeLicenceToDepartment}
                    handleOutside={() => {
                      this.togglePApps(0);
                    }}
                  />
                ) : (
                  ""
                )}
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
            {this.state.showAppOption === `app-${departmentid}-${app.boughtplanid}` ? (
              <DepartmentLicenceEdit
                revokeLicencesFromDepartment={this.revokeLicencesFromDepartment}
                handleOutside={() => {
                  this.toggleBoughtInfo(0, 0);
                }}
              />
            ) : (
              ""
            )}
          </div>
        );
      });
    }
    return appArray;
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
    console.log("BACK", res);
    if (res.data.distributeLicenceToDepartment.error) {
      this.showPopup("NOT ENOUGHT LICENCES");
    }
    this.togglePApps(departmentid);
  };
  distributeLicence = async (boughtplanid, unitid, departmentid) => {
    const res = await this.props.distributeLicence({
      variables: { boughtplanid, unitid, departmentid },
      refetchQueries: [{ query: fetchLicences }]
    });
    this.toggleEmployeeInfo(0, 0);
  };

  revokeLicence = async licenceid => {
    const res = await this.props.revokeLicence({
      variables: { licenceid },
      refetchQueries: [{ query: fetchLicences }]
    });
    this.toggleEmployeeInfo(0, 0);
  };

  revokeLicencesFromDepartment = async (departmentid, boughtplanid) => {
    const res = await this.props.revokeLicencesFromDepartment({
      variables: { departmentid, boughtplanid },
      refetchQueries: [{ query: fetchDepartmentsData }, { query: fetchLicences }]
    });
    this.toggleBoughtInfo(departmentid, boughtplanid);
  };

  deleteDepartment = async departmentid => {
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
    return (
      <div className={cssClass}>
        <div className="UMS">
          {this.props.departmentsdata.fetchDepartmentsData
            ? this.showNewDepartments(this.props.departmentsdata.fetchDepartmentsData[0], 2)
            : ""}
        </div>
        {this.state.popup ? <Popup type={this.state.popup} close={this.closePopup} /> : ""}
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
  graphql(distributeLicence, {
    name: "distributeLicence"
  }),
  graphql(revokeLicence, {
    name: "revokeLicence"
  }),
  graphql(revokeLicencesFromDepartment, {
    name: "revokeLicencesFromDepartment"
  })
)(Team);
