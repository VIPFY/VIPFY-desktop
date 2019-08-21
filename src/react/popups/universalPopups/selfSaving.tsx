import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";

interface Props {
  savingmessage?: string;
  savedmessage?: string;
  closeFunction: Function;
  maxtime?: number;
  fullmiddle?: Boolean;
  saveFunction: Function;
  errormessage?: string;
  heading?: string;
  subHeading?: string;
  handleError?: Function;
  noInternalErrorShow?: Boolean;
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
      if (this.props.handleError) {
        this.props.handleError(err);
      }
      if (!this.props.noInternalErrorShow) {
        this.setState({ error: err });
      }
      console.error("ERROR", err);
    }
  };

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.setState({ tolong: false, saved: false, error: null });
  }

  UNSAFE_componentWillReceiveProps = async props => {};

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
    const { heading, subHeading } = this.props;
    return (
      <PopupBase nooutsideclose={true} small={true} additionalclassName="formPopup">
        <h1>{heading}</h1>
        {subHeading && <h2>{subHeading}</h2>}
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
          <div>
            <div style={{ fontSize: "32px", textAlign: "center" }}>
              <i style={{ color: "#20BAA9" }} className="fal fa-smile" />
              <div style={{ marginTop: "32px", fontSize: "16px" }}>
                {this.props.savedmessage || "Saved"}
              </div>
              <UniversalButton
                type="high"
                label="Continue"
                onClick={() => this.close()}
                customStyles={{ marginTop: "16px" }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "32px", textAlign: "center" }}>
              <i style={{ color: "#20BAA9" }} className="fal fa-spinner fa-spin" />
              <div style={{ marginTop: "32px", fontSize: "16px" }}>
                {this.props.savingmessage || "Saving"}
              </div>
            </div>
          </div>
        )}
      </PopupBase>
    );
  }
}
export default PopupSelfSaving;
