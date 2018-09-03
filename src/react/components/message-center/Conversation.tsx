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
    hasMoreItems: true
  };

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
          return { ...prev, fetchDialog: [newMessage, ...prev.fetchDialog] };
        }
      }
    });
  }

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
      this.scroller &&
      this.scroller.scrollTop < 100 &&
      this.state.hasMoreItems &&
      this.props.fetchDialog.length >= LIMIT
    ) {
      this.props.fetchMore({
        variables: {
          offset: this.props.fetchDialog.length,
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
        <FileUpload disableClick={true}>
          <ol className="conversation-list-main">
            {this.props.fetchDialog
              .slice()
              .reverse()
              .map(message => {
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
                          sendtime={message.sendtime}
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
        </FileUpload>
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
    <Query query={QUERY_DIALOG} variables={{ groupid, limit: LIMIT }}>
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
