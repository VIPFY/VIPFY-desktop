import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { AppContext } from "../../common/functions";

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

  listenKeyboard = e => {
    if (e.key === "Escape" || e.keyCode === 27 || e.key === "Enter" || e.keyCode === 13) {
      this.close("user");
    }
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
    window.addEventListener("keydown", this.listenKeyboard, true);
  };

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.setState({ tolong: false, saved: false, error: null });
    window.removeEventListener("keydown", this.listenKeyboard, true);
  }

  UNSAFE_componentWillReceiveProps = async props => {};

  close(action) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.props.closeFunction(action);
  }

  render() {
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
            <UniversalButton type="high" label="Ok" onClick={() => this.close("time")} />
          </>
        ) : this.state.error ? (
          <>
            <div>
              {this.props.errormessage ||
                "There was an error. Please try again or contact support."}
            </div>
            <AppContext.Consumer>
              {({ addRenderElement }) => (
                <UniversalButton
                  type="high"
                  label="Ok"
                  onClick={() => this.close("error")}
                  /*innerRef={el => addRenderElement({ key: "errorNext", element: el })}*/
                />
              )}
            </AppContext.Consumer>
          </>
        ) : this.state.saved ? (
          <div>
            <div style={{ fontSize: "32px", textAlign: "center" }}>
              <i style={{ color: "#20BAA9" }} className="fal fa-smile" />
              <div style={{ marginTop: "32px", fontSize: "16px" }}>
                {this.props.savedmessage || "Saved"}
              </div>
              <AppContext.Consumer>
                {context => (
                  <UniversalButton
                    type="high"
                    label="Continue"
                    onClick={() => this.close("sucess")}
                    customStyles={{ marginTop: "16px" }}
                    innerRef={el => context.addRenderElement({ key: "saved", element: el })}
                  />
                )}
              </AppContext.Consumer>
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
