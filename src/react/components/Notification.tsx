import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import { filterError, ErrorComp } from "../common/functions";

const READ_NOTIFICATION = gql`
  mutation onReadNotification($id: Int!) {
    readNotification(id: $id)
  }
`;

const READ_ALL_NOTIFICATIONS = gql`
  mutation onReadAllNotifications {
    readAllNotifications
  }
`;

interface Props {
  data: any;
  refetch: Function;
  readNotification: Function;
  readAll: Function;
}

interface State {
  loading: boolean;
  error: string;
}

class Notification extends React.Component<Props, State> {
  state = {
    loading: false,
    error: ""
  };

  fetchNotifications = async () => {
    try {
      await this.setState({ loading: true, error: "" });
      await this.props.refetch();
      await this.setState({ loading: false });
    } catch (err) {
      await this.setState({ loading: false, error: filterError(err) });
    }
  };

  markAsRead = async id => {
    try {
      await this.setState({ loading: true });
      await this.props.readNotification({
        variables: { id },
        optimisticResponse: {
          __typename: "Mutation",
          readNotification: {
            __typename: "Notification",
            id,
            ok: true
          }
        },
        update: proxy => {
          // Read the data from our cache for this query.
          const data = proxy.readQuery({ query: FETCH_NOTIFICATIONS });
          const updatedNotifications = data.fetchNotifications.filter(notification => {
            if (notification.id != id) {
              return notification;
            }
          });

          data.fetchNotifications = updatedNotifications;
          // Write our data back to the cache.
          proxy.writeQuery({ query: FETCH_NOTIFICATIONS, data });
        }
      });
      await this.setState({ loading: false });
    } catch (err) {
      await this.setState({ loading: false, error: filterError(err) });
    }
  };

  markAllAsRead = async () => {
    try {
      await this.setState({ loading: true });

      await this.props.readAll({
        optimisticResponse: {
          __typename: "Mutation",
          readAllNotifications: {
            __typename: "Notification"
          }
        },
        update: proxy => {
          // Read the data from our cache for this query.
          const data = proxy.readQuery({ query: FETCH_NOTIFICATIONS });

          data.fetchNotifications = [];
          // Write our data back to the cache.
          proxy.writeQuery({ query: FETCH_NOTIFICATIONS, data });
        }
      });

      await this.setState({ loading: false });
    } catch (err) {
      await this.setState({ loading: false, error: filterError(err) });
    }
  };

  renderNotifications(notifications) {
    if (this.state.error) {
      return <ErrorComp error={this.state.error} />;
    }

    return notifications.map(({ message, icon, sendtime, id }) => (
      <div className="notification-item" key={id} onClick={() => this.markAsRead(id)}>
        <span className={`fas fa-${icon} notificationIcon`} />
        <p className="notificationText">{message}</p>
        <div className="notificationTime">{sendtime}</div>
      </div>
    ));
  }

  render() {
    const { data } = this.props;
    const dataLength = data.fetchNotifications.length;
    const dataExists = dataLength > 0;

    return (
      <div className="notificationPopup">
        <div className="notificationPopupHeader">
          {`You have ${dataExists ? dataLength : "no"} new notification${
            dataLength == 1 ? "" : "s"
          }`}
        </div>

        <div className="notificationPopupScroller">
          {dataExists ? this.renderNotifications(data.fetchNotifications) : ""}
        </div>

        <div className="notificationPopupFooter">
          <span>Synced at: </span>
          <button
            className={`button-sync ${this.state.loading ? "spinner" : ""}`}
            type="button"
            onClick={this.fetchNotifications}>
            <i className="fas fa-sync" />
          </button>
        </div>

        <div className="notificationPopupFooter">
          <span>Read All</span>
          <button className="button-sync" type="button" onClick={this.markAllAsRead}>
            <i className="fas fa-check" />
          </button>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(READ_NOTIFICATION, { name: "readNotification" }),
  graphql(READ_ALL_NOTIFICATIONS, { name: "readAll" })
)(Notification);
