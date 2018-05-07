import * as React from "react";
import {Component} from "react";

class Navigation extends Component<undefined, undefined> {

  setApp(appname) {
    console.log(appname)
    this.props.setapp(appname)
  }

  render() {
    console.log("NAVI", this)
    return (
      <div className="navigation">
        <div className="navigationLogoHolder">
          <img className="navigationLogo" src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png" />
        </div>
        <div className="searchbarHolder">
          <input className="searchbar" placeholder="Search for something..."/>
          <div className="searchbarButton"><i className="fas fa-search"></i></div>
        </div>
        <div className="navigationButtonHolder">
          <div className="navigationButton"><i className="fas fa-cog"></i></div>
          <div className="navigationButton" onClick={() => (this.setApp("123"))}><i className="fas fa-sign-out-alt"></i></div>
        </div>
      </div>
    );
  }
}

export default Navigation;
