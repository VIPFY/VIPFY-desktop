import * as React from "react";
import InlineUser from "../InlineUser";

export default (props: { message: any; userid: number }): JSX.Element => {
  const { message } = props;
  if (message === null || message == undefined) {
    return <span />;
  }
  const isSystem = !message.sender;
  let messagetext = <span dangerouslySetInnerHTML={{ __html: message.messagetext }} />;
  if (isSystem) {
    let desc = message.payload.systemmessage;
    switch (desc.type) {
      case "groupcreated":
        messagetext = (
          <span>
            Group created by <InlineUser {...props} unitid={desc.actor} />
          </span>
        );
        break;
      default:
        messagetext = <span />;
    }
  }
  return messagetext;
};
