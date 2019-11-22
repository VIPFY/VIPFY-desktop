import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { FETCH_NOTIFICATIONS } from "../queries/notification";
import { filterError, ErrorComp } from "../common/functions";
import * as moment from "moment";
import * as ReactDOM from "react-dom";

const READ_NOTIFICATION = gql`
  mutation onReadNotification($id: ID!) {
    readNotification(id: $id)
  }
`;

const READ_ALL_NOTIFICATIONS = gql`
  mutation onReadAllNotifications {
    readAllNotifications
  }
`;

interface Props {
  moveTo: Function;
  sidebar: Object;
  data: any;
  refetch: Function;
  readNotification: Function;
  readAll: Function;
  style?: Object;
  closeme: Function;
  loading: Boolean;
}

interface State {
  loading: boolean;
  error: string;
  hover: boolean;
}

class Notification extends React.Component<Props, State> {
  state = {
    loading: false,
    error: "",
    hover: false
  };

  handleClickOnNotification(id /* , link */) {
    /* if(link) {
      this.props.moveTo(link);
    } */
    this.markAsRead(id);
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  }
  handleClickOutside = e => {
    const domNode = ReactDOM.findDOMNode(this);
    if (!domNode || !domNode.contains(e.target)) {
      this.props.closeme();
    }
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

  toggleHover = () => this.setState(prevState => ({ hover: !prevState.hover }));

  markAsRead = async id => {
    try {
      await this.setState({ loading: true });
      await this.props.readNotification({
        variables: { id },
        optimisticResponse: {
          __typename: "Mutation",
          readNotification: {
            __typename: "Notification",
            id
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

    return notifications.map(({ message, icon, sendtime, id, link }) => (
      <div className="notification-item" key={id} onClick={() => this.markAsRead(id)}>
        <span className={`fas fa-${icon} notification-icon ${icon == "bug" ? "bug" : ""}`} />
        <p className="notificationText">{message}</p>
        <div className="notificationTime">{moment(sendtime - 0).format("LLL")}</div>
      </div>
    ));
  }

  render() {
    const { data } = this.props;
    const dataLength = data.fetchNotifications ? data.fetchNotifications.length : 0;
    const dataExists = dataLength > 0;
    const refetchButton = (
      <button
        className="naked-button"
        type="button"
        onClick={this.fetchNotifications}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}>
        <i className={`fas fa-sync ${this.state.hover ? "fa-spin" : ""}`} />
      </button>
    );

    return (
      <div className="notificationPopup" style={this.props.style}>
        <div className="notificationPopupHeader">
          {`You have ${dataExists ? dataLength : "no"} new notification${
            dataLength == 1 ? "" : "s"
          }`}
          {!dataExists && refetchButton}
        </div>

        <div className="notificationPopupScroller">
          {dataExists && this.renderNotifications(data.fetchNotifications)}
        </div>

        {dataExists && (
          <React.Fragment>
            <div className="notificationPopupFooter">
              <span>Synchronize: </span>
              {refetchButton}
            </div>
            <div className="notificationPopupFooter">
              <span>Clear Notifications:</span>
              <button className="button-sync" type="button" onClick={this.markAllAsRead}>
                <i className="fas fa-trash-alt" />
              </button>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default compose(
  graphql(READ_NOTIFICATION, { name: "readNotification" }),
  graphql(READ_ALL_NOTIFICATIONS, { name: "readAll" })
)(Notification);
