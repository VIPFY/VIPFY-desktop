import * as React from "react";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";

import LoadingDiv from "../LoadingDiv";
import Message from "./Message";
import UserName from "../UserName";
import InlineUser from "../InlineUser";
import { QUERY_GROUPS } from "./common";
import { JsxJoin } from "../../common/functions";
import { unitPicFolder, defaultPic } from "../../common/constants";

export default (props: { userid: number }): JSX.Element => {
  return (
    <Query query={QUERY_GROUPS}>
      {({ loading, error, data }) => {
        if (loading) {
          return <LoadingDiv text="Fetching conversations..." />;
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
          <ul className="conversation-list">
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
              const date = group.foundingdate ? new Date(group.foundingdate) : null;

              const picture: string = group.image
                ? group.image
                : grouppartners.length == 1 && grouppartners[0].profilepicture
                  ? unitPicFolder + grouppartners[0].profilepicture
                  : defaultPic;

              return (
                <Link
                  className="conversation-list-link"
                  to={`/area/messagecenter/${group.id}`}
                  key={`groupListKey${group.id}`}>
                  <li className="conversation-list-item">
                    <img className="conversation-list-pic" src={picture} />
                    <div>
                      <div className="conversation-list-item-heading">{groupname}</div>
                      <div className="conversation-list-item-text">
                        <div className="date">{date ? date.toUTCString() : ""}</div>
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
