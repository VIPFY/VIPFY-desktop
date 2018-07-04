import * as React from "react";
import { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";

const QUERY_MESSAGELIST = gql`
  {
    fetchLastDialogMessages {
      id
      sender {
        id
        firstname
        lastname
        profilepicture
      }
      receiver {
        id
        firstname
        lastname
        profilepicture
      }
      messagetext
    }
  }
`;

const QUERY_DIALOG = gql`
  query fetchDialog($sender: Int!) {
    fetchDialog(sender: $sender) {
      id
      sendtime
      readtime
      messagetext
      receiver {
        id
        firstname
        lastname
        profilepicture
      }
      sender {
        id
        firstname
        lastname
        profilepicture
      }
    }
  }
`;

class MessageCenter extends Component {
  state = {};

  Conversation(props: any): JSX.Element {
    console.log("CONVERSATION", props)
    console.log(props.match.params.person);
    if (props.match.params.person) {
      return (
        <Query
          query={QUERY_DIALOG}
          variables={{ sender: props.match.params.person }}
          pollInterval={5000}>
          {({ loading, error, data }) => {
            if (loading) {
              return "Loading...";
            }
            if (error) {
              return "Error loading messages";
            }

            return (
              <ul
                style={{
                  height: "100%",
                  width: "100%",
                  padding: 0,
                  listStyle: "none"
                }}>
                {data.fetchDialog.map(message => {
                  const isMe = message.sender.id == props.userid;
                  const senderName = isMe ? "You" : message.sender.firstname;
                  return (
                    <li style={{ paddingBottom: "10px" }} key={"conversationKey" + message.id}>
                      <div style={{ width: "400px", marginLeft: isMe ? "auto" : 0 }}>
                        <img
                          className="rightProfileImage"
                          src={
                            "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/" +
                            message.sender.profilepicture
                          }
                        />
                        <div>
                          {senderName}: {message.messagetext}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          }}
        </Query>
      );
    } else {
      return <span>Select a conversation on the left to view it here</span>;
    }
  }

  render() {
    let cssClass = "";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }
    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }
    console.log("MESSAGE CENTER", this);
    return (
      <div className={cssClass} style={{ height: "100%", display: "flex" }}>
        <div
          style={{
            background: "rgba(0,0,0,0.2)",
            height: "100%",
            width: "250px",
            padding: "5px",
            margin: "10px"
          }}>
          <Query query={QUERY_MESSAGELIST} pollInterval={5000}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return "Error loading Message List";
              }

              return (
                <ul
                  id="conversationlist"
                  style={{
                    height: "100%",
                    width: "100%",
                    padding: 0
                  }}>
                  {data.fetchLastDialogMessages.map(conversation => {
                    const partner =
                      conversation.sender.id == this.props.userid
                        ? conversation.receiver
                        : conversation.sender;
                    const senderName =
                      conversation.sender.id == this.props.userid
                        ? "You"
                        : conversation.sender.firstname;
                    return (
                      <Link
                        to={`/area/messagecenter/${partner.id}`}
                        style={{ textDecoration: "none", color: "black" }}
                        key={"conversationsListKey" + partner.id}>
                        <li style={{ width: "200px", display: "flex", paddingBottom: "10px" }}>
                          <img
                            className="rightProfileImage"
                            src={
                              "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/" +
                              partner.profilepicture
                            }
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {partner.firstname} {partner.lastname}
                            </div>
                            <div style={{ fontSize: "80%" }}>
                              {senderName}: {conversation.messagetext}
                            </div>
                          </div>
                        </li>
                      </Link>
                    );
                  })}
                </ul>
              );
            }}
          </Query>
        </div>
        <div
          style={{
            height: "100%",
            width: "100%",
            border: "1px solid rgba(0,0,0,0.2)",
            margin: "10px 10px 10px 0",
            overflow: "auto",
          }}>
          <this.Conversation match={this.props.match} {...this.props} />
        </div>
      </div>
    );
  }
}

export default MessageCenter;
