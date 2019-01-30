import * as React from "react";
import ErrorPopup from "../popups/errorPopup";
import GenericInputField from "../components/GenericInputField";
import EditFieldRDS from "../components/EditFieldRDS";

interface Props {
  showPopup: Function;
  isadmin: boolean;
}

interface State {
  show: Boolean;
  editnumber: number;
  editfield: string | null;
  editchanged: boolean;
}

class EGeneral extends React.Component<Props, State> {
  state = {
    show: true,
    editnumber: 0,
    editfield: null,
    editchanged: false
  };

  toggle = () => {
    this.setState(prevState => {
      return { show: !prevState.show };
    });
  };

  saveField = (id, value) => {
    console.log("SAVE", id, value);
    this.setState({ editnumber: 0 });
  };

  render() {
    const userdata = {
      online: true,
      admin: true,
      name: "Nils Vossebein",
      position: "CMO",
      birthday: "1994-03-05",
      hire: "01.05.18",
      contract: "infinite",
      boss: "Lisa Brödlin",
      email1: "nv@vipfy.store",
      email2: "nv@vipfy.com",
      email3: null,
      phone1: "0681-30264936",
      phone2: "0136-23589373",
      phone3: null,
      address11: "Hohenzollernstraße 17",
      zip: "66117",
      city: "Saarbrücken"
    };
    return (
      <div className="genericHolder egeneral">
        <div className="header" onClick={() => this.toggle()}>
          <i
            className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
            //onClick={this.toggle}
          />
          <span>Generel Information</span>
        </div>
        <div className={`inside ${this.state.show ? "in" : "out"}`}>
          <div className="inside-padding">
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
                  backgroundImage:
                    "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/07012019-xm5db-9b-jpg')"
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

              <div className="heading" style={{ gridRow: 4, gridColumn: 2 }}>
                Position:
              </div>
              <div className="text" style={{ gridRow: 5, gridColumn: 2 }}>
                {this.props.isadmin ? (
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
                )}
              </div>

              <div className="heading" style={{ gridRow: 7, gridColumn: 2 }}>
                Birthday:
              </div>
              <div className="text" style={{ gridRow: 8, gridColumn: 2 }}>
                {this.props.isadmin ? (
                  <EditFieldRDS
                    activeedit={this.state.editnumber}
                    editid={3}
                    original={userdata.birthday}
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

              <div className="heading disabled" style={{ gridRow: 13, gridColumn: 2 }}>
                Contract duration:
              </div>
              <div className="text disabled" style={{ gridRow: 14, gridColumn: 2 }}>
                Not implemented yet
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
                    zip={userdata.zip}
                    city={userdata.city}
                    onSave={v => this.saveField(14, v)}
                    setEditState={v => this.setState({ editnumber: v })}
                  />
                ) : (
                  <div>
                    <div className="twoLineContent">{userdata.address11}</div>
                    <div className="twoLineContent">{`${userdata.zip} ${userdata.city}`}</div>
                  </div>
                )}
              </div>

              <div className="text" style={{ gridColumn: 4, gridRow: 6 }}>
                <div>
                  <div className="twoLineContent">Campus A1-1</div>
                  <div className="twoLineContent">66123 Saarbrücken</div>
                </div>
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
          </div>
        </div>
      </div>
    );
  }
}

export default EGeneral;
