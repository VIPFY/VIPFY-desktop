import * as React from "react";
import { Component } from "react";

class Popup extends Component {
  render() {
    return (
      <div className="popupBackground">
        <div className="popupFront">
          {this.props.type}
          <div onClick={() => this.props.close()}>CLOSE</div>
        </div>
      </div>
    );
  }
}
export default Popup;
