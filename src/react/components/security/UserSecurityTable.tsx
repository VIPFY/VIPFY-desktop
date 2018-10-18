import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import UserName from "../UserName";
import Duration from "../../common/duration";

interface State {}

interface Props {
  data: { fetchUserSecurityOverview: any };
}

class UserSecurityTableInner extends React.Component<Props, State> {
  render() {
    console.log("props", this.props.data);

    const rows = this.tableRows();
    return (
      <table>
        <thead>
          <tr>
            <th />
            <th />
            <th />
            <th colSpan={2}>Password</th>
            <th />
            <th />
            <th />
          </tr>
          <tr>
            <th>Name</th>
            <th>Last Active</th>
            <th>Created</th>
            <th>Length</th>
            <th>Strength</th>
            <th>Change on next login</th>
            <th>Banned</th>
            <th>Suspended</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  tableRows() {
    return this.props.data.fetchUserSecurityOverview.map(user => {
      console.log("user", user);
      return (
        <tr key={`r${user.id}`}>
          <td>
            <UserName unitid={user.id} />
          </td>
          <td>
            <Duration timestamp={user.lastactive} postfix=" ago" />
          </td>
          <td>
            <Duration timestamp={user.createdate} postfix=" ago" />
          </td>
          <td>{user.passwordlength || "unknown"}</td>
          <td>{user.passwordstrength || "unknown"}</td>
          <td>{user.needspasswordchange ? "yes" : "no"}</td>
          <td>{user.banned ? "yes" : "no"}</td>
          <td>{user.suspended ? "yes" : "no"}</td>
        </tr>
      );
    });
  }
}

function UserSecurityTable(props) {
  return (
    <Query
      query={gql`
        query userSecurityOverview {
          fetchUserSecurityOverview {
            id
            lastactive
            needspasswordchange
            passwordlength
            passwordstrength
            banned
            suspended
            createdate
          }
        }
      `}
      pollInterval={1000 * 60 * 10}>
      {({ data, loading, error }) => {
        if (loading) {
          return <div>Loading</div>;
        }
        if (error) {
          return <div>Error fetching data</div>;
        }
        return <UserSecurityTableInner {...props} data={data} />;
      }}
    </Query>
  );
}

export default UserSecurityTable;
