import * as React from "react";
import { Query, Mutation, Subscription } from "react-apollo";
import gql from "graphql-tag";

import Message from "./Message";
import MessageReadIndicators from "./MessageReadIndicators";
import UserPicture from "../UserPicture";
import UserName from "../UserName";
import LoadingDiv from "../LoadingDiv";

import { QUERY_DIALOG } from "./common";

interface Props {
  groupid: number;
  userid: number;
  subscribeToMore: Function;
  fetchDialog: object[];
}

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

class Conversation extends React.Component<Props, {}> {
  componentDidMount() {
    this.props.subscribeToMore({
      document: MESSAGE_SUBSCRIPTION,
      variables: {
        groupid: this.props.groupid
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data || subscriptionData.error) {
          console.log(subscriptionData);
          return prev;
        }

        const newMessage = subscriptionData.data.newMessage;
        if (!prev.fetchDialog.find(msg => msg.id == newMessage.id)) {
          return { ...prev, fetchDialog: [...prev.fetchDialog, newMessage] };
        }
      }
    });
  }

  render() {
    return (
      <ol className="conversation-list-main">
        {this.props.fetchDialog.map(message => {
          const isMe = message.sender && message.sender.id == this.props.userid;

          return (
            <li className="conversation-list-main-item" key={"conversationKey" + message.id}>
              <div
                className="conversation-list-main-item-content"
                style={{ marginLeft: isMe ? "auto" : 0 }}>
                <UserPicture
                  {...this.props}
                  unitid={message.sender ? message.sender.id : undefined}
                  size="twolines"
                />

                <div className="name-holder">
                  <UserName
                    {...this.props}
                    unitid={message.sender ? message.sender.id : undefined}
                    short={true}
                  />
                  <Message {...this.props} message={message} />
                </div>
              </div>

              <div className="conversation-list-main-item-read">
                <MessageReadIndicators {...this.props} messageid={message.id} />
              </div>
            </li>
          );
        })}
      </ol>
    );
  }
}

export default (props: { groupid: number; userid: number }): JSX.Element => {
  const { groupid } = props;

  if (groupid === undefined || groupid === null) {
    return <span>Select a conversation on the left to view it here</span>;
  }

  return (
    <Query query={QUERY_DIALOG} variables={{ groupid }}>
      {({ loading, error, data: { fetchDialog }, subscribeToMore }) => {
        if (loading) {
          return <LoadingDiv text="Fetching conversation..." />;
        }

        if (error) {
          return "Error loading messages";
        }

        return (
          <Conversation {...props} fetchDialog={fetchDialog} subscribeToMore={subscribeToMore} />
        );
      }}
    </Query>
  );
};
