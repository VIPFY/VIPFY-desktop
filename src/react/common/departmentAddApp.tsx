import * as React from "react";
import { Component } from "react";
import onClickOutside from "react-onclickoutside";

import { Query } from "react-apollo";
import { fetchUnitApps } from "../queries/departments";

class DepartmentAddApp extends Component {
  state = {
    searchFocus: false,
    searchString: ""
  };

  toggleSearchFocus = bool => {
    this.setState({ searchFocus: bool });
  };

  searchString(e) {
    e.preventDefault();
    this.setState({ searchString: e.target.value });
  }

  handleClickOutside = () => {
    this.props.handleOutside();
  };

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
            data.fetchUnitApps.forEach((app, key) => {
              if (app.appname.toLowerCase().includes(this.state.searchString.toLowerCase())) {
                appArray.push(
                  <div
                    className="PApp"
                    key={key}
                    onClick={() =>
                      this.props.distributeLicenceToDepartment(
                        departmentid,
                        app.boughtplan.id,
                        "admin"
                      )
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
                );
              }
            });
          }
          return appArray;
        }}
      </Query>
    );
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
            placeholder="Search for an app..."
            value={this.state.searchString || ""}
            onChange={e => this.searchString(e)}
          />
        </div>
        <div className="addHolder">{this.departmentPossibleApps(this.props.departmentId)}</div>
      </div>
    );
  }
}
export default onClickOutside(DepartmentAddApp);
