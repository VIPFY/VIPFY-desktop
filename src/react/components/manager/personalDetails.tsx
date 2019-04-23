import * as React from "react";
import { Query } from "react-apollo";
import moment = require("moment");
import { QUERY_SEMIPUBLICUSER } from "../../queries/user";

interface Props {
  e: any;
  employeeid: number;
  employeename: string;
}

interface State {}

class PersonalDetails extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <Query query={QUERY_SEMIPUBLICUSER} variables={{ unitid: this.props.employeeid }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }

          console.log("SEMIPUBLIC", data);
          const querydata = data.adminme;
          const userdata = {
            profilepicutre: querydata.profilepicture,
            online: querydata.isonline,
            admin: querydata.isadmin,
            name: `${querydata.firstname} ${querydata.lastname}`,
            //position: "CMO",
            birthday: querydata.birthday,
            hire: "01.05.18",
            contract: "infinite",
            boss: "Lisa Brödlin",
            email1: querydata.emails[0] && querydata.emails[0].email,
            email2: querydata.emails[1] && querydata.emails[1].email,
            email3: querydata.emails[2] && querydata.emails[2].email,
            phone1: querydata.phones[0] && querydata.phones[0].number,
            phone2: querydata.phones[1] && querydata.phones[1].number,
            phone3: querydata.phones[2] && querydata.phones[2].number,
            address11:
              querydata.addresses[0] &&
              querydata.addresses[0].address &&
              querydata.addresses[0].address.street,
            zip1:
              querydata.addresses[0] &&
              querydata.addresses[0].address &&
              querydata.addresses[0].address.zip,
            city1:
              querydata.addresses[0] &&
              querydata.addresses[0].address &&
              querydata.addresses[0].address.city,
            address21:
              querydata.addresses[1] &&
              querydata.addresses[1].address &&
              querydata.addresses[1].address.street,
            zip2:
              querydata.addresses[1] &&
              querydata.addresses[1].address &&
              querydata.addresses[1].address.zip,
            city2:
              querydata.addresses[1] &&
              querydata.addresses[1].address &&
              querydata.addresses[1].address.city
          };

          console.log("USERDATA", userdata, userdata.zip1 && userdata.city1);
          return (

                <div className="tableRow" style={{ height: "80px" }}>
                  <div className="tableMain">
                    <div className="tableColumnSmall">
                      <h1>Name</h1>
                    </div>
                    <div className="tableColumnSmall">
                      <h1>Birthday</h1>
                    </div>
                    <div className="tableColumnSmall">
                      <h1>Address</h1>
                    </div>
                    <div className="tableColumnSmall">
                      <h1>Phone Privat</h1>
                    </div>
                  </div>
                  <div className="tableEnd">
                    <div className="editOptions">
                      <i className="fal fa-edit" />
                      <i className="fal fa-trash-alt" />
                    </div>
                  </div>
                </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gridColumnGap: "10px",
                gridTemplateRows: "repeat(14, 20px)",
                alignItems: "end"
              }}>
              <div
                className="circle80"
                style={{
                  gridRow: "1/5",
                  gridColumn: 1,
                  backgroundImage: `url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                    userdata.profilepicutre
                  }')`
                }}>
                {this.props.isadmin && (
                  <div>
                    <i className="fal fa-tools adminButton" />
                  </div>
                )}
              </div>
              {userdata.online ? (
                <div className="roundedNotification online" style={{ gridRow: 6, gridColumn: 1 }}>
                  Online
                </div>
              ) : (
                <div className="roundedNotification offline" style={{ gridRow: 6, gridColumn: 1 }}>
                  Offline
                </div>
              )}
              {userdata.admin ? (
                <div className="roundedNotification status" style={{ gridRow: 7, gridColumn: 1 }}>
                  Admin
                </div>
              ) : (
                ""
              )}

              <div className="roundedNotification button" style={{ gridRow: 9, gridColumn: 1 }}>
                Chat
              </div>

              <div className="roundedNotification button" style={{ gridRow: 11, gridColumn: 1 }}>
                Compliance
              </div>

              <div className="roundedNotification button" style={{ gridRow: 13, gridColumn: 1 }}>
                Privacy
              </div>

              <div className="heading" style={{ gridRow: 1, gridColumn: 2 }}>
                Name:
              </div>
              <div className="text" style={{ gridRow: 2, gridColumn: 2 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={1}
                    original={userdata.name}
                    default={userdata.name}
                    onSave={v => this.saveField(1, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                    nodelete={true}
                  />
                ) : (
                  <span>{userdata.name}</span>
                )}
              </div>

              <div className="heading disabled" style={{ gridRow: 4, gridColumn: 2 }}>
                Position:
              </div>
              <div className="text disabled" style={{ gridRow: 5, gridColumn: 2 }}>
                {/*this.props.isadmin ? (
                        <EditFieldRDS
                          activeedit={this.state.editnumber}
                          editid={2}
                          default="No Position"
                          original={userdata.position}
                          onSave={v => this.saveField(2, v)}
                          setEditState={v => this.setState({ editnumber: v })}
                        />
                      ) : (
                        <span>{userdata.position}</span>
                      )*/}
                Not implemented yet
              </div>

              <div className="heading" style={{ gridRow: 7, gridColumn: 2 }}>
                Birthday:
              </div>
              <div className="text" style={{ gridRow: 8, gridColumn: 2 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={3}
                    original={userdata.birthday && moment(userdata.birthday).format("YYYY-MM-DD")}
                    default=""
                    onSave={v => this.saveField(3, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                    type="date"
                  />
                ) : (
                  <span>{userdata.birthday}</span>
                )}
              </div>

              <div className="heading disabled" style={{ gridRow: 10, gridColumn: 2 }}>
                Hire Date:
              </div>
              <div className="text disabled" style={{ gridRow: 11, gridColumn: 2 }}>
                Not implemented yet
              </div>

              <div className="heading" style={{ gridRow: 13, gridColumn: 2 }}>
                Contract duration:
              </div>
              <div className="text" style={{ gridRow: 14, gridColumn: 2 }}>
                unlimited
              </div>

              <div className="heading" style={{ gridRow: 1, gridColumn: 3 }}>
                E-Mail:
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 2 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={6}
                    default=""
                    original={userdata.email1}
                    onSave={v => this.saveField(6, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                    type="email"
                  />
                ) : (
                  <span>{userdata.email1}</span>
                )}
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 3 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={7}
                    default=""
                    original={userdata.email2}
                    onSave={v => this.saveField(7, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                    type="email"
                  />
                ) : (
                  <span>{userdata.email2}</span>
                )}
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 4 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={8}
                    default=""
                    original={userdata.email3}
                    onSave={v => this.saveField(8, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                    type="email"
                  />
                ) : (
                  <span>{userdata.email3}</span>
                )}
              </div>

              <div className="heading" style={{ gridRow: 6, gridColumn: 3 }}>
                Phone:
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 7 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={9}
                    default=""
                    original={userdata.phone1}
                    onSave={v => this.saveField(9, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                  />
                ) : (
                  <span>{userdata.phone1}</span>
                )}
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 8 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={10}
                    default=""
                    original={userdata.phone2}
                    onSave={v => this.saveField(10, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                  />
                ) : (
                  <span>{userdata.phone2}</span>
                )}
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 9 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={11}
                    default=""
                    original={userdata.phone3}
                    onSave={v => this.saveField(11, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                  />
                ) : (
                  <span>{userdata.phone3}</span>
                )}
              </div>

              <div className="heading disabled" style={{ gridColumn: 3, gridRow: 11 }}>
                Next Vacation
              </div>
              <div className="text disabled" style={{ gridColumn: 3, gridRow: 12 }}>
                Not implemented yet
              </div>
              <div className="text disabled" style={{ gridColumn: 3, gridRow: 13 }}>
                Not implemented yet
              </div>

              <div className="heading" style={{ gridRow: 1, gridColumn: 4 }}>
                Address
              </div>

              <div className="text" style={{ gridColumn: 4, gridRow: 3 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={14}
                    default=""
                    original={userdata.address11}
                    formtype="address"
                    zip={userdata.zip1}
                    city={userdata.city1}
                    onSave={v => this.saveField(14, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                  />
                ) : (
                  <div>
                    <div className="twoLineContent">{userdata.address11}</div>
                    <div className="twoLineContent">
                      {userdata.zip1 && userdata.city1 && `${userdata.zip1} ${userdata.city1}`}
                    </div>
                  </div>
                )}
              </div>

              <div className="text" style={{ gridColumn: 4, gridRow: 6 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={15}
                    default=""
                    original={userdata.address21}
                    formtype="address"
                    zip={userdata.zip2}
                    city={userdata.city2}
                    onSave={v => this.saveField(15, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                  />
                ) : (
                  <div>
                    <div className="twoLineContent">{userdata.address21}</div>
                    <div className="twoLineContent">
                      {userdata.zip2 && userdata.city2 && `${userdata.zip2} ${userdata.city2}`}
                    </div>
                  </div>
                )}
              </div>

              <div className="heading disabled" style={{ gridColumn: 4, gridRow: 9 }}>
                Boss
              </div>
              <div className="text disabled" style={{ gridColumn: 4, gridRow: 10 }}>
                Not implemented yet
              </div>
              <div className="heading disabled" style={{ gridColumn: 4, gridRow: 12 }}>
                Directly reports to
              </div>
              <div className="text disabled" style={{ gridColumn: 4, gridRow: 13 }}>
                Not implemented yet
              </div>
              <div className="text disabled" style={{ gridColumn: 4, gridRow: 14 }}>
                Not implemented yet
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}
export default PersonalDetails;
