import * as React from "react";
import { Query, Mutation, Subscription } from "react-apollo";
import gql from "graphql-tag";
import Message from "./Message";
import MessageReadIndicators from "./MessageReadIndicators";
import UserPicture from "../UserPicture";
import UserName from "../UserName";
import { QUERY_DIALOG } from "./common";

const MESSAGE_SUBSCRIPTION = gql`
  subscription onNewMessage($groupid: ID!) {
    newMessage(groupid: $groupid) {
      id
      sendtime
      messagetext
      payload
      deletedat
      modifiedat
      sender {
        id
      }
    }
  }
`;

class Conversation extends React.Component<{ groupid: number; userid: number }, {}> {
  // componentWillMount() {
  //   this.props.data.subscribeToMore({
  //     document: MESSAGE_SUBSCRIPTION,
  //     variables: {
  //       groupid: this.props.groupid
  //     },
  //     updateQuery: (prev, { subscriptionData }) => {
  //       if (!subscriptionData.data) {
  //         return prev;
  //       }
  //
  //       const newMessage = subscriptionData.data.messageAdded;
  //       console.log(prev);
  //       if (!prev.channel.messages.find((msg) => msg.groupid == newMessage.groupid)) {
  //         return Object.assign({}, prev, {
  //
  //         })
  //       }
  //     }
  //   });
  // }

  // componentDidMount() {
  //   this.props.subscribeToNewMessages();
  // }

  render() {
    if (this.props.groupid === undefined || this.props.groupid === null) {
      return <span>Select a conversation on the left to view it here</span>;
    }

    return (
      <Query query={QUERY_DIALOG} variables={{ groupid: this.props.groupid }}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) {
            return "Loading...";
          }

          if (error) {
            return "Error loading messages";
          }

          {
            /* const subscribeToNewMessages = () =>
            subscribeToMore({
              document: MESSAGE_SUBSCRIPTION,
              variables = { groupid: this.props.groupid },
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                const newMessage = subscriptionData.data.newMessage;
                console.log("--prev-->", prev);
                console.log("sub-->", subscriptionData);
                return Object.assign({}, prev, {});
              }
            }); */
          }

          return (
            <ol
              style={{
                height: "auto",
                width: "100%",
                padding: 0,
                listStyle: "none"
              }}>
              {data.fetchDialog.map(message => {
                const isMe = message.sender && message.sender.id == this.props.userid;
                return (
                  <li style={{ paddingBottom: "10px" }} key={"conversationKey" + message.id}>
                    <div style={{ width: "400px", marginLeft: isMe ? "auto" : 0, display: "flex" }}>
                      <UserPicture
                        {...this.props}
                        unitid={message.sender ? message.sender.id : undefined}
                        size="twolines"
                      />
                      <div>
                        <UserName
                          {...this.props}
                          unitid={message.sender ? message.sender.id : undefined}
                          short={true}
                        />: <Message {...this.props} message={message} />
                      </div>
                    </div>

                    <div style={{ marginLeft: "auto", width: "2em" }}>
                      <MessageReadIndicators {...this.props} messageid={message.id} />
                    </div>
                  </li>
                );
              })}
              {/* <Subscription
                  subscription={MESSAGE_SUBSCRIPTION}
                  variables={{ groupid: this.props.groupid }}>
                  {zeugs => {
                    console.log(zeugs);
                    const { data, loading, error } = zeugs;
                    console.log("---->", data);
                    console.info("--error->", error);
                    if (data) {
                      return (
                        <li style={{ paddingBottom: "10px" }} key={"conversationKey" + message.id}>
                          <div
                            style={{
                              width: "400px",
                              marginLeft: isMe ? "auto" : 0,
                              display: "flex"
                            }}>
                            <UserPicture
                              {...this.props}
                              unitid={message.sender ? message.sender.id : undefined}
                              size="twolines"
                            />
                            <div>
                              <UserName
                                {...this.props}
                                unitid={message.sender ? message.sender.id : undefined}
                                short={true}
                              />: <Message {...this.props} message={message} />
                            </div>
                          </div>

                          <div style={{ marginLeft: "auto", width: "2em" }}>
                            <MessageReadIndicators {...this.props} messageid={message.id} />
                          </div>
                        </li>
                      );
                    } else {
                      return "";
                    }
                  }}
                </Subscription> */}
            </ol>
          );
        }}
      </Query>
    );
  }
}

export default Conversation;
