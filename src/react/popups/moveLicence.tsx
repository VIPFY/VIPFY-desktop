import * as React from "react";
import { Component } from "react";

interface Props {
  appname: string;
  username: string;
  teamname: string;
  newusername: string;
  onClose: Function;
  external: boolean;
}

interface State {
  data: boolean;
}

class MoveLicence extends Component<Props, State> {
  state = {
    data: true
  };

  render() {
    console.log("Remove", this.props, this.state);

    return (
      <div>
        <h4>
          Move access of {this.props.appname} ({this.props.teamname}) from {this.props.username} to{" "}
          {this.props.newusername}
        </h4>
        {this.props.external ? (
          <div className="centerText">
            <div style={{ width: "50%", textAlign: "center", marginBottom: "20px" }}>
              Since this is an external account, we will simply move the existing account to the new
              user.
            </div>
          </div>
        ) : (
          <div className="switchHolder">
            <div className="switchOption">Keep Data</div>
            <div className="onoffswitch">
              <input
                type="checkbox"
                name="onoffswitch"
                className="onoffswitch-checkbox"
                id="data"
                defaultChecked={true}
                onChange={e => this.setState({ data: e.target.checked })}
              />
              <label className="onoffswitch-label" htmlFor="data">
                <span className="onoffswitch-inner" />
                <span className="onoffswitch-switch" />
              </label>
            </div>
            <div className="switchOption">Delete Data</div>
          </div>
        )}

        <div className="centerText">
          <button
            className="naked-button genericButton"
            onClick={() => this.props.onClose()}
            style={{ marginRight: "0.5em", backgroundColor: "#c73544" }}>
            <span className="textButton">
              <i className="fal fa-times" />
            </span>
            <span className="textButtonBesideLeft">Cancel</span>
          </button>
          <button
            className="naked-button genericButton"
            //onClick={() => this.addAccountTHIS()}
            style={{
              marginLeft: "0.5em"
            }}>
            <span className="textButton">
              <i className="fal fa-check" />
            </span>
            <span className="textButtonBeside">Move Licence</span>
          </button>
        </div>
      </div>
    );
  }
}
export default MoveLicence;
