import * as React from "react";
import gql from "graphql-tag";
import * as moment from "moment";
import UserName from "../UserName";
import { Query, Mutation, graphql } from "react-apollo";
import UserPicture from "../UserPicture";
import { showStars, filterError } from "../../common/functions";

interface State {
  changeForce: number;
}

interface Props {
  data: { fetchUserSecurityOverview: any };
  forcePasswordChange: Function;
}

const CHANGE_ADMIN_STATUS = gql`
  mutation onChangeAdminStatus($id: ID!, $bool: Boolean!) {
    changeAdminStatus(unitid: $id, admin: $bool) {
      id
      status
    }
  }
`;

const FORCE_RESET = gql`
  mutation forcePasswordChange($userids: [ID]!) {
    forcePasswordChange(userids: $userids) {
      ok
    }
  }
`;

const FETCH_USER_SECURITY_OVERVIEW = gql`
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
    changeForce: 0
  };

  // changeAdminStatus = async (id, bool) => {
  //   this.setState({ changeAdminStatus: id });
  //   try {
  //     await this.props.changeAdminStatus({
  //       variables: { id, bool }
  //       // refetchQueries: [{ query: FETCHUSERSECURITYOVERVIEW }]
  //     });
  //     this.setState({ changeAdminStatus: 0 });
  //   } catch (err) {
  //     console.log("Change Admin Status not possible");
  //   }
  // };

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
        refetchQueries: [{ query: FETCH_USER_SECURITY_OVERVIEW }]
      });
      this.setState({ changeForce: 0 });
    } catch (err) {
      console.log("Force reset not possible", err);
    }
  };

  render() {
    return (
      <table className="security-table">
        <thead>
          <tr>
            <th className="pad-left">Name</th>
            <th>Created</th>
            <th>Last Active</th>
            <th>PW Length</th>
            <th>Reset PW</th>
            <th>PW Strength</th>
            {/*<th>Change on next login</th>
            <th>Banned</th>
            <th>Suspended</th>*/}
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {this.tableRows()}
          <tr>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td>
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
    return this.props.data.fetchUserSecurityOverview.map(user => (
      <tr key={`r${user.id}`}>
        <td className="pad-left">
          <span className="overview-user" data-recording-sensitive>
            <UserPicture unitid={user.id} size="twolines" />
            <UserName unitid={user.id} />
          </span>
        </td>
        <td>{moment(parseInt(user.createdate)).format("DD.MM.YYYY")}</td>
        <td>
          {user.lastactive ? (
            moment(parseInt(user.lastactive)).format("DD.MM.YYYY")
          ) : (
            <i className="fal fa-minus" />
          )}
        </td>
        <td>{user.passwordlength === null ? "unknown" : user.passwordlength}</td>
        <td>
          {user.needspasswordchange ? (
            <i className="fal fa-minus" />
          ) : (
            <button onClick={() => this.forceReset([user.id])} className="naked-button button">
              Force
            </button>
          )}
        </td>
        <td>{user.passwordstrength === null ? "unknown" : showStars(user.passwordstrength, 4)}</td>
        <td>
          <Mutation
            mutation={CHANGE_ADMIN_STATUS}
            optimisticResponse={{
              __typename: "Mutation",
              changeAdminStatus: {
                __typename: "StatusResponse",
                id: user.id,
                status: !user.unitid.isadmin
              }
            }}
            update={(proxy, { data: { changeAdminStatus } }) => {
              const data = proxy.readQuery({ query: FETCH_USER_SECURITY_OVERVIEW });
              const fetchUserSecurityOverview = data.fetchUserSecurityOverview.map(u => {
                if (u.id == user.id) {
                  return { ...u, unitid: { ...u.unitid, isadmin: changeAdminStatus.status } };
                } else {
                  return u;
                }
              });

              proxy.writeQuery({
                query: FETCH_USER_SECURITY_OVERVIEW,
                data: { fetchUserSecurityOverview }
              });
            }}>
            {(mutate, { data, loading, error }) => (
              <React.Fragment>
                <label className="switch">
                  <input
                    disabled={loading}
                    onChange={() =>
                      mutate({ variables: { id: user.id, bool: !user.unitid.isadmin } })
                    }
                    checked={data ? data.changeAdminStatus.status : user.unitid.isadmin}
                    type="checkbox"
                  />
                  <span className="slider" />
                </label>

                {error && <span className="error">{filterError(error)}</span>}
              </React.Fragment>
            )}
          </Mutation>
        </td>
      </tr>
    ));
  }
}

function UserSecurityTable(props) {
  return (
    <Query query={FETCH_USER_SECURITY_OVERVIEW} pollInterval={1000 * 60 * 10}>
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

export default graphql(FORCE_RESET, { name: "forcePasswordChange" })(UserSecurityTable);
