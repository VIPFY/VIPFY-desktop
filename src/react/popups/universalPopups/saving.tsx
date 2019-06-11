import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";

interface Props {
  finished: Boolean;
  savingmessage: String;
  savedmessage: String;
  error: String | null;
  closeFunction: Function;
  maxtime?: number;
  fullmiddle?: Boolean;
}

interface State {
  tolong: Boolean;
}

class PopupSaving extends React.Component<Props, State> {
  state = {
    tolong: false
  };

  componentWillReceiveProps = async props => {};

  close() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.props.closeFunction();
  }

  render() {
    if (this.props.maxtime) {
      this.timeout = setTimeout(() => this.setState({ tolong: true }), this.props.maxtime);
    }
    return (
      <PopupBase nooutsideclose={true} fullmiddle={this.props.fullmiddle} dialog={true}>
        {this.state.tolong ? (
          <>
            <div>
              This operation takes longer than expected. We will continue it in the background and
              inform you when it has finished.
            </div>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </>
        ) : this.props.error ? (
          <>
            <div>{this.props.error}</div>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </>
        ) : this.props.finished ? (
          <>
            <div>{this.props.savedmessage}</div>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </>
        ) : (
          <div>
            <div style={{ fontSize: "32px", textAlign: "center" }}>
              <i className="fal fa-spinner fa-spin" />
              <div style={{ marginTop: "32px", fontSize: "16px" }}>{this.props.savingmessage}</div>
            </div>
          </div>
        )}
      </PopupBase>
    );
  }
}
export default PopupSaving;
