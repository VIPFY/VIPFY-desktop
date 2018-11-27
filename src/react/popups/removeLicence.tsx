import * as React from "react";
import { Component } from "react";
import CoolCheckbox from "../components/CoolCheckbox";

interface Props {
  appname: string;
  username: string;
  teamname: string;
  onClose: Function;
  external: boolean;
  suspendLicence: Function;
  deleteLicenceAt: Function;
  licenceid: number;
  userid: number;
  remove: string;
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

  remove = () => {
    if (this.state.licence) {
      this.props.deleteLicenceAt(this.props.licenceid, this.props.userid);
    } else {
      this.props.suspendLicence(this.props.licenceid, this.props.userid);
    }
  };

  render() {
    console.log("Remove", this.props, this.state);

    if (this.props.remove) {
      return <div>Removing...</div>;
    }

    return (
      <div>
        <div className="genericHolder">
          <div className="header">
            <span>
              Remove access to {this.props.appname} ({this.props.teamname}) from{" "}
              {this.props.username}
            </span>
          </div>
          {this.props.external ? (
            ""
          ) : (
            <div className="switchHolder">
              {/*<div className="switchOption">Keep Data</div>
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
        <div className="switchOption">Delete Data</div>*/}

              <div className="generic-checkbox-holder">
                <input
                  type="checkbox"
                  className="cool-checkbox r-checkbox"
                  id="data"
                  defaultChecked={true}
                  onChange={e => this.setState({ data: e.target.checked })}
                />
                <label htmlFor="data" className="generic-form-checkbox remove-checkbox">
                  <svg width="18px" height="18px" viewBox="0 0 18 18">
                    <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                  <span>Delete Data</span>
                </label>
              </div>
            </div>
          )}
          <div className="switchHolder">
            {/*<div className="switchOption">Keep Licence</div>
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
    <div className="switchOption">Delete Licence</div>*/}

            <div className="generic-checkbox-holder">
              <input
                type="checkbox"
                className="cool-checkbox r-checkbox"
                id="licence"
                defaultChecked={true}
                onChange={e => this.setState({ licence: e.target.checked })}
              />
              <label htmlFor="licence" className="generic-form-checkbox remove-checkbox">
                <svg width="18px" height="18px" viewBox="0 0 18 18">
                  <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                  <polyline points="1 9 7 14 15 4" />
                </svg>
                <span>Terminate Licence at next possible date</span>
              </label>
            </div>
          </div>
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
            onClick={() => this.remove()}
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
