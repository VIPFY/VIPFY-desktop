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

      if (error || !data) {
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
              <th>Ban User</th>
              <th>Two-Factor</th>
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
              .sort((a, b) => {
                const nameA = a.unitid.firstname.toUpperCase(); // ignore upper and lowercase
                const nameB = b.unitid.firstname.toUpperCase(); // ignore upper and lowercase

                if (nameA < nameB) {
                  return -1;
                }

                if (nameA > nameB) {
                  return 1;
                }

                // names must be equal
                return 0;
              })
              .map((user, key) => (
                <UserSecurityRow {...props} key={key} user={user} />
              ))}
          </tbody>
        </table>
      );
    }}
  </Query>
);

export default graphql(FORCE_RESET, { name: "forcePasswordChange" })(UserSecurityTable);
