import * as React from "react";
import {Component} from "react";
import { Link } from "react-router-dom";

class Dashboard extends Component {

  setApp(appname) {
    this.props.setapp(appname)
  }

  goTo(view) {
    let gotoview = "/area/"+view
    this.props.history.push(gotoview)
  }

  render() {
    let bI = this.props.profilepicture ? this.props.profilepicture : "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg"
    return (
      <div className="fullWorking">
        <div className="welcomeHolder">
          <div className="welcomeImage" style={{backgroundImage: `url(${bI})`}}></div>
          <div className="welcomeMessage"><span>Welcome back, {this.props.firstname} {this.props.lastname}</span></div>
        </div>

        <div className="useableApps">
          <div className="useableAppsTitle">Just click on a service to start</div>
          <div className="useableAppsLogo" onClick={() => (this.setApp("pipedrive"))}
            style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/pipedrive.png)"}}>
            <span className="useableServiceName">Pipedrive</span>
          </div>
          <div className="useableAppsLogo" onClick={() => (this.setApp("slack"))}
            style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/slack.svg)"}}>
            <span className="useableServiceName">Slack</span>
          </div>
        </div>
        <div className="recommendedApps">
          <div className="recommendedAppsTitle">We belive you also need these services</div>
          <div className="recommendedAppsLogo" onClick={() => (this.goTo("marketplace"))}
          style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png)"}}>
            <span className="recommendedServiceName">Vipfy</span>
          </div>
          <div className="recommendedAppsLogo" onClick={() => (this.goTo("marketplace"))}
          style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/wave.png)"}}>
            <span className="recommendedServiceName">Wave</span>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
