import * as React from "react";
import { Component } from "react";

class Chat extends Component {
  render() {
    if (this.props.chatopen) {
      return <div className="chatBar"> Chat</div>;
    } else {
      return "";
    }
  }
}

export default Chat;
