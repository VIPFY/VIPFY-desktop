import * as React from "react";
import axios from "axios";
import InlineUser from "../InlineUser";
import { filterError } from "../../common/functions";

interface Props {
  message: any;
  userid: number;
}

interface State {}

class Message extends React.Component<Props, State> {
  state = {
    src: "",
    loading: true,
    error: false
  };

  componentDidMount = async () => {
    if (!this.props.message.payload.files) {
      return;
    }
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
        "x-token": localStorage.getItem("token"),
        "x-refresh-token": localStorage.getItem("refreshToken")
      });

      const config = {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers,
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify({ id: this.props.message.id })
      };

      const secure = process.env.SERVER_NAME == "localhost" ? "" : "s";
      const res = await fetch(
        `http${secure}://${process.env.SERVER_NAME}:${process.env.SERVER_PORT}/download`,
        config
      );

      if (!res.ok) {
        throw new Error({ message: res.statusText });
      }
      const resBlob = await res.blob();
      const src = URL.createObjectURL(resBlob);

      await this.setState({ src, loading: false });
    } catch (err) {
      this.setState({ error: filterError(err) });
    }
  };

  showLarge = filename => {
    this.props.showPopup({
      header: "Big Picture",
      body: (src, name) => <img src={this.state.src} alt={name} />,
      props: { src: this.state.src, name: filename },
      type: "pic"
    });
  };

  render() {
    const { message } = this.props;
    if (message === null || message == undefined) {
      return <span />;
    }

    const isSystem = !message.sender;
    let messagetext = <span dangerouslySetInnerHTML={{ __html: message.messagetext }} />;

    if (message.payload.files && message.payload.files.length == 1) {
      if (this.state.loading) {
        return <div className="attachment-preview" />;
      } else if (this.state.error) {
        return <div>Sorry, the file couldn't be loaded!</div>;
      } else {
        return (
          <img
            onClick={() => this.showLarge(message.payload.files[0].filename)}
            className="message-pic"
            src={this.state.src}
            alt={message.payload.files[0].filename}
          />
        );
      }
    }

    if (isSystem) {
      let desc = message.payload.systemmessage;
      switch (desc.type) {
        case "groupcreated":
          messagetext = (
            <span>
              Group created by{" "}
              <InlineUser {...this.props} unitid={desc.actor} className="user-name" />
            </span>
          );
          break;
        default:
          messagetext = <span />;
      }
    }
    return messagetext;
  }
}

export default Message;
