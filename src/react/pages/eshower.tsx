import * as React from "react";
import SelfSearchBox from "../components/SelfSearchBox";
import EGeneral from "./egeneral";
import EServices from "./eservices";
import { Query } from "react-apollo";
import { QUERY_SEMIPUBLICUSER } from "../queries/user";
import { fetchDepartmentsData } from "../queries/departments";
import UniversalSearchBox from "../components/universalSearchBox";
import UniversalButton from "../components/universalButtons/universalButton";

interface Props {
  //showPopup: Function;
  //moveTo: Function;
  //isadmin: boolean;
}

interface State {
  show: Boolean;
}

class EShower extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = () => {
    this.setState(prevState => {
      return { show: !prevState.show };
    });
  };

  employees = [
    {
      name: "Lisa Brödlin",
      online: false,
      services: [
        { name: "Survey Monkey", icon: "Survey Monkey/logo.png" },
        { name: "Typeform", icon: "TypeForm/logo.png" },
        { name: "Zoom", icon: "Zoom/logo.png" },
        { name: "10to8", icon: "10to8/logo.png" },
        { name: "Invision App", icon: "Invision App/logo.png" },
        { name: "Asana", icon: "Asana/logo.png" }
      ],
      teams: [{ name: "Marketing", color: "#5D76FF" }, { name: "Design", color: "#FFC15D" }]
    },
    {
      name: "Nils Vossebein",
      online: true,
      services: [
        { name: "Survey Monkey", icon: "Survey Monkey/logo.png" },
        { name: "Twitter", icon: "twitter/logo.png" },
        { name: "Humanity", icon: "Humanity/logo.png" },
        { name: "Evernote", icon: "Evernote/logo.png" },
        { name: "Create Send", icon: "Create Send/logo.png" },
        { name: "Asana", icon: "Asana/logo.png" },
        { name: "Buffer", icon: "Buffer/logo.png" }
      ],
      teams: [
        { name: "Marketing", color: "#5D76FF" },
        { name: "Management", short: "MA", color: "#9C13BC" }
      ]
    },
    {
      name: "Markus Müller",
      online: true,
      services: [
        { name: "Amazon", icon: "amazon/logo.png" },
        { name: "Evernote", icon: "Evernote/logo.png" },
        { name: "Create Send", icon: "Create Send/logo.png" },
        { name: "Asana", icon: "Asana/logo.png" }
      ],
      teams: [
        { name: "Management", short: "MA", color: "#9C13BC" },
        { name: "Sales", short: "S", color: "#FD8B29" }
      ]
    }
  ];

  renderSerives(services) {
    let serviceArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < services.length; counter++) {
      const service = services[counter];
      if (services.length > 6 && counter > 4) {
        serviceArray.push(
          <div
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{services.length - 5}
          </div>
        );
        break;
      } else {
        serviceArray.push(
          <div
            className="managerSquare"
            style={
              service.icon
                ? {
                    backgroundImage: `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                      service.icon
                    )})`,
                    backgroundColor: "unset"
                  }
                : {}
            }>
            {service.icon ? "" : service.name.slice(0, 1)}
          </div>
        );
      }
    }
    return serviceArray;
  }

  renderTeams(teams) {
    let teamArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < teams.length; counter++) {
      const team = teams[counter];
      if (teams.length > 6 && counter > 4) {
        teamArray.push(
          <div
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{teams.length - 5}
          </div>
        );
        break;
      } else {
        teamArray.push(
          <div className="managerSquare" style={team.color ? { backgroundColor: team.color } : {}}>
            {team.short || team.name.slice(0, 1)}
          </div>
        );
      }
    }
    return teamArray;
  }

  render() {
    //const employeeid = this.props.match.params.userid;
    //console.log("ESHOWER", this.props.match, this.props, this.props.match.params.userid);
    return (
      <div className="managerPage">
        <div className="heading">
          <h1>Employee Manager</h1>
          <UniversalSearchBox />
        </div>
        <div className="section">
          <div className="heading">
            <h1>Employees</h1>
          </div>
          <div className="table">
            <div className="tableHeading">
              <div className="tableMain">
                <div className="tableColumnBig">
                  <h1>Name</h1>
                </div>
                <div className="tableColumnBig">
                  <h1>Services</h1>
                </div>
                <div className="tableColumnBig">
                  <h1>Teams</h1>
                </div>
              </div>
              <div className="tableEnd">
                <UniversalButton
                  type="high"
                  label="Add Employee"
                  customStyles={{
                    fontSize: "12px",
                    lineHeight: "24px",
                    fontWeight: "700",
                    marginRight: "16px"
                  }}
                />
              </div>
            </div>
            {this.employees.map(employee => (
              <div className="tableRow">
                <div className="tableMain">
                  <div className="tableColumnBig">
                    <div className="managerSquare">{employee.name.slice(0, 1)}</div>
                    <span className="name">{employee.name}</span>
                    <div
                      className="employeeOnline"
                      style={
                        employee.online
                          ? { backgroundColor: "#29CC94" }
                          : { backgroundColor: "#DB4D3F" }
                      }
                    />
                  </div>
                  <div className="tableColumnBig">{this.renderSerives(employee.services)}</div>
                  <div className="tableColumnBig">{this.renderTeams(employee.teams)}</div>
                </div>
                <div className="tableEnd">
                  <div className="editOptions">
                    <i className="fal fa-edit" />
                    <i className="fal fa-trash-alt" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return (
      <div className="genericPage employeeManager">
        <Query query={QUERY_SEMIPUBLICUSER} variables={{ unitid: employeeid }}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return `Error! ${error.message}`;
            }

            console.log("SEMIPUBLIC", data);
            return (
              <React.Fragment>
                <div className="genericPageName" style={{ justifyContent: "space-between" }}>
                  <div>
                    <span className="pagePreTitle" onClick={() => this.props.moveTo("emanager")}>
                      Employees
                    </span>
                    <span className="pageArrowTitle">></span>
                    <span className="pageMainTitle">{`${data.adminme.firstname} ${
                      data.adminme.lastname
                    }`}</span>
                  </div>
                  <Query query={fetchDepartmentsData}>
                    {({ loading, error, data }) => {
                      if (loading) {
                        return "Loading...";
                      }
                      if (error) {
                        return `Error! ${error.message}`;
                      }
                      let possibleValues: { searchstring: string; link: string }[] = [];
                      if (data.fetchDepartmentsData) {
                        data.fetchDepartmentsData[0].employees.forEach((employee, k) => {
                          possibleValues.push({
                            searchstring: `${employee.firstname} ${employee.lastname}`,
                            link: `emanager/${employee.id}`
                          });
                        });
                        return (
                          <SelfSearchBox
                            placeholder="Search in Employee Manager"
                            possibleValues={possibleValues}
                            moveTo={this.props.moveTo}
                          />
                        );
                      }
                    }}
                  </Query>
                </div>
                <EGeneral
                  isadmin={this.props.isadmin}
                  showPopup={this.props.showPopup}
                  employeeid={employeeid}
                />

                <EServices
                  employeeid={employeeid}
                  employeename={`${data.adminme.firstname} ${data.adminme.lastname}`}
                />
              </React.Fragment>
            );
          }}
        </Query>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggle()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
              //onClick={this.toggle}
            />
            <span>Assigned Departments</span>
          </div>
          <div className={`inside ${this.state.show ? "in" : "out"}`}>
            <div className="inside-padding">
              <div className="appExplain">
                <div />
                <div>Departmentname:</div>
                <div>Number of members</div>
              </div>
              <div className="appExplain">
                <div
                  className="hex"
                  style={{ backgroundColor: "#20baa9", borderColor: "#20baa9" }}
                  ref={e => (this.element = e)}>
                  <span>M</span>
                  {console.log("TESTING", this)
                  /*<div
                className="titleBox"
                style={{
                  top: this.element ? this.calculateTop(this.element, -10) : "",
                  left: this.element ? this.calculateLeft(this.element, 0, 2) : ""
                }}>
                Marketing
            </div>*/
                  }
                </div>
                <div>Marketing</div>
                <div>20 more members</div>
              </div>
              <div className="appExplain">
                <div className="hex" style={{ backgroundColor: "#c73544", borderColor: "#c73544" }}>
                  P
                </div>
                <div>Production</div>
                <div>10 more members</div>
              </div>
            </div>
          </div>
        </div>
        <div className="adminToolButton">
          <button className="naked-button genericButton" onClick={() => this.props.toggleAdmin()}>
            <span className="textButton">
              <i className="fal fa-tools" />
            </span>
            <span className="textButtonBesideLeft">
              {this.props.adminOpen ? "Hide Admintools" : "Show Admintools"}
            </span>
          </button>
        </div>
      </div>
    );
  }
}

export default EShower;
