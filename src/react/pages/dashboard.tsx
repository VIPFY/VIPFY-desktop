import * as React from "react";
import {Component} from "react";
import { Link } from "react-router-dom";

class Dashboard extends Component {

  render() {

    return (
      <div>DASHBOARD
        <Link to="/area/bug">LINK</Link>
      </div>
    );
  }
}

export default Dashboard;