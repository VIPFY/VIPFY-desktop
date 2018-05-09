import * as React from "react";
import {Component} from "react";

class Navigation extends Component {

  setApp(appname) {
    this.props.setapp(appname)
  }

  goTo(view) {
    let gotoview = "/area/"+view
    this.props.history.push(gotoview)
  }

  render() {
    return (
      <div className="navigation">
        <div className="navigationLogoHolder">
          <img className="navigationLogo" onClick={() => (this.goTo("dashboard"))}
          src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png" />
        </div>
        <div className="appLogoHolder">
          <div className="appLogo" onClick={() => (this.setApp("pipedrive"))}
            style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/pipedrive.png)"}}>
          </div>
          <div className="appLogo" onClick={() => (this.setApp("slack"))}
            style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/slack.svg)"}}>
          </div>
        </div>
        <div className="searchbarHolder">
          <input className="searchbar" placeholder="Search for something..."/>
          <div className="searchbarButton"><i className="fas fa-search"></i></div>
        </div>
        <div className="navigationButtonHolder">
          {this.props.admin ? <div className="navigationButton"
            onClick={() => (this.goTo("billing"))}><i className="fas fa-dollar-sign"></i></div> : ""}
          <div className="navigationButton" onClick={() => (this.goTo("marketplace"))}><i className="fas fa-shopping-cart"></i></div>
          <div className="navigationButton" onClick={() => (this.goTo("settings"))}><i className="fas fa-cog"></i></div>
          <div className="navigationButton" onClick={() => (this.props.logMeOut())}>
            <i className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </div>
    );
  }
}

export default Navigation;
