import * as React from "react";
import UserPicture from "../components/UserPicture";
import { Query } from "react-apollo";
import { fetchUsersOwnLicences } from "../queries/departments";

interface Props {
  person: { firstname: String; lastname: String; id: number };
  onDragOver: Function;
  onDrop: Function;
  onDragStart: Function;
  departmentid: number;
  removeApp: String | null;
  dragginglicence: number;
  teamside: Object;
  addingAppUser: number | null;
  addingAppName: String | null;
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
          <span>{employeename}</span>
        </div>
        <div
          className={`inside ${this.state.show ? "in" : "out"}`}
          onDragOver={e => this.props.onDragOver(e)}
          onDrop={ev => this.props.onDrop(ev, person.id, departmentid, false)}>
          <div className="inside-padding gridinner">
            <UserPicture size="picutre" unitid={person.id} />
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

                  //console.log("DATA", data);
                  let appArray: JSX.Element[] = [];

                  if (data.fetchUsersOwnLicences) {
                    if (data.fetchUsersOwnLicences[0]) {
                      data.fetchUsersOwnLicences.forEach((licence, key) => {
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
                                    licence.boughtplanid.id,
                                    licence.boughtplanid.planid.appid,
                                    true,
                                    licence.id,
                                    person.id
                                  )
                                }
                                onDragEnd={() =>
                                  this.props.teamside.setState({ dragginglicence: 0 })
                                }>
                                <img
                                  className="right-profile-image"
                                  style={{
                                    float: "left"
                                  }}
                                  src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${licence
                                    .boughtplanid.planid.appid.icon ||
                                    "21062018-htv58-scarlett-jpeg"}`}
                                />
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
                              <div className="EApp" key={key}>
                                <img
                                  className="right-profile-image"
                                  style={{
                                    float: "left"
                                  }}
                                  src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${licence
                                    .boughtplanid.planid.appid.icon ||
                                    "21062018-htv58-scarlett-jpeg"}`}
                                />
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
                  return appArray;
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
