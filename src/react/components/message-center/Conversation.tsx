import * as React from "react";
import { Query, Mutation, Subscription } from "react-apollo";
import gql from "graphql-tag";
import { union } from "lodash";

import FileUpload from "./FileUpload";
import Message from "./Message";
import NewMessage from "./NewMessage";
import MessageReadIndicators from "./MessageReadIndicators";
import UserPicture from "../UserPicture";
import UserName from "../UserName";
import LoadingDiv from "../LoadingDiv";

import { QUERY_DIALOG } from "./common";
import { ErrorComp } from "../../common/functions";

interface Props {
  groupid: number;
  userid: number;
  subscribeToMore: Function;
  fetchDialog: object[];
}

interface State {
  hasMoreItems: boolean;
  isFetching: boolean;
  cursor: number;
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

// The number of messages which should be displayed at once
const LIMIT = 25;

class Conversation extends React.Component<Props, State> {
  state = {
    hasMoreItems: true,
    isFetching: false,
    cursor: 0
  };

  componentDidMount = async () => {
    // Set the cursor for pagination to the last element of the fetched Messages
    const messages = this.props.fetchDialog;
    await this.setState({ cursor: messages[messages.length - 1].sendtime });

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
          return { ...prev, fetchDialog: [newMessage, ...prev.fetchDialog] };
        }
      }
    });
  };

  // Avoid the Scrollbar from going to the bottom when fetching new Messages
  componentWillReceiveProps({ fetchDialog: newMessages }) {
    const { fetchDialog: oldMessages } = this.props;

    if (
      this.scroller &&
      this.scroller.scrollTop < 100 &&
      oldMessages &&
      newMessages &&
      oldMessages.length !== newMessages.length
    ) {
      const heightBeforeRender = this.scroller.scrollHeight;
      setTimeout(() => {
        this.scroller.scrollTop = this.scroller.scrollHeight - heightBeforeRender;
      }, 170);
    }
  }

  handleScroll = () => {
    if (
      !this.state.isFetching &&
      this.scroller &&
      this.scroller.scrollTop < 100 &&
      this.state.hasMoreItems &&
      this.props.fetchDialog.length >= LIMIT
    ) {
      this.setState(() => ({ isFetching: true }));
      this.props.fetchMore({
        variables: {
          cursor: this.state.cursor,
          groupid: this.props.groupid,
          limit: LIMIT
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }

          if (fetchMoreResult.fetchDialog.length < LIMIT) {
            this.setState({ hasMoreItems: false });
          }

          this.setState(() => ({
            isFetching: false,
            cursor: fetchMoreResult.fetchDialog[fetchMoreResult.fetchDialog.length - 1].sendtime
          }));

          console.log(fetchMoreResult.fetchDialog);

          return {
            ...previousResult,
            fetchDialog: union(previousResult.fetchDialog, fetchMoreResult.fetchDialog)
          };
        }
      });
    }
  };

  render() {
    return (
      <div
        className="conversation"
        ref={scroller => {
          this.scroller = scroller;
        }}
        onScroll={this.handleScroll}>
        <NewMessage groupid={this.props.groupid} />
        <ol className="conversation-list-main">
          <FileUpload disableClick={true} groupid={this.props.groupid}>
            {this.props.fetchDialog
              .slice()
              .reverse()
              .map(message => {
                const isMe = message.sender && message.sender.id == this.props.userid;
                const date = message.sendtime ? new Date(message.sendtime) : null;

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
                        <span>
                          <UserName
                            {...this.props}
                            unitid={message.sender ? message.sender.id : undefined}
                            short={true}
                            className="user-name"
                          />
                          &nbsp;
                          <span className="date">{date ? date.toUTCString() : ""}</span>
                        </span>
                        <Message {...this.props} message={message} />
                      </div>
                    </div>

                    <div className="conversation-list-main-item-read">
                      <MessageReadIndicators {...this.props} messageid={message.id} />
                    </div>
                  </li>
                );
              })}
          </FileUpload>
        </ol>
      </div>
    );
  }
}

export default (props: { groupid: number; userid: number }): JSX.Element => {
  const { groupid } = props;

  if (groupid === undefined || groupid === null) {
    return <span>Select a conversation on the left to view it here</span>;
  }

  return (
    <Query
      pollInterval={60 * 10 * 1000 + 1000}
      query={QUERY_DIALOG}
      variables={{ groupid, limit: LIMIT }}>
      {({ loading, error, data: { fetchDialog }, subscribeToMore, fetchMore }) => {
        if (loading) {
          return <LoadingDiv text="Fetching conversation..." />;
        }

        if (error) {
          return <ErrorComp error="Error loading messages" />;
        }

        return (
          <Conversation
            {...props}
            fetchDialog={fetchDialog}
            subscribeToMore={subscribeToMore}
            fetchMore={fetchMore}
          />
        );
      }}
    </Query>
  );
};
