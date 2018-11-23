import * as React from "react";
import { Component } from "react";
import { Query } from "react-apollo";
import onClickOutside from "react-onclickoutside";

import {fetchUsersOwnLicences, fetchUnitApps} from "../queries/departments";

class UserEditTeam extends Component {

handleClickOutside = () => {
  this.props.handleOutside()
}

  render() {
    return (
      <div className="employeeInfo">
        <div
          className="deleteEmployee"
          onClick={() => this.props.removeEmployee(this.props.unitId, this.props.departmentId}>
          Remove Employee from department
        </div>
        <div className="deleteEmployee" onClick={() => this.props.fireEmployee(this.props.unitId)}>
          Fire Employee
        </div>
        <Query query={fetchUsersOwnLicences} variables={{ unitid: this.props.unitId }} fetchPolicy="network-only">
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }

            console.log("DATA", data)
            let appArray: JSX.Element[] = [];

            if (data.fetchUsersOwnLicences) {
              if (data.fetchUsersOwnLicences[0]) {
              appArray = data.fetchUsersOwnLicences.map((licence, key) => (
                <div className="PApp" key={key}>
                  <img
                    className="right-profile-image"
                    style={{
                      float: "left"
                    }}
                    src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${licence
                      .boughtplanid.planid.appid.icon || "21352134123123-vipfy-fdgd43asfa"}`}
                  />
                  <div className="employeeName">
                    {licence.boughtplanid.planid.appid.name} {licence.boughtplanid.id}
                  </div>
                  <span className="revokelicence" onClick={() => this.props.revokeLicence(licence.id)}>
                    Revoke
                  </span>
                </div>
              ));
            }
            }
            return appArray;
          }}
        </Query>
        <div className="subaddholder-holder">
          <span>Add personal app</span>
          <div className="subaddholder">
            <Query query={fetchUnitApps} variables={{ departmentid: this.props.departmentId }} fetchPolicy="network-only">
              {({ loading, error, data }) => {
                if (loading) {
                  return "Loading...";
                }
                if (error) {
                  return `Error! ${error.message}`;
                }

                let appArray: JSX.Element[] = [];

                if (data.fetchUnitApps) {
                  appArray = data.fetchUnitApps.map((app, key) => (
                    <div
                      className="PApp"
                      key={key}
                      onClick={() =>
                        this.props.distributeLicence(app.boughtplan.id, this.props.unitId, this.props.departmentId)
                      }>
                      <img
                        className="right-profile-image"
                        style={{
                          float: "left"
                        }}
                        src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${app.appicon ||
                          "21352134123123-vipfy-fdgd43asfa"}`}
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
          </div>
        </div>
      </div>
    );
  }
}
export default onClickOutside(UserEditTeam);
