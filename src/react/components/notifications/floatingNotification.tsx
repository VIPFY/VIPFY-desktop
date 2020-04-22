import * as React from "react";
import PrintServiceSquare from "../manager/universal/squares/printServiceSquare";
import UniversalButton from "../universalButtons/universalButton";
interface Props {
  disabled?: boolean;
  service?: any;
  vipfyTask?: any;
  title: string;
  text?: string;
  progress?: number;
  button?: any;
  close: Function;
  autoclose?: number | boolean;
}
interface State {}
class FloatingNotification extends React.Component<Props, State> {
  closingTimer = null;

  componentDidMount() {
    if (this.props.autoclose || this.props.autoclose == undefined) {
      this.closingTimer = setInterval(() => this.props.close(), this.props.autoclose || 5000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.closingTimer);
  }

  render() {
    return (
      <div
        className={`floatingNotification ${this.props.disabled ? "disabled" : "useable"} ${
          this.props.failed ? "failed" : ""
        }`}>
        {!this.props.disabled && (
          <div className="closeButton" onClick={() => this.props.close()}>
            <i className="fal fa-times"></i>
          </div>
        )}
        <div
          className="header"
          style={(this.props.vipfyTask && this.props.vipfyTask.headerStyles) || {}}>
          {this.props.service ? (
            <PrintServiceSquare
              service={this.props.service}
              appidFunction={e => e}
              size={16}
              additionalStyles={
                this.props.disabled
                  ? { marginTop: "0px", marginRight: "8px", opacity: 0.5 }
                  : { marginTop: "0px", marginRight: "8px" }
              }
            />
          ) : this.props.vipfyTask ? (
            <i
              className={`fal fa-${this.props.vipfyTask.icon} vipfyTaskIcon`}
              style={Object.assign(this.props.vipfyTask.iconStyles || {}, { marginRight: "8px" })}
            />
          ) : (
            ""
          )}
          <span>
            {(this.props.vipfyTask && this.props.vipfyTask.name) ||
              (this.props.service && this.props.service.name) ||
              "Notification"}
          </span>
        </div>
        <div className="notificationText">
          <div className="title">{this.props.title}</div>
          {this.props.text && <span>{this.props.text}</span>}
          {this.props.progress != undefined && this.props.progress != null && (
            <div>
              <div className="progressText">
                {this.props.progress.count != 0 ? `${this.props.progress.count}%` : "Loading..."}
              </div>
              <div className="progressHolder">
                <div
                  className="progressBar"
                  style={{
                    width: this.props.progress.count * 2
                  }}></div>
              </div>
            </div>
          )}
          {this.props.button && (
            <div className="buttonHolder">
              <UniversalButton
                label={this.props.button.label}
                onClick={this.props.button.onClick}
                type="high"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}
export default FloatingNotification;
