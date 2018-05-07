import * as React from "react";
import {Component} from "react";
import { Link } from "react-router-dom";

class Dashboard extends Component {

  setApp(appname) {
    console.log(appname)
    this.props.setapp(appname)
  }

  goTo(view) {
    let gotoview = "/area/"+view
    this.props.history.push(gotoview)
  }

  render() {

    console.log("DASH", this.props)
    let bI = this.props.profilpicture ? this.props.profilpicture : "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg"
    console.log(bI)
    return (
      <div>
        <div className="welcomeHolder">
          <div className="welcomeImage" style={{backgroundImage: `url(${bI})`}}></div>
          <div className="welcomeMessage"><span>Welcome back, {this.props.firstname} {this.props.lastname}</span></div>
        </div>

        <div className="useableApps">
          <div className="useableAppsTitle">Just click on a service to start</div>
          <img className="useableAppsLogo" onClick={() => (this.setApp("pipedrive"))}
          src="https://storage.googleapis.com/vipfy-imagestore-01/logos/pipedrive.png" />
          <img className="useableAppsLogo" onClick={() => (this.setApp("slack"))}
          src="https://storage.googleapis.com/vipfy-imagestore-01/logos/slack.svg" />
        </div>
        <div className="recommendedApps">
          <div className="recommendedAppsTitle">We belive you also need these services</div>
          <img className="recommendedAppsLogo" onClick={() => (this.goTo("marketplace"))}
          src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png" />
          <img className="recommendedAppsLogo" onClick={() => (this.goTo("marketplace"))}
          src="https://storage.googleapis.com/vipfy-imagestore-01/logos/wave.png" />
        </div>
        <Link to="/area/webview">LINK</Link>
      </div>
    );
  }
}

export default Dashboard;
