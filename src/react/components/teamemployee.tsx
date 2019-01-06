import * as React from "react";
import UserPicture from "../components/UserPicture";
import { Query } from "react-apollo";
import { fetchUsersOwnLicences } from "../queries/departments";
import moment = require("moment");
import { con } from "../../locationScripts/utils/util";

interface Props {
  person: { firstname: String; lastname: String; id: number };
  onDragOver: Function;
  onDrop: Function;
  onDragStart: Function;
  onTouchStart: Function;
  onTouchEnd: Function;
  onMouseMove: Function;
  departmentid: number;
  removeApp: String | null;
  dragginglicence: number;
  teamside: Object;
  addingAppUser: number | null;
  addingAppName: String | null;
  onEmployeeClick?: Function;
  addRenderElement: Function;
}
interface State {
  show: Boolean;
}

class TeamEmployee extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  render() {
    const { person, departmentid } = this.props;
    const employeename = `${person.firstname} ${person.lastname}`;
    return (
      <div className="genericHolder">
        <div className="header" onClick={() => this.toggle()}>
          <i
            className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
            //onClick={this.toggle}
          />
          {/*<div className="button-right fas fa-ellipsis-v" />*/}
          <span>{employeename}</span>
        </div>
        <div
          className={`inside ${this.state.show ? "in" : "out"}`}
          onDragOver={e => this.props.onDragOver(e, person.id)}
          onMouseMove={e => this.props.onDragOver(e, person.id)}
          onDrop={ev => this.props.onDrop(ev, person, departmentid, false)}
          onTouchEnd={ev => this.props.onDrop(ev, person, departmentid, false)}
          ref={el => this.props.addRenderElement({ key: "employeeShowelement", element: el })}>
          <div className="inside-padding gridinner">
            <UserPicture
              size="picutre"
              unitid={person.id}
              onClick={this.props.onEmployeeClick}
              departmentid={departmentid}
            />
            <div className="team-app-holders">
              <Query
                query={fetchUsersOwnLicences}
                variables={{ unitid: person.id }}
                fetchPolicy="network-only">
                {({ loading, error, data }) => {
                  if (loading) {
                    return "Loading...";
                  }
                  if (error) {
                    return `Error! ${error.message}`;
                  }
                  let appArray: JSX.Element[] = [];

                  if (data.fetchUsersOwnLicences) {
                    if (data.fetchUsersOwnLicences[0]) {
                      data.fetchUsersOwnLicences.forEach((licence, key) => {
                        if (
                          licence.disabled ||
                          (licence.endtime ? moment().isBefore(licence.endtime) : false)
                        ) {
                          return;
                        }
                        if (this.props.removeApp === `${person.id}-${licence.id}`) {
                          appArray.push(
                            <div className="EApp" key="newApp">
                              <div className="spinner right-profile-image">
                                <div className="double-bounce1" />
                                <div className="double-bounce2" />
                              </div>
                              <div className="employeeName">
                                {licence.boughtplanid.planid.appid.name}
                              </div>
                              <span className="revokelicence">removing...</span>
                            </div>
                          );
                        } else {
                          if (
                            !(
                              licence.boughtplanid.planid.options &&
                              licence.boughtplanid.planid.options.external
                            )
                          ) {
                            appArray.push(
                              <div
                                className={`EApp dragable ${
                                  this.props.dragginglicence == licence.id ? "dragging" : ""
                                }`}
                                key={key}
                                draggable
                                onDragStart={ev =>
                                  this.props.onDragStart(
                                    ev,
                                    licence.id,
                                    licence.boughtplanid.alias,
                                    person.id,
                                    employeename,
                                    licence.boughtplanid.planid.appid.name,
                                    false
                                  )
                                }
                                onDragEnd={() =>
                                  this.props.teamside.setState({ dragginglicence: 0 })
                                }
                                onMouseDown={() => {
                                  this.props.teamside.setState({ removeid: person.id });
                                }}>
                                {licence.boughtplanid.planid.appid.icon ? (
                                  <img
                                    className="right-profile-image"
                                    style={{
                                      float: "left"
                                    }}
                                    src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${licence
                                      .boughtplanid.planid.appid.icon ||
                                      "21352134123123-vipfy-fdgd43asfa"}`}
                                  />
                                ) : (
                                  <div
                                    className="fal fa-rocket right-profile-image"
                                    style={{
                                      float: "left",
                                      lineHeight: "2rem",
                                      width: "2rem",
                                      textAlign: "center",
                                      fontSize: "1rem"
                                    }}
                                  />
                                )}
                                {licence.boughtplanid.planid.options &&
                                licence.boughtplanid.planid.options.external ? (
                                  <div className="ribbon-small ribbon-small-top-right">
                                    <span>E</span>
                                  </div>
                                ) : (
                                  ""
                                )}
                                <div className="employeeName">
                                  {licence.boughtplanid.alias ||
                                    `${licence.boughtplanid.planid.appid.name} ${
                                      licence.boughtplanid.id
                                    }`}
                                </div>
                                {/*licence.boughtplanid.planid.options &&
                              licence.boughtplanid.planid.options.external ? (
                                ""
                              ) : (
                                <span
                                  className="revokelicence"
                                  onClick={() => this.revokeLicence(licence.id, person.id)}>
                                  Revoke
                                </span>
                              )*/}
                              </div>
                            );
                          } else {
                            appArray.push(
                              <div
                                className={`EApp dragable ${
                                  this.props.dragginglicence == licence.id ? "dragging" : ""
                                }`}
                                key={key}
                                draggable
                                onDragStart={ev =>
                                  this.props.onDragStart(
                                    ev,
                                    licence.id,
                                    licence.boughtplanid.alias,
                                    person.id,
                                    employeename,
                                    licence.boughtplanid.planid.appid.name,
                                    true
                                  )
                                }
                                onDragEnd={() =>
                                  this.props.teamside.setState({
                                    dragginglicence: 0,
                                    removeid: -1
                                  })
                                }
                                onMouseDown={() => {
                                  this.props.teamside.setState({ removeid: person.id });
                                }}>
                                {licence.boughtplanid.planid.appid.icon ? (
                                  <img
                                    className="right-profile-image"
                                    style={{
                                      float: "left"
                                    }}
                                    src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${licence
                                      .boughtplanid.planid.appid.icon ||
                                      "21352134123123-vipfy-fdgd43asfa"}`}
                                  />
                                ) : (
                                  <div
                                    className="fal fa-rocket right-profile-image"
                                    style={{
                                      float: "left",
                                      lineHeight: "2rem",
                                      width: "2rem",
                                      textAlign: "center",
                                      fontSize: "1rem"
                                    }}
                                  />
                                )}
                                {licence.boughtplanid.planid.options &&
                                licence.boughtplanid.planid.options.external ? (
                                  <div className="ribbon-small ribbon-small-top-right">
                                    <span>E</span>
                                  </div>
                                ) : (
                                  ""
                                )}
                                <div className="employeeName">
                                  {licence.boughtplanid.alias ||
                                    `${licence.boughtplanid.planid.appid.name} ${
                                      licence.boughtplanid.id
                                    }`}
                                </div>
                              </div>
                            );
                          }
                        }
                      });
                    }
                  }
                  if (this.props.addingAppUser === person.id) {
                    appArray.push(
                      <div className="EApp" key="newApp">
                        <div className="spinner right-profile-image">
                          <div className="double-bounce1" />
                          <div className="double-bounce2" />
                        </div>
                        <div className="employeeName">{this.props.addingAppName}</div>
                      </div>
                    );
                  }
                  if (appArray.length > 0) {
                    return appArray;
                  } else {
                    return <div>No useable apps yet</div>;
                  }
                }}
              </Query>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default TeamEmployee;
