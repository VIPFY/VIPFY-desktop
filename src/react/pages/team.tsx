import * as React from "react";
import { Component } from "react";

class Team extends Component {
  state = {
    showAdd: 0
    searchFocus: false
  };

  toggleSearch = bool => {
    console.log("FOCUS", bool);
    this.setState({ searchFocus: bool });
  };

  toggleAdd = index => {
    if (this.state.showAdd === index) {
      this.setState({showAdd: 0})
    } else {
      this.setState({showAdd: index})
    }
  }

  showRemainingApps(usedApps) {
    return
  }

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
          <div className="departmentHolder">
            <div className="departmentIcon">DE</div>
            <div className="departmentName">Developer</div>
            <div className="employeeHolder">
              <div className="addEmployeeHolder">
                <div className={this.state.showAdd === 1 ? "addHolderAll": "addHolderAllNone"}>
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
                    <div className="addItem">
                      <img
                        className="rightProfileImage"
                        style={{
                          float: "left"
                        }}
                        src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png"
                      />
                      <span className="addName">Jannis Froese</span>
                    </div>
                    <div className="addItem">
                      <img
                        className="rightProfileImage"
                        style={{
                          float: "left"
                        }}
                        src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png"
                      />
                      <span className="addName">Markus Müller</span>
                    </div>
                  </div>
                </div>
                <span className="addEmployee fas fa-user-plus"  onClick={() => this.toggleAdd(1)}/>
              </div>
              <div className="employee">
                <img
                  className="rightProfileImage"
                  style={{
                    float: "left"
                  }}
                  src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png"
                />
                <div className="employeeName">Nils Vossebein</div>
                <div className="employeeTags">
                  <span className="employeeTag">Senior</span>
                </div>
              </div>
              <div className="employee">
                <img
                  className="rightProfileImage"
                  style={{
                    float: "left"
                  }}
                  src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png"
                />
                <div className="employeeName">Pascal Clanget </div>
                <div className="employeeTags">
                  <span className="employeeTag">Senior</span>
                </div>
              </div>
            </div>
            <div className="serviceHolder">
              <div className="addEmployee">
                <span className="fas fa-plus" />
              </div>
              <div className="employee">
                <img
                  className="rightProfileImage"
                  style={{
                    float: "left"
                  }}
                  src="https://storage.googleapis.com/vipfy-imagestore-01/icons/weebly.jpg"
                />
                <div className="employeeName">Weebly </div>
                <div className="employeeTags">
                  <span className="employeeTag">Developer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="departmentHolder">
            <div className="departmentIcon" style={{ backgroundColor: "#3abf94" }}>
              MA
            </div>
            <div className="departmentName">Marketing</div>
            <div className="employeeHolder">
              <div className="addEmployeeHolder">
              <div className={this.state.showAdd === 3 ? "addHolderAll": "addHolderAllNone"}>
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
                    <div className="addItem">
                      <img
                        className="rightProfileImage"
                        style={{
                          float: "left"
                        }}
                        src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png"
                      />
                      <span className="addName">Jannis Froese</span>
                    </div>
                    <div className="addItem">
                      <img
                        className="rightProfileImage"
                        style={{
                          float: "left"
                        }}
                        src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png"
                      />
                      <span className="addName">Markus Müller</span>
                    </div>
                  </div>
                </div>
                <span className="addEmployee fas fa-user-plus" onClick={() => this.toggleAdd(3)}/>
              </div>
              <div className="employee">
                <img
                  className="rightProfileImage"
                  style={{
                    float: "left"
                  }}
                  src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png"
                />
                <div className="employeeName">Markus Müller</div>
                <div className="employeeTags">
                  <span className="employeeTag">Senior</span>
                </div>
              </div>
              <div className="employee">
                <img
                  className="rightProfileImage"
                  style={{
                    float: "left"
                  }}
                  src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png"
                />
                <div className="employeeName">Nils Vossebein</div>
                <div className="employeeTags">
                  <span className="employeeTag">Junior</span>
                </div>
              </div>
            </div>
            <div className="serviceHolder">
              <div className="addEmployee">
                <span className="fas fa-plus" />
              </div>
              <div className="employee">
                <img
                  className="rightProfileImage"
                  style={{
                    float: "left"
                  }}
                  src="https://storage.googleapis.com/vipfy-imagestore-01/icons/pipedrive.png"
                />
                <div className="employeeName">Pipedrive</div>
                <div className="employeeTags">
                  <span className="employeeTag">Sales</span>
                </div>
              </div>
              <div className="employee">
                <img
                  className="rightProfileImage"
                  style={{
                    float: "left"
                  }}
                  src="https://storage.googleapis.com/vipfy-imagestore-01/icons/xero.png"
                />
                <div className="employeeName">Xero</div>
                <div className="employeeTags">
                  <span className="employeeTag">Sales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Team;
