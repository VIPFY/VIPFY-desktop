import * as React from "react";
import { Component } from "react";

interface Props {
  notification: any;
  key: String;
  dismiss: Function;
  show: Boolean;
}
interface State {
  mounted: Boolean;
}

class HeaderNotificationItem extends Component<Props, State> {
  state = { mounted: false };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  render() {
    const { message, type, open, dismissButton, dismissFunction } = this.props.notification;

    let classes = "headerNotification";

    let icon = "";

    switch (type) {
      case "error":
        classes += " errorNotification";
        icon = "times-circle";
        break;
      case "warning":
        classes += " warningNotification";
        icon = "exclamation-triangle";
        break;
      default:
        icon = "info-circle";
    }

    if (open && this.state && this.state.mounted) {
      classes += " open";
    }

    return (
      <div className={classes} style={this.props.show ? { zIndex: 1 } : { zIndex: 0 }}>
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
          <i className={`fal fa-${icon}`} style={{ marginRight: "16px", fontSize: "24px" }} />
          <span style={{ lineHeight: "40px" }}>{message}</span>
        </div>
        {dismissButton && (
          <button
            className="naked-button headerNotificationButton"
            onClick={() => {
              if (dismissFunction) {
                dismissFunction();
              }

              this.props.dismiss();
            }}>
            {dismissButton.label}
          </button>
        )}
      </div>
    );
  }
}

export default HeaderNotificationItem;
