import * as React from "react";
import SelfSearchBox from "../components/SelfSearchBox";
import EmployeeShower from "../components/EmployeeShower";

interface Props {
  showPopup: Function;
  moveTo: Function;
  toggleAdmin: Function;
  adminOpen: boolean;
}

interface State {
  show: Boolean;
}

class EManager extends React.Component<Props, State> {
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
        <div className="genericPageName" style={{ justifyContent: "space-between" }}>
          <span className="pageMainTitle">Employees</span>
          <SelfSearchBox placeholder="Search in Employee Manager" />
        </div>
        <EmployeeShower
          moveTo={this.props.moveTo}
          userdata={{
            profileimage:
              "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/07012019-xm5db-9b-jpg",
            name: "Nils Vossebein",
            position: "CMO",
            online: true,
            admin: true,
            departments: [
              { alias: "MG", name: "Marketing", color: "#9ad2e4" },
              { alias: "MA", name: "Management", color: "#8436b0" },
              { alias: "FE", name: "Entwicklung", color: "#ff8c45" },
              { alias: "D", name: "Domains", color: "#5145e3" },
              { alias: "UX", name: "UX-Design", color: "#2d84e6" },
              { alias: "Z", name: "Zusatz", color: "#29cc94" },
              { alias: "A", name: "Alles ein bisschen", color: "#df3f19" }
            ],
            services: [
              {
                name: "Wunderlist",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-t3es1-wunderlist-png"
              },
              {
                name: "Pipedrive",
                icon: "https://storage.googleapis.com/vipfy-imagestore-01/icons/pipedrive.png"
              },
              {
                name: "Webex",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/13102018-ephyv-webex-logo-jpg"
              },
              {
                name: "Wrike",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-s9ysb-wrike-icon-jpg"
              },
              {
                name: "Smartlook",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-08rvj-smartlook-icon-jpg"
              },
              {
                name: "Freshbooks",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/20092018-wkowl-freshbooks-icon-png"
              },
              {
                name: "Calendly",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/09012019-8pvtf-calendly-icon-png"
              }
            ],
            notificationmessage: "One unused Service!"
          }}
        />

        <EmployeeShower
          moveTo={this.props.moveTo}
          userdata={{
            profileimage:
              "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/28122018-ri1eb-markus-mueller-jpeg",
            name: "Markus Müller",
            position: "CEO",
            online: false,
            admin: false,
            departments: [
              { alias: "MG", name: "Marketing", color: "#9ad2e4" },
              { alias: "MA", name: "Management", color: "#8436b0" },
              { alias: "FE", name: "Entwicklung", color: "#ff8c45" },
              { alias: "D", name: "Domains", color: "#5145e3" },
              { alias: "UX", name: "UX-Design", color: "#2d84e6" },
              { alias: "Z", name: "Zusatz", color: "#29cc94" },
              { alias: "A", name: "Alles ein bisschen", color: "#df3f19" }
            ],
            services: [
              {
                name: "Wunderlist",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-t3es1-wunderlist-png"
              },
              {
                name: "Pipedrive",
                icon: "https://storage.googleapis.com/vipfy-imagestore-01/icons/pipedrive.png"
              },
              {
                name: "Webex",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/13102018-ephyv-webex-logo-jpg"
              },
              {
                name: "Wrike",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-s9ysb-wrike-icon-jpg"
              },
              {
                name: "Smartlook",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-08rvj-smartlook-icon-jpg"
              },
              {
                name: "Freshbooks",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/20092018-wkowl-freshbooks-icon-png"
              },
              {
                name: "Calendly",
                icon:
                  "https://storage.googleapis.com/vipfy-imagestore-01/icons/09012019-8pvtf-calendly-icon-png"
              }
            ],
            notificationmessage: "One unused Service!"
          }}
        />

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

export default EManager;
