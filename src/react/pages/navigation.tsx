import * as React from "react";
import {Component} from "react";

class Navigation extends Component<undefined, undefined> {

  render() {

    return (
      <div className="navigation">
        <div>
          <img className="navigationLogo" src="https://storage.googleapis.com/vipfy-imagestore-01/vipfy-logo.png" />
        </div>
        <div className="searchbarHolder">
          <input className="searchbar" placeholder="Search for something..."/>
          <div className="searchbarButton"><i className="fas fa-search"></i></div>
        </div>
        <div className="navigationButtonHolder">
          <div className="navigationButton"><i className="fas fa-cog"></i></div>
          <div className="navigationButton"><i className="fas fa-sign-out-alt"></i></div>
        </div>
      </div>
    );
  }
}

export default Navigation;
