import * as React from "react";
import FloatingNotification from "./floatingNotification";
import gql from "graphql-tag";
interface Props {
  sidebarOpen: boolean;
  data: any;
  subscribeToMore: Function;
}
interface State {
  initialLoad: boolean;
}

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription onNewNotification {
    newNotification {
      id
      sendtime
      message
      icon
      changed
      link
      options
      type
    }
  }
`;
class FloatingNotifications extends React.Component<Props, State> {
  state = {
    initialLoad: true
  };
  floatingNotifications = [];

  componentDidMount() {
    this.props.subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data || subscriptionData.error) {
          return prev;
        }

        if (
          subscriptionData.data.newNotification &&
          subscriptionData.data.newNotification.options &&
          subscriptionData.data.newNotification.options.type != "update"
        ) {
          const newNot = subscriptionData.data.newNotification;
          this.floatingNotifications.push({
            id: newNot.id,
            time: newNot.sendtime,
            data: newNot,
            element: (
              <FloatingNotification
                key={newNot.id}
                title="Status Update"
                vipfyTask={{
                  icon: newNot.icon,
                  name: "VIPFY"
                }}
                text={newNot.message}
                close={() => {
                  this.floatingNotifications.splice(
                    this.floatingNotifications.findIndex(e => e.id == newNot.id),
                    1
                  );
                  this.forceUpdate();
                }}
                progress={newNot.options && newNot.options.progress}
                button={newNot.options && newNot.options.button}
                autoclose={newNot.options && newNot.options.autoclose}
              />
            )
          });

          return {
            ...prev,
            fetchNotifications: [subscriptionData.data.newNotification, ...prev.fetchNotifications]
          };
        } else {
          const updateNot = subscriptionData.data.newNotification;

          const updateElement = this.floatingNotifications.find(fn => fn.id == updateNot.id);
          if (updateElement) {
            const updatedElement = {
              data: { ...updateElement.data, ...updateNot },
              element: (
                <FloatingNotification
                  key={updateElement.data.id}
                  title="Status Update"
                  vipfyTask={{
                    icon: updateNot.icon || updateElement.data.icon,
                    name: "VIPFY"
                  }}
                  text={updateNot.message || updateElement.data.message}
                  close={() => {
                    this.floatingNotifications.splice(
                      this.floatingNotifications.findIndex(e => e.id == updateElement.data.id),
                      1
                    );
                    this.forceUpdate();
                  }}
                  progress={
                    (updateNot.options && updateNot.options.progress) ||
                    (updateElement.data.options && updateElement.data.options.progress)
                  }
                  button={
                    (updateNot.options && updateNot.options.button) ||
                    (updateElement.data.options && updateElement.data.options.button)
                  }
                  autoclose={
                    (updateNot.options && updateNot.options.autoclose) ||
                    (updateElement.data.options && updateElement.data.options.autoclose)
                  }
                />
              )
            };
            this.floatingNotifications.splice(
              this.floatingNotifications.findIndex(e => e.id == updateElement.data.id),
              1,
              updatedElement
            );
            this.forceUpdate();
          }
          return prev;
        }
        return prev;
      }
    });
  }

  render() {
    return (
      <div
        className="floatingNotificationsHolder"
        style={{ left: this.props.sidebarOpen ? "248px" : "56px" }}>
        {this.floatingNotifications.map(fn => fn && fn.element)}
      </div>
    );
  }
}
export default FloatingNotifications;
