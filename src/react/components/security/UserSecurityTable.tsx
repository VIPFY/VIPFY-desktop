import * as React from "react";
import gql from "graphql-tag";
import UserName from "../UserName";
import Duration from "../../common/duration";
import { Query, compose, graphql } from "react-apollo";

interface State {
  changeAdminStatus: number;
  changeForce: number;
}

interface Props {
  data: { fetchUserSecurityOverview: any };
  changeAdminStatus: Function;
  forcePasswordChange: Function;
}

const CHANGEADMINSTATUS = gql`
  mutation changeAdminStatus($id: ID!, $bool: Boolean!) {
    changeAdminStatus(unitid: $id, admin: $bool) {
      ok
    }
  }
`;

const FORCERESET = gql`
  mutation forcePasswordChange($userids: [ID]!) {
    forcePasswordChange(userids: $userids) {
      ok
    }
  }
`;

const FETCHUSERSECURITYOVERVIEW = gql`
  query userSecurityOverview {
    fetchUserSecurityOverview {
      id
      unitid {
        firstname
        lastname
        isadmin
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

class UserSecurityTableInner extends React.Component<Props, State> {
  state = {
    changeAdminStatus: 0,
    changeForce: 0
  };

  changeAdminStatus = async (id, bool) => {
    this.setState({ changeAdminStatus: id });
    try {
      await this.props.changeAdminStatus({
        variables: { id, bool },
        refetchQueries: [{ query: FETCHUSERSECURITYOVERVIEW }]
      });
      this.setState({ changeAdminStatus: 0 });
    } catch (err) {
      console.log("Change Admin Status not possible");
    }
  };

  forceReset = async userids => {
    console.log(userids);
    if (userids.length === 1) {
      this.setState({ changeForce: userids[0] });
    } else {
      this.setState({ changeForce: -1 });
    }
    try {
      await this.props.forcePasswordChange({
        variables: { userids },
        refetchQueries: [{ query: FETCHUSERSECURITYOVERVIEW }]
      });
      this.setState({ changeForce: 0 });
    } catch (err) {
      console.log("Force reset not possible", err);
    }
  };

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
            <th colSpan={3}>Password</th>
            <th />
            <th />
          </tr>
          <tr>
            <th>Name</th>
            <th>Last Active</th>
            <th>Created</th>
            <th>Length</th>
            <th>Strength</th>
            {/*<th>Change on next login</th>
            <th>Banned</th>
            <th>Suspended</th>*/}
            <th>Reset</th>
            <th>Make Admin</th>
          </tr>
        </thead>
        <tbody>
          {rows}
          <tr>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td align="center">
              <button
                onClick={() =>
                  this.forceReset(
                    this.props.data.fetchUserSecurityOverview.map(user => {
                      return user.id;
                    })
                  )
                }
                className="naked-button button">
                force all
              </button>
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    );
  }

  tableRows() {
    return this.props.data.fetchUserSecurityOverview.map(user => {
      console.log("user", user);
      return (
        <tr key={`r${user.id}`}>
          <td>
            <span>{`${user.unitid.firstname} ${user.unitid.lastname}`}</span>
          </td>
          <td align="right">
            <Duration timestamp={user.lastactive} postfix=" ago" />
          </td>
          <td align="right">
            <Duration timestamp={user.createdate} postfix=" ago" />
          </td>
          <td align="right">{user.passwordlength === null ? "unknown" : user.passwordlength}</td>
          <td align="right">
            {user.passwordstrength === null ? "unknown" : user.passwordstrength + "/4"}
          </td>
          {/*<td align="right">{user.needspasswordchange ? "yes" : "no"}</td>
          <td align="right">{user.banned ? "yes" : "no"}</td>
      <td align="right">{user.suspended ? "yes" : "no"}</td>*/}
          <td align="center">
            {user.needspasswordchange ? (
              "yes"
            ) : (
              <button onClick={() => this.forceReset([user.id])} className="naked-button button">
                force
              </button>
            )}
          </td>
          <td align="center">
            {user.unitid.isadmin ? (
              <button
                onClick={() => this.changeAdminStatus(user.id, false)}
                className="naked-button button">
                revoke admin
              </button>
            ) : (
              <button
                onClick={() => this.changeAdminStatus(user.id, true)}
                className="naked-button button">
                make admin
              </button>
            )}
          </td>
        </tr>
      );
    });
  }
}

function UserSecurityTable(props) {
  return (
    <Query query={FETCHUSERSECURITYOVERVIEW} pollInterval={1000 * 60 * 10}>
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

export default compose(
  graphql(FORCERESET, { name: "forcePasswordChange" }),
  graphql(CHANGEADMINSTATUS, { name: "changeAdminStatus" })
)(UserSecurityTable);
