import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";

interface Props {
  savingmessage: String;
  savedmessage: String;
  closeFunction: Function;
  maxtime?: number;
  fullmiddle?: Boolean;
  saveFunction: Function;
  errormessage?: String;
}

interface State {
  tolong: Boolean;
  saved: Boolean;
  error: string | null;
}

class PopupSelfSaving extends React.Component<Props, State> {
  state = {
    tolong: false,
    saved: false,
    error: null
  };

  componentDidMount = async () => {
    try {
      await this.props.saveFunction();
      this.setState({ saved: true });
    } catch (err) {
      this.setState({ error: err });
      console.error("ERROR", err);
      //throw Error(err);
    }
  };

  componentWillReceiveProps = async props => {};

  close() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.props.closeFunction();
  }

  render() {
    console.log("PROPS", this.props);
    if (this.props.maxtime) {
      this.timeout = setTimeout(() => {
        if (!this.state.saved && !this.state.error) {
          this.setState({ tolong: true });
        }
      }, this.props.maxtime);
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
        ) : this.state.error ? (
          <>
            <div>
              {this.props.errormessage ||
                "There was an error. Please try again or contact support."}
            </div>
            <UniversalButton type="high" label="Ok" onClick={() => this.close()} />
          </>
        ) : this.state.saved ? (
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
export default PopupSelfSaving;
