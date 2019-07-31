import * as React from "react";
import { Component } from "react";
import HeaderNotificationContext from "./headerNotificationContext";
import HeaderNotificationItem from "./headerNotificationItem";
import { setHeaderNotification, setDismissHeaderNotification } from "./../../networkInterface";

interface Props {}
interface State {
  notifications: Object[];
  pastnotifications: Object[];
}

class HeaderNotificationProvider extends Component<Props, State> {
  state = {
    notifications: [],
    pastnotifications: []
  };

  componentDidMount() {
    setHeaderNotification((message, key) => {
      this.addHeaderNotification(message, { key: key, noDuplicates: true, type: "error" });
    });
    setDismissHeaderNotification((key, redoable) => this.dismissHeaderNotification(key, redoable));
  }

  addHeaderNotification = (
    message,
    { key, noDuplicates = true, ...options }: { key?: String; noDuplicates?: Boolean } = {}
  ) => {
    if (
      noDuplicates &&
      (this.state.notifications.findIndex(n => n.key == key) > -1 ||
        this.state.pastnotifications.findIndex(n => n.key == key) > -1)
    ) {
      return null;
    }

    //close old notification
    if (this.state.notifications.length > 0) {
      this.setState(({ notifications }) => {
        notifications[0].open = false;
        return {
          notifications: notifications
        };
      });
      return setTimeout(() => this.addHeaderNotificationFinish(message, key, options), 400);
    } else {
      return this.addHeaderNotificationFinish(message, key, options);
    }
  };

  addHeaderNotificationFinish = (message, key, options) => {
    const keyid = key || new Date().getTime() + Math.random();

    const notification = {
      key: keyid,
      message,
      ...options,
      time: new Date().getTime(),
      open: true
    };

    this.setState(({ notifications }) => {
      function getOrderNum(type) {
        switch (type) {
          case "error":
            return 0;
          case "warning":
            return 1;
          default:
            return 2;
        }
      }

      let notificationadded = [
        ...notifications.map(n => {
          n.open = false;
          return n;
        }),
        notification
      ];
      notificationadded.sort(function(
        a: { type?: String; time: number },
        b: { type?: String; time: number }
      ) {
        const typeorder = getOrderNum(a.type) - getOrderNum(b.type);
        if (typeorder == 0) {
          return a.time - b.time;
        } else {
          return typeorder;
        }
      });
      return {
        notifications: notificationadded
      };
    });

    return keyid;
  };

  dismissHeaderNotification = (key, redoable = false) => {
    this.setState(({ notifications }) => ({
      notifications: notifications.map(item =>
        !key || item.key === key ? { ...item, open: false } : { ...item }
      )
    }));
    setTimeout(() => this.handleExitedHeaderNotification(key, redoable), 400);
  };

  handleExitedHeaderNotification = (key, redoable) => {
    this.setState(({ notifications, pastnotifications }) => {
      const remaining = notifications.filter(item => item.key !== key);
      if (remaining[0]) {
        remaining[0].open = true;
      }
      if (redoable) {
        return {
          notifications: remaining
        };
      } else {
        return {
          notifications: remaining,
          pastnotifications: [...pastnotifications, notifications.find(n => n.key == key)]
        };
      }
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.children !== nextProps.children) {
      return true;
    }
    if (this.state.notifications.length !== nextState.notifications.length) {
      return true;
    }
    if (
      this.state.notifications !== nextState.notifications &&
      JSON.stringify(this.state.notifications) !== JSON.stringify(nextState.notifications)
    ) {
      return true;
    }

    return false;
  }

  functions = {
    addHeaderNotification: this.addHeaderNotification,
    dismissHeaderNotification: this.dismissHeaderNotification
  };

  render() {
    const { notifications } = this.state;
    return (
      <HeaderNotificationContext.Provider
        value={{
          ...this.functions,
          isActive:
            this.state.notifications &&
            this.state.notifications[0] &&
            this.state.notifications[0].open
        }}>
        <div
          className={`headerInformationHolder ${
            notifications && notifications[0] && notifications[0].open ? "open" : ""
          }`}>
          {notifications && notifications[0] && (
            <HeaderNotificationItem
              key={notifications[0].key}
              notification={notifications[0]}
              dismiss={() => this.dismissHeaderNotification(notifications[0].key)}
              show={true}
            />
          )}
        </div>
        {this.props.children}
      </HeaderNotificationContext.Provider>
    );
  }
}

export default HeaderNotificationProvider;
