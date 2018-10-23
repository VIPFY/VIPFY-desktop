import * as React from "react";
import { Component } from "react";
import GenericInputField from "../components/GenericInputField";

class BoughtplanView extends Component {
  state = {};

  render() {
    console.log("Loading", this.props);

    return (
      <div className="addEmployeeHolderP">
        <div className="field">
          <div className="label">Alias:</div>
          <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder={this.props.appname}
            onBlur={value => this.setState({ email: value })}
            default={this.props.appname}
          />
        </div>
        <div className="field">
          <div className="label">
            {this.props.app.licencesused > 0 ? (
              `${this.props.app.licencesused} licences out of ${this.props.app.licencestotal} used.`
            ) : (
              <span>
                No licence is used. <button>Delete boughtplan</button>
              </span>
            )}
          </div>
        </div>
        <div className="checkoutButton" onClick={() => this.save()}>
          Save Changes
        </div>
      </div>
    );
  }
}
export default BoughtplanView;
