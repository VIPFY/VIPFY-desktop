import * as React from "react";

interface Props {}

interface State {
  show: Boolean;
}

class EGeneral extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = () => {
    this.setState(prevState => {
      return { show: !prevState.show };
    });
  };

  render() {
    const userdata = {
      online: true,
      admin: true,
      name: "Nils Vossebein",
      position: "CMO",
      birthday: "05.03.1994",
      hire: "01.05.18",
      contract: "infinite",
      boss: "Lisa Brödlin"
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
                }}
              />
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
                {userdata.name}
              </div>

              <div className="heading" style={{ gridRow: 4, gridColumn: 2 }}>
                Position:
              </div>
              <div className="text" style={{ gridRow: 5, gridColumn: 2 }}>
                {userdata.position}
              </div>

              <div className="heading" style={{ gridRow: 7, gridColumn: 2 }}>
                Birthday:
              </div>
              <div className="text" style={{ gridRow: 8, gridColumn: 2 }}>
                {userdata.birthday}
              </div>

              <div className="heading" style={{ gridRow: 10, gridColumn: 2 }}>
                Hire Date:
              </div>
              <div className="text" style={{ gridRow: 11, gridColumn: 2 }}>
                {userdata.hire} (1y-4m-23d)
              </div>

              <div className="heading" style={{ gridRow: 13, gridColumn: 2 }}>
                Contract duration:
              </div>
              <div className="text" style={{ gridRow: 14, gridColumn: 2 }}>
                {userdata.contract}
              </div>

              <div className="heading" style={{ gridRow: 1, gridColumn: 3 }}>
                E-Mail:
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 2 }}>
                nv@vipfy.store
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 3 }}>
                nv@vipfy.com
              </div>
              <div className="text link" style={{ gridColumn: 3, gridRow: 4 }}>
                and three more
              </div>

              <div className="heading" style={{ gridRow: 6, gridColumn: 3 }}>
                Phone:
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 7 }}>
                2348923498
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 8 }}>
                28082345
              </div>

              <div className="heading" style={{ gridColumn: 3, gridRow: 10 }}>
                Next Vacation
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 11 }}>
                21.02.19-01.03.19
              </div>
              <div className="text" style={{ gridColumn: 3, gridRow: 12 }}>
                05.05.19-26.05.19
              </div>

              <div className="heading" style={{ gridRow: 1, gridColumn: 4 }}>
                Address
              </div>

              <div className="text" style={{ gridColumn: 4, gridRow: 2 }}>
                Hohenzollernstraße 17
              </div>
              <div className="text" style={{ gridColumn: 4, gridRow: 3 }}>
                66117 Saarbrücken
              </div>

              <div className="text" style={{ gridColumn: 4, gridRow: 5 }}>
                Campus A1-1
              </div>
              <div className="text" style={{ gridColumn: 4, gridRow: 6 }}>
                66123 Saarbrücken
              </div>

              <div className="heading" style={{ gridColumn: 4, gridRow: 8 }}>
                Boss
              </div>
              <div className="text" style={{ gridColumn: 4, gridRow: 9 }}>
                {userdata.boss}
              </div>
              <div className="heading" style={{ gridColumn: 4, gridRow: 11 }}>
                Directly reports to
              </div>
              <div className="text" style={{ gridColumn: 4, gridRow: 12 }}>
                Lisa Brödlin
              </div>
              <div className="text" style={{ gridColumn: 4, gridRow: 13 }}>
                Simone Blaß
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EGeneral;
