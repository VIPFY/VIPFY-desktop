import * as React from "react";
import { Component } from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import InlineUser from "../components/InlineUser";
import UserPicture from "../components/UserPicture";
import UserName from "../components/UserName";
import { JsxJoin } from "../common/functions";

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
        }
      }
      memberships {
        id
        unitid {
          id
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
      }
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

function Message(props: { message: any; userid: number }): JSX.Element {
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
}

function MessageReadIndicators(props: {
  messageid: number;
  groupid: number;
  userid: number;
}): JSX.Element {
  return (
    <Query query={QUERY_GROUPS}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }
        if (error) {
          return <span />;
        }

        const group = data.fetchGroups.find(group => group.id == props.groupid);
        const users = group.memberships
          .filter(membership => membership.lastreadmessageid == props.messageid)
          .map(membership => membership.unitid.id);
        return users.map(unitid => (
          <span
            key={`read${props.messageid}u${unitid}g${props.groupid}`}
            style={{ display: "flex" }}>
            <UserPicture {...props} unitid={unitid} size="inline" />
          </span>
        ));
      }}
    </Query>
  );
}

class MessageCenter extends Component<
  { userid: number; match: any; chatOpen: boolean; sidebaropen: boolean },
  {}
> {
  state = {};

  Conversation(props: { groupid: number; userid: number }): JSX.Element {
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
                const isMe = message.sender && message.sender.id == props.userid;
                return (
                  <li style={{ paddingBottom: "10px" }} key={"conversationKey" + message.id}>
                    <div style={{ width: "400px", marginLeft: isMe ? "auto" : 0, display: "flex" }}>
                      <UserPicture
                        {...props}
                        unitid={message.sender ? message.sender.id : undefined}
                        size="twolines"
                      />
                      <div>
                        <UserName
                          {...props}
                          unitid={message.sender ? message.sender.id : undefined}
                          short={true}
                        />: <Message {...props} message={message} />
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto", width: "2em" }}>
                      <MessageReadIndicators {...props} messageid={message.id} />
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

  NewMessage(props: { userid: number; groupid: number }): JSX.Element {
    let input;

    if (props.groupid === undefined || props.groupid === null) {
      return <span />;
    }
    return (
      <Mutation
        mutation={MUTATION_SENDMESSAGE}
        refetchQueries={[
          { query: QUERY_DIALOG, variables: { groupid: props.groupid } },
          { query: QUERY_GROUPS }
        ]}>
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

  ConversationList(props: { userid: number }): JSX.Element {
    return (
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
                  .filter(unit => unit.id != props.userid);
                const groupname = group.name ? (
                  <span>group.name</span>
                ) : (
                  JsxJoin(
                    grouppartners.map(p => <UserName {...props} unitid={p.id} />),
                    <span>, </span>
                  )
                );
                const picture: string = group.image
                  ? group.image
                  : grouppartners.length == 1
                    ? "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/" +
                      grouppartners[0].profilepicture
                    : "https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg";
                return (
                  <Link
                    to={`/area/messagecenter/${group.id}`}
                    style={{ textDecoration: "none", color: "black" }}
                    key={`groupListKey${group.id}`}>
                    <li style={{ width: "200px", display: "flex", paddingBottom: "10px" }}>
                      <img
                        className="right-profile-image"
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
                          <InlineUser
                            {...props}
                            unitid={
                              group.lastmessage && group.lastmessage.sender
                                ? group.lastmessage.sender.id
                                : undefined
                            }
                            short={true}
                          />: <Message {...props} message={group.lastmessage} />
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
    );
  }

  render() {
    console.log("MESSAGE CENTER", this);
    const groupid = this.props.match.params.person;
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
          <this.ConversationList {...this.props} />
        </div>
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
  }
}

export default MessageCenter;
