import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose, Query } from "react-apollo";
import DepartmentEdit from "../common/departmentEdit";
import UserEditTeam from "../common/userEditTeam";
import AddEmployeeTeam from "../common/addEmployeeTeam";
import DepartmentLicenceEdit from "../common/departmentLicenceEdit";
import DepartmentAddApp from "../common/departmentAddApp";
import Popup from "../components/Popup";
import { ErrorComp } from "../common/functions";
import AddEmployee from "../popups/addEmployee";
import ShowEmployee from "../popups/showEmployee";
import LoadingPopup from "../popups/loadingPopup";
import BoughtplanView from "../popups/boughtplanView";

import { fetchLicences, me } from "../queries/auth";

import {
  fetchDepartments,
  fetchDepartmentsData,
  fetchUsersOwnLicences,
  fetchUnitApps,
  fetchAllAppsEnhanced
} from "../queries/departments";
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
import { printIntrospectionSchema } from "graphql/utilities";
import UserPicture from "../components/UserPicture";
import LoadingDiv from "../components/LoadingDiv";
import UserName from "../components/UserName";

import moment = require("moment");
import TeamEmployee from "../components/teamemployee";
import AppDrop from "../popups/appDrop";
import RemoveLicence from "../popups/removeLicence";
import MoveLicence from "../popups/moveLicence";
import { license } from "pjson";
import { AppContext } from "../common/functions";

const REMOVE_EXTERNAL_ACCOUNT = gql`
  mutation onRemoveExternalAccount($licenceid: ID!) {
    removeExternalAccount(licenceid: $licenceid) {
      ok
    }
  }
`;

const SUSPEND_LICENCE = gql`
  mutation suspendLicence($licenceid: ID!, $fromuser: ID, $clear: Boolean) {
    suspendLicence(licenceid: $licenceid, fromuser: $fromuser, clear: $clear) {
      ok
    }
  }
`;

const CLEAR_LICENCE = gql`
  mutation clearLicence($licenceid: ID!) {
    clearLicence(licenceid: $licenceid) {
      ok
    }
  }
`;

const DELETE_LICENCE_AT = gql`
  mutation deleteLicenceAt($licenceid: ID!, $time: Date!) {
    deleteLicenceAt(licenceid: $licenceid, time: $time)
  }
`;

const DELETE_BOUGHTPLAN_AT = gql`
  mutation deleteBoughtPlanAt($licenceid: ID!, $time: Date!) {
    deleteBoughtPlanAt(licenceid: $licenceid, time: $time)
  }
`;

/*revokeLicence(licenceid: ID!): Response!
# Remove the user from a licence and optionally delete the key
suspendLicence(licenceid: ID!, fromuser: ID, clear: Boolean): Response!
# Delete the key from a licence
clearLicence(licenceid: ID!): Response!
# Deletes a licence on a set date, if it is after the normal cancel period
deleteLicenceAt(licenceid: ID!, time: Date!): Date!
# Deletes a boughtPlan on a set date, if it is after the normal cancel period
deleteBoughtPlanAt(boughtplanid: ID!, time: Date!): Date!*/
interface Props {
  showPopup: Function;
  suspendLicence: Function;
  removeExternalAccount: Function;
  clearLicence: Function;
  deleteLicenceAt: Function;
  deleteBoughtplanAt: Function;
}

interface State {
  showAdd: number;
  showDA: number;
  showPApps: number;
  showEI: string;
  searchFocus: boolean;
  inputFoucs: boolean;
  newEmail: string;
  newDepartment: string;
  showAppOption: string;
  popup: any;
  popupProps: any;
  popupBody: any;
  popupHeading: string;
  update: number;

  addingAppUser: any;
  addingAppName: any;
  removeApp: any;
  dragging: number;
  dragginglicence: number;
  searchString: string;
  removeid: number;
  employeeElement: boolean;
  appElement: boolean;
}

class Team extends React.Component<Props, State> {
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
    popup: null,
    popupProps: null,
    popupBody: null,
    update: 0,
    popupHeading: "",
    addingAppUser: null,
    addingAppName: null,
    removeApp: null,
    dragging: 0,
    dragginglicence: 0,
    searchString: "",
    removeid: -1,
    employeeElement: false,
    appElement: false
  };

  toggleSearch = bool => this.setState({ searchFocus: bool });

  toggleInput = bool => this.setState({ inputFocus: bool });

  showPopup = error =>
    this.setState({
      popup: true,
      popupProps: { error },
      popupBody: ErrorComp,
      popupHeading: "Please check"
    });

  addEmployeeP = departmentId =>
    this.setState({
      popup: true,
      popupProps: { acceptFunction: this.addEmployeeAccept, departmentId },
      popupBody: AddEmployee,
      popupHeading: "Add Employee"
    });

  showEmployee = (userid, did) => {
    this.setState({
      popup: true,
      popupProps: {
        acceptFunction: this.delEmployeeAccept,
        userid: userid,
        closePopup: this.closePopup,
        did: did
      },
      popupBody: ShowEmployee,
      popupHeading: "Employee"
    });
  };

  showLoading = sentence => {
    this.setState({
      popup: true,
      popupProps: { sentence },
      popupBody: LoadingPopup,
      popupHeading: "Please wait..."
    });
  };

  closePopup = () => this.setState({ popup: null });

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

  addEmployeeAccept = async (data, departmentid) => {
    try {
      await this.props.addCreateEmployee({
        variables: { ...data, departmentid },
        refetchQueries: [{ query: fetchDepartmentsData }]
      });

      this.closePopup();
    } catch (err) {
      this.showPopup(err.message || "Something went really wrong");
    }
  };

  delEmployeeAccept = async (unitid, departmentid) => {
    try {
      await this.props.removeEmployee({
        variables: { unitid, departmentid },
        refetchQueries: [{ query: fetchDepartmentsData }]
      });
      this.closePopup();
    } catch (err) {
      this.showPopup(err.message || "Something went really wrong");
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
                      <UserPicture
                        size="right-profile-image"
                        style={{
                          float: "left"
                        }}
                        unitid={element.id}
                      />
                      <div className="employeeName">
                        <UserName unitid={element.id} />
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
              className="right-profile-image"
              style={{
                float: "left"
              }}
              src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${app.icon ||
                "21352134123123-vipfy-fdgd43asfa"}`}
            />
            <div className="employeeName">{app.name}</div>
            <div className="employeeTags">
              <span className="employeeTag">{}</span>
            </div>
            {this.state.showAppOption === `app-${departmentid}-${app.boughtplanid}` ? (
              <DepartmentLicenceEdit
                departmentid={departmentid}
                boughtplanid={app.boughtplanid}
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
    if (res.data.addCreateEmployee.error || !res.data.addCreateEmployee.ok) {
      this.showPopup(res.data.addCreateEmployee.error.message || "Something went really wrong");
    }
    this.toggleAdd(departmentid);
    this.setState({ newEmail: "" });
  };

  addEmployee = async (unitid, departmentid) => {
    const res = await this.props.addEmployee({
      variables: { unitid, departmentid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    if (res.data.addEmployee.error || !res.data.addEmployee.ok) {
      this.showPopup(res.data.addEmployee.error.message || "Something went really wrong");
    }
    this.toggleAdd(departmentid);
  };

  removeEmployee = async (unitid, departmentid) => {
    const res = await this.props.removeEmployee({
      variables: { unitid, departmentid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    if (res.data.removeEmployee.error || !res.data.removeEmployee.ok) {
      this.showPopup(res.data.removeEmployee.error.message || "Something went really wrong");
    }
    this.toggleEmployeeInfo(0, 0);
  };

  fireEmployee = async unitid => {
    const res = await this.props.fireEmployee({
      variables: { unitid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    if (res.data.fireEmployee.error || !res.data.fireEmployee.ok) {
      this.showPopup(res.data.fireEmployee.error.message || "Something went really wrong");
    }
    this.toggleEmployeeInfo(0, 0);
  };

  addSubDepartment = async (name, departmentid) => {
    const res = await this.props.addSubDepartment({
      variables: { departmentid, name },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    if (res.data.addSubDepartment.error || !res.data.addSubDepartment.ok) {
      this.showPopup(res.data.addSubDepartment.error.message || "Something went really wrong");
    }
    this.toggleDA(departmentid);
    this.setState({ newDepartment: "" });
  };

  editDepartment = async (name, departmentid) => {
    const res = await this.props.editDepartment({
      variables: { departmentid, name },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    if (res.data.editDepartment.error || !res.data.editDepartment.ok) {
      this.showPopup(res.data.editDepartment.error.message || "Something went really wrong");
    }
    this.toggleDA(departmentid);
    this.setState({ newDepartment: "" });
  };

  distributeLicenceToDepartment = async (departmentid, boughtplanid, licencetype) => {
    const res = await this.props.distributeLicenceToDepartment({
      variables: { departmentid, boughtplanid, licencetype },
      refetchQueries: [{ query: fetchDepartmentsData }, { query: fetchLicences }]
    });
    if (
      res.data.distributeLicenceToDepartment.error ||
      !res.data.distributeLicenceToDepartment.ok
    ) {
      this.showPopup(
        res.data.distributeLicenceToDepartment.error.message || "Something went really wrong"
      );
    }
    this.togglePApps(departmentid);
  };
  distributeLicence = async (boughtplanid, unitid, departmentid, appname) => {
    //this.showLoading("We are adding the App to the user account.")
    //console.log("APPNAME", appname)
    this.setState({ addingAppUser: unitid, addingAppName: appname });
    const res = await this.props.distributeLicence({
      variables: { boughtplanid, unitid, departmentid },
      refetchQueries: [
        { query: fetchLicences },
        { query: fetchUsersOwnLicences, variables: { unitid } }
      ]
    });
    if (res.data.distributeLicence.error || !res.data.distributeLicence.ok) {
      this.showPopup(res.data.distributeLicence.error.message || "Something went really wrong");
    }
    this.setState({ addingAppUser: null, addingAppName: null });
    //this.closePopup();
    //this.toggleEmployeeInfo(0, 0);
    //this.setState({ update: this.state.update + 1 });
  };

  revokeLicence = async (licenceid, unitid) => {
    //console.log("REVOKE", licenceid)
    //this.showLoading("We are removing the app from the user account.")
    this.setState({ removeApp: `${unitid}-${licenceid}` });
    try {
      await this.props.revokeLicence({
        variables: { licenceid },
        refetchQueries: [
          { query: fetchLicences },
          { query: fetchUsersOwnLicences, variables: { unitid } }
        ]
      });
    } catch (err) {
      this.showPopup(err.message || "Something went really wrong");
    }
    this.setState({ removeApp: null });
    //this.closePopup();
    //this.toggleEmployeeInfo(0, 0);
  };

  revokeLicencesFromDepartment = async (departmentid, boughtplanid) => {
    const res = await this.props.revokeLicencesFromDepartment({
      variables: { departmentid, boughtplanid },
      refetchQueries: [{ query: fetchDepartmentsData }, { query: fetchLicences }]
    });
    if (res.data.revokeLicencesFromDepartment.error || !res.data.revokeLicencesFromDepartment.ok) {
      this.showPopup(
        res.data.revokeLicencesFromDepartment.error.message || "Something went really wrong"
      );
    }
    this.toggleBoughtInfo(departmentid, boughtplanid);
  };

  deleteDepartment = async departmentid => {
    this.showLoading("We are removing the app from the user account.");
    const res = await this.props.deleteSubDepartment({
      variables: { departmentid },
      refetchQueries: [{ query: fetchDepartmentsData }]
    });
    if (res.data.deleteSubDepartment.error || !res.data.deleteSubDepartment.ok) {
      this.showPopup(res.data.deleteSubDepartment.error.message || "Something went really wrong");
    }
    this.closePopup();
    //this.toggleDA(0);
    //this.setState({ newDepartment: "" });
  };

  onDragOver = (ev, removeid) => {
    //console.log(this.state.removeid, removeid);
    if (this.state.removeid !== removeid) {
      ev.preventDefault();
    }
  };

  onDragStart = (ev, id, app, remove, licenceid, personid) => {
    if (remove) {
      this.setState({ dragginglicence: licenceid });
    } else {
      this.setState({ dragging: app.id });
    }
    ev.dataTransfer.setData("id", id);
    ev.dataTransfer.setData("appname", app.appname);
    ev.dataTransfer.setData("remove", remove);
    ev.dataTransfer.setData("licenceid", licenceid);
    ev.dataTransfer.setData("personid", personid);
  };

  onDragAppStart = (ev, id, remove, name, needsubdomain) => {
    if (remove) {
      this.setState({ dragginglicence: id });
    } else {
      this.setState({ dragging: id, removeid: 0 });
    }

    ev.dataTransfer.setData("id", id);
    ev.dataTransfer.setData("remove", remove);
    ev.dataTransfer.setData("name", name);
    ev.dataTransfer.setData("needsubdomain", needsubdomain);
  };

  onDragLicenceStart = (ev, licenceid, teamname, personid, personname, appname, external) => {
    //console.log("DRAG START");
    this.setState({ dragginglicence: licenceid, removeid: personid });
    ev.dataTransfer.setData("licenceid", licenceid);
    ev.dataTransfer.setData("remove", "true");
    ev.dataTransfer.setData("teamname", teamname);
    ev.dataTransfer.setData("personid", personid);
    ev.dataTransfer.setData("personname", personname);
    ev.dataTransfer.setData("appname", appname);
    ev.dataTransfer.setData("external", external);
  };

  onDrop = (ev, person, department, removearea) => {
    //console.log("DROP2");
    let id = ev.dataTransfer.getData("id");
    let appname = ev.dataTransfer.getData("appname");
    let remove = ev.dataTransfer.getData("remove");
    let licenceid = ev.dataTransfer.getData("licenceid");
    let personid = ev.dataTransfer.getData("personid");

    if (remove == "true" && removearea) {
      this.revokeLicence(licenceid, personid);
    } else if (remove == "false" && !removearea) {
      this.distributeLicence(id, person, department, appname);
    }
  };

  suspendLicence = async (licenceid, fromuser) => {
    this.setState({ removeApp: `${fromuser}-${licenceid}` });
    try {
      await this.props.suspendLicence({
        variables: { licenceid, fromuser },
        refetchQueries: [
          { query: fetchLicences },
          { query: fetchUsersOwnLicences, variables: { unitid: fromuser } }
        ]
      });
    } catch (err) {
      this.showPopup(err.message || "Something went really wrong");
    }
    this.setState({ removeApp: null, popup: null });
  };

  deleteLicenceAt = async (licenceid, fromuser) => {
    this.setState({ removeApp: `${fromuser}-${licenceid}` });
    try {
      await this.props.suspendLicence({
        variables: { licenceid, fromuser }
      });
      await this.props.deleteLicenceAt({
        variables: { licenceid, time: moment() },
        refetchQueries: [
          { query: fetchLicences },
          { query: fetchUsersOwnLicences, variables: { unitid: fromuser } }
        ]
      });
    } catch (err) {
      this.showPopup(err.message || "Something went really wrong");
    }
    this.setState({ removeApp: null, popup: null });
  };

  moveLicence = async (licenceid, userid, newuserid, departmentid) => {
    console.log("MOVE", licenceid, userid, newuserid, departmentid);
    try {
      await this.props.suspendLicence({
        variables: { licenceid, fromuser: userid }
      });
      const res = await this.props.distributeLicence({
        variables: { licenceid, unitid: newuserid, departmentid },
        refetchQueries: [
          { query: fetchUsersOwnLicences, variables: { unitid: userid } },
          { query: fetchUsersOwnLicences, variables: { unitid: newuserid } }
        ]
      });
    } catch (err) {
      this.showPopup(err.message || "Something went really wrong");
    }
    this.setState({ removeApp: null, popup: null });
  };

  onDropApp = (ev, person, department, removearea) => {
    //console.log("DROP1");
    //this.setState({ dragginglicence: 0, removeid: -1 });
    let remove = ev.dataTransfer.getData("remove");

    if (remove === "true" && removearea) {
      let licenceid = ev.dataTransfer.getData("licenceid");
      let teamname = ev.dataTransfer.getData("teamname");
      let appname = ev.dataTransfer.getData("appname");
      let personid = ev.dataTransfer.getData("personid");
      let personname = ev.dataTransfer.getData("personname");
      let external = ev.dataTransfer.getData("external");
      this.setState({
        popup: true,
        popupProps: {
          onClose: this.closePopup,
          userid: personid,
          appname: appname,
          username: personname,
          teamname: teamname,
          external: external === "true",
          suspendLicence: this.suspendLicence,
          deleteLicenceAt: this.deleteLicenceAt,
          licenceid,
          remove: this.state.removeApp
        },
        popupBody: RemoveLicence,
        popupHeading: `Remove access ${appname} (${teamname}) from ${personname}`
      });
      return;
    }

    if (remove === "true") {
      let licenceid = ev.dataTransfer.getData("licenceid");
      let teamname = ev.dataTransfer.getData("teamname");
      let appname = ev.dataTransfer.getData("appname");
      let personid = ev.dataTransfer.getData("personid");
      let personname = ev.dataTransfer.getData("personname");
      let external = ev.dataTransfer.getData("external");
      if (personid !== person.id) {
        this.setState({
          popup: true,
          popupProps: {
            licenceid,
            onClose: this.closePopup,
            userid: personid,
            appname: appname,
            username: personname,
            teamname: teamname,
            newuserid: person.id,
            newusername: `${person.firstname} ${person.lastname}`,
            external: external === "true",
            moveLicence: this.moveLicence,
            departmentId: department,
            remove: this.state.removeApp
          },
          popupBody: MoveLicence,
          popupHeading: `Move access ${appname} (${teamname}) from ${personname} to ${
            person.firstname
          } ${person.lastname}`
        });
      }
      return;
    }

    if (!removearea && remove !== "true") {
      let id = ev.dataTransfer.getData("id");
      let name = ev.dataTransfer.getData("name");
      let needsubdomain = ev.dataTransfer.getData("needsubdomain");

      this.setState({
        popup: true,
        popupProps: {
          onClose: this.closePopup,
          appid: id,
          appname: name,
          userid: person.id,
          username: `${person.firstname} ${person.lastname}`,
          department: department,
          needsubdomain: needsubdomain === "true"
        },
        popupBody: AppDrop,
        popupHeading: `Your ${name} Teams | ${person.firstname} ${person.lastname}`
      });
    }
  };

  appClick = app => {
    this.setState({
      popup: true,
      popupProps: {
        onClose: this.closePopup,
        appid: app.id,
        appname: app.name,
        popuptype: 5
      },
      popupBody: AppDrop,
      popupHeading: `Your ${app.name} Teams`
    });
  };

  showEmployees(data, departmentid, state, addRenderElement) {
    if (data.employees) {
      let employeeArray: JSX.Element[] = [];
      data.employees.forEach((person, key) => {
        employeeArray.push(
          <TeamEmployee
            key={key}
            person={person}
            onDragOver={this.onDragOver}
            onMouseMove={this.onDragOver}
            onDrop={this.onDropApp}
            onTouchEnd={this.onDropApp}
            departmentid={departmentid}
            removeApp={this.state.removeApp}
            dragginglicence={this.state.dragginglicence}
            onDragStart={this.onDragLicenceStart}
            onTouchStart={this.onDragLicenceStart}
            teamside={this}
            addingAppUser={this.state.addingAppUser}
            addingAppName={this.state.addingAppName}
            onEmployeeClick={this.showEmployee}
            addRenderElement={addRenderElement}
          />
        );
      });
      return employeeArray;
    } else {
      return <div>No Employees in this company</div>;
    }
  }

  render() {
    return (
      <AppContext.Consumer>
        {context => (
          <Query query={me}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv text="Loading Data" />;
              }
              if (error) {
                return <div>Error loading data</div>;
              }
              const { company } = data.me;
              if (company) {
                return (
                  <div className="teamPageHolder">
                    <div
                      className="availableApps"
                      onDrop={ev => this.onDropApp(ev, null, null, true)}
                      //onTouchEnd={ev => this.onDrop(ev, null, null, true)}
                      onMouseMove={e => this.onDragOver(e, 0)}
                      onDragOver={e => this.onDragOver(e, 0)}
                      ref={el =>
                        context.addRenderElement({ key: "availableAppselement", element: el })
                      }>
                      <div className="heading">Move app tile to add app to user</div>
                      <div className="appHolder">
                        <Query
                          query={fetchAllAppsEnhanced}
                          variables={{ departmentid: company.unit.id }}
                          fetchPolicy="network-only">
                          {({ loading, error, data }) => {
                            if (loading) {
                              return "Loading...";
                            }
                            if (error) {
                              return `Error! ${error.message}`;
                            }

                            let appArray: JSX.Element[] = [];

                            if (data.fetchAllAppsEnhanced) {
                              let applist = data.fetchAllAppsEnhanced;
                              applist.sort(function(a, b) {
                                if (a.name > b.name) {
                                  return 1;
                                }
                                if (a.name < b.name) {
                                  return -1;
                                }
                                // a muss gleich b sein
                                return 0;
                              });

                              const filteredlist = applist.filter(
                                app =>
                                  !(app.hidden || app.disabled) &&
                                  ((app.hasboughtplan && this.state.searchString === "") ||
                                    (app.name
                                      .toLowerCase()
                                      .includes(this.state.searchString.toLowerCase()) &&
                                      !(this.state.searchString === "")))
                              );
                              appArray = filteredlist.map((app, key) => (
                                <div
                                  draggable
                                  className={`PApp ${
                                    this.state.dragging == app.id ? "dragging" : ""
                                  }`}
                                  style={{ backgroundColor: app.hasboughtplan ? "" : "#20BAA9" }}
                                  onDragStart={ev =>
                                    this.onDragAppStart(
                                      ev,
                                      app.id,
                                      false,
                                      app.name,
                                      app.needssubdomain
                                    )
                                  }
                                  /*onTouchStart={ev =>
                                this.onDragStart(ev, app.boughtplan.id, app, false, 0, 0)
                              }*/
                                  onDragEnd={() => this.setState({ dragging: 0, removeid: -1 })}
                                  key={key}
                                  onClick={() => this.appClick(app)}
                                  onMouseDown={() => this.setState({ removeid: 0 })}>
                                  <img
                                    className="right-profile-image"
                                    style={{
                                      float: "left"
                                    }}
                                    src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                                      app.icon
                                    }`}
                                  />
                                  <div className="employeeName">{app.name}</div>
                                  <span className="explain">Move to add to user</span>
                                  <div
                                    className={`fas ${
                                      app.hasboughtplan ? "fa-ellipsis-v" : "fa-shopping-cart"
                                    } menuteam `}
                                  />
                                </div>
                              ));
                            }

                            if (data.fetchUnitApps) {
                              let apps: { appid: number }[] = [];

                              let noExternalApps = data.fetchUnitApps.filter(
                                app =>
                                  app.boughtplan.planid.options === null &&
                                  (app.endtime === null ||
                                    moment(app.endtime - 0).isAfter(moment()))
                              );
                              noExternalApps.sort(function(a, b) {
                                return (
                                  (a.boughtplan.alias
                                    ? a.boughtplan.alias
                                    : `${a.appname} ${a.boughtplan.id}`) >
                                  (b.boughtplan.alias
                                    ? b.boughtplan.alias
                                    : `${b.appname} ${b.boughtplan.id}`)
                                );
                              });
                              appArray = noExternalApps.map((app, key) => (
                                <div
                                  title={`${app.licencesused} of ${
                                    app.licencestotal
                                  } licences used`}
                                  draggable
                                  className={`PApp ${
                                    this.state.dragging == app.id ? "dragging" : ""
                                  }`}
                                  onDragStart={ev =>
                                    this.onDragStart(ev, app.boughtplan.id, app, false, 0, 0)
                                  }
                                  onTouchStart={ev =>
                                    this.onDragStart(ev, app.boughtplan.id, app, false, 0, 0)
                                  }
                                  onDragEnd={() => this.setState({ dragging: 0 })}
                                  key={key}
                                  onClick={() =>
                                    this.props.showPopup({
                                      header:
                                        app.boughtplan.alias ||
                                        `${app.appname} ${app.boughtplan.id}`,
                                      body: BoughtplanView,
                                      props: {
                                        appname:
                                          app.boughtplan.alias ||
                                          `${app.appname} ${app.boughtplan.id}`,
                                        app
                                      }
                                    })
                                  }>
                                  <img
                                    className="right-profile-image"
                                    style={{
                                      float: "left"
                                    }}
                                    src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                                      app.appicon
                                    }`}
                                  />
                                  <div className="employeeName">
                                    {app.boughtplan.alias || `${app.appname} ${app.boughtplan.id}`}
                                  </div>
                                  <span className="explain">Move to add to user</span>
                                  <div className="fas fa-ellipsis-v menuteam" />
                                </div>
                              ));
                            }
                            return (
                              <React.Fragment>
                                <div className="PAppSearch">
                                  <button
                                    className="naked-button genericButton"
                                    /*onClick={() => this.setState({ searchopen: false })}*/
                                    style={{ float: "left" }}>
                                    <span className="textButton">
                                      <i className="fal fa-search" />
                                    </span>
                                  </button>
                                  <input
                                    onChange={e => this.setState({ searchString: e.target.value })}
                                    autoFocus={true}
                                    className="inputBoxFieldTeams"
                                  />
                                </div>
                                <div
                                  draggable
                                  className="PApp"
                                  style={{display: "none"}}
                                  ref={el =>
                                    context.addRenderElement({ key: "testappelement", element: el })
                                  }>
                                  <div
                                    className="right-profile-image"
                                    style={{
                                      float: "left"
                                    }}>
                                    <span
                                      className="fal fa-rocket"
                                      style={{
                                        width: "32px",
                                        lineHeight: "32px",
                                        textAlign: "center"
                                      }}
                                    />
                                  </div>
                                  <div className="employeeName">Testapp</div>
                                  <div className="fas fa-ellipsis-v menuteam" />
                                </div>
                                {appArray}
                              </React.Fragment>
                            );
                          }}
                        </Query>
                      </div>
                    </div>
                    <div className="teamHolder">
                      <div className="companyHeader">
                        <div className="companyLogo">
                          {company.profilepicture ? (
                            <img
                              src={`https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                                company.profilepicture
                              }`}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="companyName">{company.name}</div>
                      </div>
                      <div className="companyEmployees">
                        {this.props.departmentsdata.fetchDepartmentsData
                          ? this.showEmployees(
                              this.props.departmentsdata.fetchDepartmentsData[0],
                              company.unit.id,
                              this.state.update,
                              context.addRenderElement
                            )
                          : ""}
                      </div>
                      <div className="companyHeader">
                        <button
                          className="naked-button genericButton"
                          onClick={() => this.addEmployeeP(company.unit.id)}
                          ref={el =>
                            context.addRenderElement({ key: "addEmployeeelement", element: el })
                          }>
                          <span className="textButton">+</span>
                          <span className="textButtonBeside">Add Employee</span>
                        </button>
                      </div>

                      {/*<div className="UMS">
                  {this.props.departmentsdata.fetchDepartmentsData
                    ? this.showNewDepartments(this.props.departmentsdata.fetchDepartmentsData[0], 2)
                    : ""}
                  </div>*/}
                      {this.state.popup ? (
                        <Popup
                          popupHeader={this.state.popupHeading}
                          popupBody={this.state.popupBody}
                          bodyProps={this.state.popupProps}
                          onClose={this.closePopup}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                );
              } else {
                return <div />;
              }
            }}
          </Query>
        )}
      </AppContext.Consumer>
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
  }),
  graphql(REMOVE_EXTERNAL_ACCOUNT, { name: "removeExternalAccount" }),
  graphql(SUSPEND_LICENCE, { name: "suspendLicence" }),
  graphql(CLEAR_LICENCE, { name: "clearLicence" }),
  graphql(DELETE_LICENCE_AT, { name: "deleteLicenceAt" }),
  graphql(DELETE_BOUGHTPLAN_AT, { name: "deleteBoughtplanAt" })
)(Team);
