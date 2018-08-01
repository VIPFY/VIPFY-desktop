import * as React from "react";
import { Component } from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";

const QUERY_GROUPS = gql`
  {
    fetchGroups {
      id
      name
      image
      foundingdate
      lastmessage {
        id
        messagetext
        payload
        sendtime
        sender {
          id
          firstname
          lastname
          profilepicture
        }
      }
      memberships {
        id
        unitid {
          id
          firstname
          lastname
          profilepicture
        }
        lastreadmessageid
      }
    }
  }
`;

const QUERY_DIALOG = gql`
  query fetchDialog($groupid: ID!) {
    fetchDialog(groupid: $groupid) {
      id
      sendtime
      messagetext
      payload
      deletedat
      modifiedat
      sender {
        id
        firstname
        lastname
        profilepicture
      }
    }
  }
`;

const QUERY_USER = gql`
  query fetchPublicUser($userid: ID!) {
    fetchPublicUser(userid: $userid) {
      id
      firstname
      lastname
      profilepicture
    }
  }
`;

const MUTATION_SENDMESSAGE = gql`
  mutation sendMessage($groupid: ID!, $message: String!) {
    sendMessage(groupid: $groupid, message: $message) {
      ok
    }
  }
`;

function InlineUser(props: { unitid: number }): JSX.Element {
  //Optimization opportunity: try fetchFragment first, since the user data is almost always already in cache
  return (
    <Query query={QUERY_USER} variables={{ userid: props.unitid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }
        if (error) {
          return <span>(can't fetch user data)</span>;
        }

        const user = data.fetchPublicUser;
        const picture = user.profilepicture
          ? "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/" +
            user.profilepicture
          : "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg";
        return (
          <span>
            <img
              src={picture}
              style={{
                height: "1em",
                width: "1em",
                marginRight: "0.2em",
                borderRadius: "0.5em",
                backgroundColor: "#eee"
              }}
            />
            {user.firstname} {user.lastname}
          </span>
        );
      }}
    </Query>
  );
}

function Message(props: { message: any; userid: number }): JSX.Element {
  const { message, userid } = props;
  const isMe = message.sender && message.sender.id == userid;
  const isSystem = !message.sender;
  const senderName = isMe ? "You" : isSystem ? "System" : message.sender.firstname;
  let messagetext = <div dangerouslySetInnerHTML={{__html: message.messagetext}} />;
  if (isSystem) {
    let desc = message.payload.systemmessage;
    switch (desc.type) {
      case "groupcreated":
        messagetext = (
          <span>
            Group created by <InlineUser unitid={desc.actor} />
          </span>
        );
        break;
      default:
        messagetext = <span />;
    }
  }
  return (
    <div>
      {senderName}: {messagetext}
    </div>
  );
}

class MessageCenter extends Component {
  state = {};

  Conversation(props: any): JSX.Element {
    console.log("CONVERSATION", props);
    console.log(this);

    if (props.groupid === undefined || props.groupid === null) {
      return <span>Select a conversation on the left to view it here</span>;
    }
    return (
      <Query query={QUERY_DIALOG} variables={{ groupid: props.groupid }} pollInterval={5000}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return "Error loading messages";
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
                const picture =
                  message.sender && message.sender.profilepicture
                    ? "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/" +
                      message.sender.profilepicture
                    : "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg";
                const isMe = message.sender && message.sender.id == props.userid;
                return (
                  <li style={{ paddingBottom: "10px" }} key={"conversationKey" + message.id}>
                    <div style={{ width: "400px", marginLeft: isMe ? "auto" : 0, display: "flex" }}>
                      <img className="rightProfileImage" src={picture} />
                      <div>
                        <Message {...props} message={message} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          );
        }}
      </Query>
    );
  }

  NewMessage(props: any): JSX.Element {
    let input;

    if (props.groupid === undefined || props.groupid === null) {
      return <span />;
    }
    return (
      <Mutation mutation={MUTATION_SENDMESSAGE}>
        {(sendMessage, { data }) => (
          <div>
            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage({ variables: { message: input.value, groupid: props.groupid } });
                input.value = "";
              }}>
              <textarea
                rows={4}
                cols={50}
                ref={node => {
                  input = node;
                }}
              />
              <button type="submit">Send Message</button>
            </form>
          </div>
        )}
      </Mutation>
    );
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
    const groupid = this.props.match.params.person;
    return (
      <div className={cssClass} style={{ height: "calc(100% - 4em)", display: "flex" }}>
        <div
          style={{
            background: "rgba(0,0,0,0.2)",
            height: "100%",
            width: "250px",
            padding: "5px",
            margin: "10px"
          }}>
          <Query query={QUERY_GROUPS} pollInterval={5000}>
            {({ loading, error, data }) => {
              if (loading) {
                return "Loading...";
              }
              if (error) {
                return "Error loading Message List";
              }

              let fetchGroups = data.fetchGroups.map(a => a); //need that map to produce a normal array that I can sort
              fetchGroups.sort((a, b) => {
                if (a.lastmessage === null) {
                  return -1;
                } else if (b.lastmessage === null) {
                  return 1;
                } else {
                  return b.lastmessage.sendtime - a.lastmessage.sendtime;
                }
              });

              return (
                <ul
                  id="conversationlist"
                  style={{
                    height: "100%",
                    width: "100%",
                    padding: 0
                  }}>
                  {fetchGroups.map(group => {
                    const grouppartners = group.memberships
                      .map(membership => membership.unitid)
                      .filter(unit => unit.id != this.props.userid);
                    const groupname = group.name
                      ? group.name
                      : grouppartners.map(p => `${p.firstname} ${p.lastname}`).join(", ");
                    const messagetext = group.lastmessage ? group.lastmessage.messagetext : "";
                    const picture: string = group.image
                      ? group.image
                      : grouppartners.length == 1
                        ? "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/" +
                          grouppartners[0].profilepicture
                        : "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg";
                    const senderName = group.lastmessage
                      ? group.lastmessage.sender
                        ? group.lastmessage.sender.id == this.props.userid
                          ? "You"
                          : group.lastmessage.sender.firstname
                        : "System"
                      : "";
                    return (
                      <Link
                        to={`/area/messagecenter/${group.id}`}
                        style={{ textDecoration: "none", color: "black" }}
                        key={`groupListKey${group.id}`}>
                        <li style={{ width: "200px", display: "flex", paddingBottom: "10px" }}>
                          <img
                            className="rightProfileImage"
                            src={picture}
                            style={{
                              height: "32px",
                              width: "32px",
                              marginRight: "0.5rem",
                              borderRadius: "16px",
                              backgroundColor: "#eee"
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                width: "170px",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}>
                              {groupname}
                            </div>
                            <div
                              style={{
                                fontSize: "80%",
                                whiteSpace: "nowrap",
                                width: "170px",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}>
                              {senderName}: {messagetext}
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
        <div>
          <div
            style={{
              height: "100%",
              width: "100%",
              border: "1px solid rgba(0,0,0,0.2)",
              margin: "10px 10px 10px 0",
              overflow: "auto"
            }}>
            <this.Conversation groupid={groupid} {...this.props} />
            <this.NewMessage groupid={groupid} {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

export default MessageCenter;
