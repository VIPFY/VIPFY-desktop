import * as React from "react";
import { Query } from "react-apollo";
import UserPicture from "../UserPicture";
import { QUERY_GROUPS } from "./common";

export default (props: { messageid: number; groupid: number; userid: number }): JSX.Element => {
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
};
