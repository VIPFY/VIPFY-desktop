import * as React from "react";
import { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

interface Props {
  notification: any;
  key: String;
  dismiss: Function;
  show: Boolean;
}
interface State {
  mounted: Boolean;
}

const PING_SERVER = gql`
  query {
    pingServer {
      ok
    }
  }
`;

class HeaderNotificationItem extends Component<Props, State> {
  state = { mounted: false };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  render() {
    const { message, type, open, dismissButton } = this.props.notification;

    let classes = "headerNotification";

    let icon = "";

    switch (type) {
      case "error":
        classes += " errorNotification";
        icon = "engine-warning";
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
          {this.props.notification.key == "network" && (
            <Query query={PING_SERVER} pollInterval={1 * 1000} fetchPolicy="network-only">
              {({ loading, error, data }) => {
                if (loading) {
                  return "";
                }
                if (error) {
                  return "";
                }
                if (data) {
                  this.props.dismiss();
                }
                return "";
              }}
            </Query>
          )}
        </div>
        {dismissButton && (
          <button
            className="naked-button headerNotificationButton"
            onClick={() => {
              if (dismissButton) {
                if (dismissButton.dismissFunction) {
                  dismissButton.dismissFunction();
                }
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
