import * as React from "react";

interface Props {
  showPopup: Function;
}

interface State {
  show: Boolean;
}

class DShower extends React.Component<Props, State> {
  state = {
    show: true
  };

  element: HTMLDivElement | null = null;
  timeout = null;

  calculateTop = (element, addedmargin, middle = 1) => {
    let top = addedmargin + element.offsetTop + (middle * element.offsetHeight) / 2;
    if (element.offsetParent != document.body) {
      top += this.calculateTop(element.offsetParent, 0, 0);
    }
    console.log("TOP", top);
    return top;
  };

  calculateLeft = (element, addedmargin, middle = 1, right = false) => {
    let left = addedmargin + element.offsetLeft + (middle * element.offsetWidth) / 2;
    if (element.offsetParent != document.body) {
      left += this.calculateLeft(element.offsetParent, 0, 0);
    }
    if (right) {
      left -= 230;
    }
    return left;
  };

  render() {
    return (
      <div className="genericPage employeeManager">
        <div className="genericPageName">
          <span>Departments</span>
          <i className="fal fa-search searchButtonHeading" />
        </div>
        <div className="genericOneLineHolder">
          <div
            style={{
              gridColumn: "1/6",
              position: "relative",
              textAlign: "left",
              backgroundColor: "#f5f5f5",
              height: "32px",
              lineHeight: "32px",
              fontWeight: 500,
              fontSize: "15px"
            }}>
            Nils Vossebein - CMO
          </div>
          <div className="headingOneLine" style={{ gridRow: 2, gridColumn: 2 }}>
            Departments
          </div>
          <div className="headingOneLine" style={{ gridRow: 2, gridColumn: 3 }}>
            Services
          </div>
          <div className="headingOneLine" style={{ gridRow: 2, gridColumn: 4 }}>
            Notifications
          </div>
          <div className="headingOneLine" style={{ gridRow: 2, gridColumn: 5, marginLeft: "10px" }}>
            More
          </div>
          <div
            className="circle40"
            style={{
              gridRow: "2/4",
              gridColumn: 1,
              position: "relative",
              backgroundImage:
                "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/07012019-xm5db-9b-jpg')"
            }}>
            <div style={{ position: "relative", left: "45px", height: "40px" }}>
              <div
                className="roundedNotification"
                style={{ backgroundColor: "#20BAA9", color: "#fff" }}>
                Online
              </div>
              <div
                className="roundedNotification"
                style={{ backgroundColor: "#d4af37", bottom: "0px", color: "#fff" }}>
                Admin
              </div>
            </div>
          </div>
          <div style={{ gridColumn: 2, gridRow: 3 }} className="genericFlexHolder">
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
            <div className="hex" style={{ backgroundColor: "#c73544", borderColor: "#c73544" }}>
              P
            </div>
          </div>
          <div className="genericFlexHolder" style={{ gridColumn: 3, gridRow: 3 }}>
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-t3es1-wunderlist-png')"
              }}
            />
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/pipedrive.png')"
              }}
            />
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-s9ysb-wrike-icon-jpg')"
              }}
            />
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-08rvj-smartlook-icon-jpg')"
              }}
            />
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/13102018-ephyv-webex-logo-jpg')"
              }}
            />
            <div
              className="box30 text"
              style={{
                marginRight: "5px",
                backgroundColor: "#20BAA9"
              }}
              title="<ul><li>ABC</li></ul>">
              +17
            </div>
          </div>

          <div style={{ gridColumn: 4, gridRow: 3 }}>
            <span className="genericError">One unsed Service!</span>
          </div>
          <div style={{ gridColumn: 5, gridRow: 3, marginLeft: "10px", cursor: "pointer" }}>
            <i className="fal fa-ellipsis-h-alt" />
          </div>
        </div>

        {/*safasf*/}

        <div className="genericOneLineHolder">
          <div
            style={{
              gridColumn: "1/6",
              position: "relative",
              textAlign: "left",
              backgroundColor: "#f5f5f5",
              height: "32px",
              lineHeight: "32px",
              fontWeight: 500,
              fontSize: "15px"
            }}>
            Markus Müller - CEO
          </div>
          <div className="headingOneLine" style={{ gridRow: 2, gridColumn: 2 }}>
            Departments
          </div>
          <div className="headingOneLine" style={{ gridRow: 2, gridColumn: 3 }}>
            Services
          </div>
          <div className="headingOneLine" style={{ gridRow: 2, gridColumn: 4 }}>
            Notifications
          </div>
          <div className="headingOneLine" style={{ gridRow: 2, gridColumn: 5, marginLeft: "10px" }}>
            More
          </div>
          <div
            className="circle40"
            style={{
              gridRow: "2/4",
              gridColumn: 1,
              position: "relative",
              backgroundImage:
                "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/28122018-ri1eb-markus-mueller-jpeg')"
            }}>
            <div style={{ position: "relative", left: "45px", height: "40px" }}>
              <div
                className="roundedNotification"
                style={{ backgroundColor: "#c73544", color: "#fff" }}>
                Offline
              </div>
            </div>
          </div>
          <div style={{ gridColumn: 2, gridRow: 3 }} className="genericFlexHolder">
            <div
              className="hex"
              style={{ backgroundColor: "#20baa9", borderColor: "#20baa9" }}
              title="Marketing">
              M
            </div>
          </div>
          <div className="genericFlexHolder" style={{ gridColumn: 3, gridRow: 3 }}>
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-t3es1-wunderlist-png')"
              }}
            />
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/pipedrive.png')"
              }}
            />
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-08rvj-smartlook-icon-jpg')"
              }}
            />
            <div
              className="box30"
              style={{
                marginRight: "5px",
                backgroundImage:
                  "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/13102018-ephyv-webex-logo-jpg')"
              }}
            />
          </div>

          <div style={{ gridColumn: 4, gridRow: 3 }}>
            <span className="genericError">Not online since two Weeks!</span>
          </div>
          <div style={{ gridColumn: 5, gridRow: 3, marginLeft: "10px", cursor: "pointer" }}>
            <i className="fal fa-ellipsis-h-alt" />
          </div>
        </div>
      </div>
    );
  }
}

export default DShower;
