import * as React from "react";
import { Query, graphql } from "react-apollo";
import { concatName } from "../../common/functions";
import UserSecurityRow from "./UserSecurityRow";
import { FETCH_USER_SECURITY_OVERVIEW, FORCE_RESET } from "./graphqlOperations";

interface Props {
  forcePasswordChange: Function;
  search: string;
}

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
