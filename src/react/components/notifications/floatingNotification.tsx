import * as React from "react";
import { withApollo } from "react-apollo";
import gql from "graphql-tag";
import { shell } from "electron";
import PrintServiceSquare from "../manager/universal/squares/printServiceSquare";
import UniversalButton from "../universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import { renderNotificatonMessage } from "../../common/functions";
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
  failed: boolean | null;
  client: any;
}
interface State {
  popup: JSX.Element | null;
}
class FloatingNotification extends React.Component<Props, State> {
  state = { popup: null };
  closingTimer = null;

  componentDidMount() {
    if (this.props.autoclose || this.props.autoclose == undefined) {
      this.closingTimer = setInterval(() => this.props.close(), this.props.autoclose || 5000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.closingTimer);
  }

  executeNotificationAction(action) {
    if (!action || !action.action) {
      return;
    }

    if (action.action == "selectNumber") {
      this.setState({
        popup: (
          <PopupBase small={true}>
            <h2>{action.text}</h2>
            <div style={{ marginTop: "24px" }}>
              <input type="number" name="numberinput" />
            </div>
            <UniversalButton
              type="high"
              onClick={async () => {
                // not a nice way to get the number
                const number = document.querySelector("input[name=numberinput]").value;

                await this.props.client.mutate({
                  mutation: gql`
                    mutation respondToNotification($id: ID!, $data: JSON!) {
                      respondToNotification(id: $id, data: $data)
                    }
                  `,
                  variables: {
                    id: action.messageid,
                    data: { number }
                  }
                });
                this.setState({ popup: null });
              }}
              label="Ok"
            />
          </PopupBase>
        )
      });
    } else {
      this.setState({
        popup: (
          <PopupBase small={true}>
            <h2>Action not supported</h2>
            <div style={{ marginTop: "24px" }}>
              Sorry, this action is not supported by your current version of VIPFY. Please try
              downloading the current version at{" "}
              <div
                className="fancy-link"
                style={{ color: "#20baa9" }}
                onClick={() => shell.openExternal("https://vipfy.store/download")}>
                https://vipfy.store/download
              </div>
              or contact support.
            </div>
            <UniversalButton
              type="high"
              onClick={() => this.setState({ popup: null })}
              label="Ok"
            />
          </PopupBase>
        )
      });
    }
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
          {this.props.text && (
            <span>{renderNotificatonMessage(this.props.text, this.props.client)}</span>
          )}
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
                onClick={() => this.executeNotificationAction(this.props.button.onClick)}
                type="high"
              />
            </div>
          )}
          {this.state.popup}
        </div>
      </div>
    );
  }
}
export default withApollo(FloatingNotification);
