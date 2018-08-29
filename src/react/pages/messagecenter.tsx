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

export default (props: Props): JSX.Element => {
  const groupid = props.match.params.person;

  return (
    <div style={{ height: "calc(100% - 4em)", display: "flex" }}>
      <div
        style={{
          background: "rgba(0,0,0,0.2)",
          height: "100%",
          width: "250px",
          padding: "5px",
          margin: "10px"
        }}>
        <button className="button-start-conv" type="button" onClick={() => null}>
          <i className="fas fa-plus" /> Start new chat
        </button>

        <br />
        <ConversationList {...props} />
      </div>
      <div
        style={{
          height: "100%",
          width: "100%",
          border: "1px solid rgba(0,0,0,0.2)",
          margin: "10px 10px 10px 0",
          overflow: "auto"
        }}>
        <Conversation {...props} groupid={groupid} />
        <NewMessage {...props} groupid={groupid} />
      </div>
      <div
        style={{
          background: "rgba(0,0,0,0.2)",
          height: "100%",
          width: "500px",
          padding: "5px",
          margin: "10px"
        }}
      />
    </div>
  );
};
