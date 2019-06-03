import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import UniversalLoginExecutor from "../../components/UniversalLoginExecutor";
import { SSO } from "../../interfaces";

interface Props {
  closeFunction: Function;
  maxTime?: number;
  sso: SSO;
  fullmiddle?: Boolean;
  success: Boolean;
  error?: Object;
}

interface State {
  tolong: Boolean;
  saved: Boolean;
  progress: number;
}

class SelfSaving extends React.Component<Props, State> {
  state = {
    tolong: false,
    saved: false,
    progress: 0
  };

  close() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.props.closeFunction();
  }

  fullPath = path => `${__dirname}/../../../images/sso_creation_${path}.png`;

  render() {
    if (this.props.maxTime) {
      this.timeout = setTimeout(() => {
        if (!this.state.saved) {
          this.setState({ tolong: true });
        }
      }, this.props.maxTime);
    }

    return (
      <PopupBase styles={{ maxWidth: "432px" }} nooutsideclose={true} fullmiddle={true}>
        {this.state.tolong ? (
          <>
            <div>
              This operation takes longer than expected. We will continue it in the background and
              inform you when it has finished.
            </div>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </>
        ) : this.props.error ? (
          <div className="popup-sso">
            <img className="status-pic" src={this.fullPath("fail")} />
            <h3>
              We are sorry! The implementation was not successful. Please contact our support.
            </h3>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </div>
        ) : this.props.success ? (
          <div className="popup-sso">
            <img className="status-pic" src={this.fullPath("success")} />
            <h3>
              <span>Congratulations!</span>
              <span>Your Implementation was successful.</span>
            </h3>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </div>
        ) : (
          <div className="popup-sso">
            <img className="status-pic" src={this.fullPath("loading")} />
            <progress max="100" value={this.state.progress} />

            <div className="hide-sso-webview">
              <UniversalLoginExecutor
                loginUrl={this.props.sso.loginurl!}
                username={this.props.sso!.email!}
                password={this.props.sso.password!}
                partition={`self-sso-${this.props.sso.name}`}
                timeout={60000}
                takeScreenshot={false}
                setResult={result => {
                  console.log("Result: ", result);
                }}
                progress={progress => {
                  this.setState({ progress: progress * 100 });
                }}
              />
            </div>

            <h3>
              <span>Just a moment.</span>
              <span>We are verifying the Implementation.</span>
            </h3>
          </div>
        )}
      </PopupBase>
    );
  }
}
export default SelfSaving;
