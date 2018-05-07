import * as React from "react";
import {Component} from "react";
import { Link } from "react-router-dom";

class Dashboard extends Component {

  render() {

    console.log("DASH", this.props)
    let bI = this.props.profilpicture ? this.props.profilpicture : "https://storage.googleapis.com/vipfy-imagestore-01/team-member/_DSC8277a.jpg"
    return (
      <div>
        <div className="welcomeHolder">
          <div className="welcomeImage" style={{backgroundImage: `url(${bI})}`}}></div>
          <div className="welcomeMessage">Welcome back, {this.props.firstname} {this.props.lastname}</div>
        </div>
        <Link to="/area/webview">LINK</Link>
      </div>
    );
  }
}

export default Dashboard;
