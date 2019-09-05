import * as React from "react";
import { Component } from "react";

class AcceptLicence extends Component {
  state = { agreementError: false, agreement: false };

  openExternal(url) {
    require("electron").shell.openExternal(url);
  }

  accept() {
    if (this.state.agreement) {
      this.props.acceptFunction();
    } else {
      this.setState({ agreementError: true });
    }
  }

  showNeededCheckIns(options) {
    if (options.neededCheckIns) {
      let neededCheckInsArray: JSX.Element[] = [];
      options.neededCheckIns.forEach((element, key) => {
        neededCheckInsArray.push(
          <span
            key={`lawlink-${key}`}
            className="lawlink"
            onClick={() => this.openExternal(element.url)}>
            {element.name}
          </span>
        );
      });
      return (
        <div className="lawholder">
          <span className="lawheading">
            Please read the following third party agreements (external links)
          </span>
          {neededCheckInsArray}
        </div>
      );
    }
  }

  render() {
    return (
      <div className="acceptLicenceHolder">
        {this.showNeededCheckIns(this.props.neededCheckIns)}
        <div className="agreementBox">
          <input
            type="checkbox"
            className="cbx"
            id="CheckBox"
            style={{ display: "none" }}
            onChange={e => this.setState({ agreement: e.target.checked })}
          />
          <label htmlFor="CheckBox" className="check">
            <svg width="18px" height="18px" viewBox="0 0 18 18">
              <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
              <polyline points="1 9 7 14 15 4" />
            </svg>
            <span className="agreementSentence">
              I agree to the above third party agreements and to our Terms of Service and Privacy
              agreement regarding {this.props.appname}
            </span>
          </label>
          {this.state.agreementError ? (
            <div className="agreementError">Please agree to the agreements.</div>
          ) : (
            ""
          )}
        </div>
        <div className="checkOrderHolderButton">
          <button className="cancelButton" onClick={() => this.props.onClose()}>
            Cancel
          </button>
          <button className="checkoutButton" onClick={() => this.accept()}>
            Accept
          </button>
        </div>
      </div>
    );
  }
}
export default AcceptLicence;
