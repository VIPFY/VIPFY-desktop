import * as React from "react";
import {Component} from "react";

class Navigation extends Component {

  setApp(appname) {
    console.log(appname)
    this.props.setapp(appname)
  }

  goTo(view) {
    let gotoview = "/area/"+view
    this.props.history.push(gotoview)
  }

  render() {
    console.log("NAVI", this)
    return (
      <div className="navigation">
        <div className="navigationLogoHolder">
          <img className="navigationLogo" onClick={() => (this.goTo("dashboard"))}
          src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png" />
        </div>
        <div className="appLogoHolder">
          <img className="appLogo" onClick={() => (this.setApp("pipedrive"))}
          src="https://storage.googleapis.com/vipfy-imagestore-01/logos/pipedrive.png" />
        </div>
        <div className="searchbarHolder">
          <input className="searchbar" placeholder="Search for something..."/>
          <div className="searchbarButton"><i className="fas fa-search"></i></div>
        </div>
        <div className="navigationButtonHolder">
          <div className="navigationButton"><i className="fas fa-cog"></i></div>
          <div className="navigationButton" onClick={() => (this.props.logMeOut())}>
            <i className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </div>
    );
  }
}

export default Navigation;
