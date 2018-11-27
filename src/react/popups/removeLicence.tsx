import * as React from "react";
import { Component } from "react";

interface Props {
  appname: string;
  username: string;
  teamname: string;
  onClose: Function;
  external: boolean;
}

interface State {
  data: boolean;
  licence: boolean;
}

class RemoveLicence extends Component<Props, State> {
  state = {
    data: true,
    licence: true
  };

  render() {
    console.log("Remove", this.props, this.state);

    return (
      <div>
        <h4>
          Remove access to {this.props.appname} ({this.props.teamname}) from {this.props.username}
        </h4>
        {this.props.external ? (
          ""
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
        <div className="switchHolder">
          <div className="switchOption">Keep Licence</div>
          <div className="onoffswitch">
            <input
              type="checkbox"
              name="onoffswitch"
              className="onoffswitch-checkbox"
              id="licence"
              defaultChecked={true}
              onChange={e => this.setState({ licence: e.target.checked })}
            />
            <label className="onoffswitch-label" htmlFor="licence">
              <span className="onoffswitch-inner" />
              <span className="onoffswitch-switch" />
            </label>
          </div>

          <div className="switchOption">Delete Licence</div>
        </div>
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
            <span className="textButtonBeside">Remove Licence</span>
          </button>
        </div>
        {this.props.external ? (
          <div className="centerText">
            <div style={{ width: "50%", textAlign: "center", marginTop: "20px" }}>
              Since this is an external account, we can not delete the user in the service. Please
              do this on your own.
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default RemoveLicence;
