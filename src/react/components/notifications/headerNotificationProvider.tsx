import * as React from "react";
import HeaderNotificationContext from "./headerNotificationContext";
import HeaderNotificationItem from "./headerNotificationItem";
import { setHeaderNotification, setDismissHeaderNotification } from "../../networkInterface";
import { version } from "../../../../package.json";
import { satisfies } from "semver";
import { now } from "moment";

interface Props {}
interface State {
  notifications: Object[];
  pastnotifications: Object[];
}

class HeaderNotificationProvider extends React.Component<Props, State> {
  state = {
    notifications: [],
    pastnotifications: []
  };

  componentDidMount() {
    setHeaderNotification(async (message, options) => {
      await this.addHeaderNotification(message, { noDuplicates: true, ...options });
    });
    setDismissHeaderNotification((key, redoable) => this.dismissHeaderNotification(key, redoable));
  }

  componentWillMount = async () => {
    try {
      let response = await fetch("https://vipfy.store/maintenance.json");
      let responseJson = await response.json();

      for (let i = 0; i < responseJson.length; i++) {
        const element = responseJson[i];
        if (
          (element.version && !satisfies(version, element.version, { includePrerelease: true })) ||
          (element.timefrom != null && element.timefrom > now()) ||
          (element.timetill != null && element.timetill <= now())
        ) {
          continue;
        }
        this.addHeaderNotification(element.message, { ...element });
      }
    } catch (error) {
      console.log(error);
    }
  };

  addHeaderNotification = async (
    message,
    { key, noDuplicates = true, ...options }: { key?: String; noDuplicates?: Boolean } = {}
  ) => {
    const keyid = key || new Date().getTime() + Math.random();

    const notification = {
      key: keyid,
      message,
      ...options,
      time: new Date().getTime(),
      open: true
    };

    let opennew = false;
    await this.setState(({ notifications, pastnotifications }) => {
      console.log(pastnotifications);
      if (
        noDuplicates &&
        ((notifications && notifications.findIndex(n => n && n.key == key) > -1) ||
          (pastnotifications && pastnotifications.findIndex(n => n && n.key == key) > -1))
      ) {
        return;
      }

      function getOrderNum(type) {
        switch (type) {
          case "servermessage":
            return 0;
          case "impersonation":
            return 1;
          case "error":
            return 2;
          case "warning":
            return 3;

          default:
            return 4;
        }
      }

      let notificationadded = [...notifications, notification];
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

      opennew = true;

      return { notifications: notificationadded, pastnotifications };
    });
    if (opennew) {
      if (this.state.notifications.length > 1) {
        if (!this.state.notifications[0].open) {
          this.setState(
            ({ notifications }) => {
              notifications.map(n => {
                n.open = false;
                return n;
              });
              notifications[0].open = true;
              return { notifications };
            },
            () => {
              setTimeout(() => {
                this.setState(({ notifications }) => {
                  notifications[0].open = true;
                  return { notifications: notifications };
                });
              }, 400);
            }
          );
        }
      } else {
        this.setState(({ notifications }) => {
          notifications[0].open = true;
          return { notifications };
        });
      }
    }
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
        const exited = notifications.find(n => n.key == key);
        return {
          notifications: remaining,
          pastnotifications: [...pastnotifications, exited ? exited : null]
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
