import * as React from "react";
import { Component } from "react";

class BoughtplanView extends Component {
  state = {};

  render() {
    console.log("Loading", this.props);

    return (
      <div>
        <input
          className="inputNew"
          value="Test"
          onChange={e => this.changeOption(i, e.target.value, plan)}
        />
      </div>
    );
  }
}
export default BoughtplanView;
