import * as React from "react";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";
import Message from "./Message";
import UserName from "../UserName";
import InlineUser from "../InlineUser";
import { QUERY_GROUPS } from "./common";
import { JsxJoin } from "../../common/functions";

export default (props: { userid: number }): JSX.Element => {
  return (
    <Query query={QUERY_GROUPS}>
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
                <span key={group.name}>{group.name}</span>
              ) : (
                JsxJoin(
                  grouppartners.map(p => <UserName key={p.id} {...props} unitid={p.id} />),
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
};
