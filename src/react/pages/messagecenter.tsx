import * as React from "react";
import Conversation from "../components/message-center/Conversation";
import ConversationList from "../components/message-center/ConversationList";
import NewMessage from "../components/message-center/NewMessage";

interface Props {
  userid: number;
  match: any;
  chatOpen: boolean;
  sidebarOpen: boolean;
}

class MessageCenter extends React.Component<Props> {
  handleScroll = () => {
    if (this.scroller && this.scroller.scrollTop < 100) {
      console.log("Refetch!");
    }
  };

  render() {
    const groupid = this.props.match.params.person;

    return (
      <div className="message-center">
        <div className="conversation-list-holder">
          <button className="button-start-conv" type="button" onClick={() => null}>
            <i className="fas fa-plus" /> Start new chat
          </button>

          <ConversationList {...this.props} />
        </div>

        <div
          className="conversation"
          ref={scroller => {
            this.scroller = scroller;
          }}
          onScroll={this.handleScroll}>
          <NewMessage {...this.props} groupid={groupid} />
          <Conversation {...this.props} groupid={groupid} />
        </div>

        <div className="system-messages" />
      </div>
    );
  }
}

export default MessageCenter;
