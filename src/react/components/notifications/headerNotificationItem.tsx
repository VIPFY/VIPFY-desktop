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

    switch (type) {
      case "error":
        classes += " errorNotification";
        break;
      case "warning":
        classes += " warningNotification";
        break;
      default:
    }

    if (open && this.state && this.state.mounted) {
      classes += " open";
    }

    return (
      <div className={classes} style={this.props.show ? { zIndex: 1 } : { zIndex: 0 }}>
        <span>{message}</span>
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
