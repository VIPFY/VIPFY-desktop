import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { LoadingDiv } from "./LoadingDiv";
import { filterError } from "../common/functions";
import { FETCH_NOTIFICATIONS } from "../queries/notification";

const READ_NOTIFICATION = gql`
  mutation onReadNotification($id: Int!) {
    readNotification(id: $id)
  }
`;

class Notification extends React.Component {
  markAsRead = async id => {
    try {
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
        update: (proxy, { data: { readNotification } }) => {
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
    } catch (err) {
      console.log(err);
    }
  };

  renderNotifications(notifications) {
    return notifications.map(({ message, icon, sendtime, id }) => (
      <div className="notification-item" key={id} onClick={() => this.markAsRead(id)}>
        <span className={`fas fa-${icon} notificationIcon`} />
        <p className="notificationText">{message}</p>
        <div className="notificationTime">{sendtime}</div>
      </div>
    ));
  }

  render() {
    const { loading, error, data, refetch } = this.props;

    if (loading) {
      return <LoadingDiv text="Fetching Notifications..." />;
    }

    if (error) {
      return filterError(error);
    }

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
          <span style={{ cursor: "pointer" }} className="fas fa-sync" onClick={() => refetch()} />
        </div>
      </div>
    );
  }
}

export default graphql(READ_NOTIFICATION, { name: "readNotification" })(Notification);
