import * as React from "react";
import gql from "graphql-tag";
import { times } from "lodash";

import { Query, graphql } from "react-apollo";
import { concatName } from "../../common/functions";
import UniversalButton from "../universalButtons/universalButton";
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
    }
  }
`;

class UserSecurityTable extends React.Component<Props> {
  forceReset = async userids => {
    try {
      await this.props.forcePasswordChange({
        variables: { userids },
        refetchQueries: [{ query: FETCH_USER_SECURITY_OVERVIEW }]
      });
    } catch (err) {
      console.log("Force reset not possible", err);
    }
  };

  render() {
    return (
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
                  <th>Created</th>
                  <th>Last Active</th>
                  <th>PW Length</th>
                  <th>PW Strength</th>
                  <th>Reset PW</th>
                  <th>Admin</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.fetchUserSecurityOverview
                  .filter(user =>
                    concatName(user.unitid)
                      .toLocaleUpperCase()
                      .includes(this.props.search.toUpperCase())
                  )
                  .map((user, key) => (
                    <UserSecurityRow key={key} user={user} />
                  ))}
                <tr>
                  {times(5, n => (
                    <td key={n} />
                  ))}
                  <td colSpan={3}>
                    {data.fetchUserSecurityOverview.length > 1 && (
                      <UniversalButton
                        type="low"
                        label="Force all"
                        onClick={() =>
                          this.forceReset(data.fetchUserSecurityOverview.map(user => user.id))
                        }
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          );
        }}
      </Query>
    );
  }
}

export default graphql(FORCE_RESET, { name: "forcePasswordChange" })(UserSecurityTable);
