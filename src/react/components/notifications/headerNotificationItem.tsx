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
  componentDidMount() {
    this.setState({ mounted: true });
  }

  render() {
    console.log("HeaderNotificationItem", this.props, this.state);

    const { message, type, open, dismissButton } = this.props.notification;

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
        <span>
          {<i className={`fal fa-${icon}`} style={{ marginRight: "16px" }} />}
          {message}
        </span>
        {dismissButton && (
          <button
            className="naked-button headerNotificationButton"
            onClick={() => this.props.dismiss()}>
            {dismissButton.label}
          </button>
        )}
      </div>
    );
  }
}

export default HeaderNotificationItem;
