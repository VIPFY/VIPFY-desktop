import * as React from "react";
import gql from "graphql-tag";
import { Query, graphql } from "react-apollo";
import { concatName } from "../../common/functions";
import UserSecurityRow from "./UserSecurityRow";

interface Props {
  forcePasswordChange: Function;
  search: string;
}

export const FORCE_RESET = gql`
  mutation forcePasswordChange($userids: [ID]!) {
    forcePasswordChange(userids: $userids) {
      ok
    }
  }
`;

export const FETCH_USER_SECURITY_OVERVIEW = gql`
  query userSecurityOverview {
    fetchUserSecurityOverview {
      id
      unitid {
        firstname
        lastname
        isadmin
        profilepicture
        companyban
      }
      lastactive
      needspasswordchange
      passwordlength
      passwordstrength
      banned
      suspended
      createdate
      twofactormethods {
        twofaid
        twofatype
        twofacreated
        twofalastused
        twofacount
      }
    }
  }
`;

const UserSecurityTable = (props: Props) => (
  <Query
    pollInterval={60 * 10 * 1000 + 7000}
    query={FETCH_USER_SECURITY_OVERVIEW}
    fetchPolicy="network-only">
    {({ data, loading, error }) => {
      if (loading) {
        return <div>Loading</div>;
      }

      if (error) {
        return <div>Error fetching data</div>;
      }

      return (
        <table className="security-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Last Active</th>
              <th>PW Strength</th>
              <th>Admin Rights</th>
              <th>Two Factor Authentication</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.fetchUserSecurityOverview
              .filter(user =>
                concatName(user.unitid)
                  .toLocaleUpperCase()
                  .includes(props.search.toUpperCase())
              )
              .map((user, key) => (
                <UserSecurityRow key={key} user={user} />
              ))}
          </tbody>
        </table>
      );
    }}
  </Query>
);

export default graphql(FORCE_RESET, { name: "forcePasswordChange" })(UserSecurityTable);
