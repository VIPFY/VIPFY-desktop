import * as React from "react";
import gql from "graphql-tag";
import { times } from "lodash";
import * as moment from "moment";
import UserName from "../UserName";
import { Query, Mutation, graphql } from "react-apollo";
import { showStars, filterError, concatName } from "../../common/functions";
import UniversalButton from "../universalButtons/universalButton";
import PrintEmployeeSquare from "../manager/universal/squares/printEmployeeSquare";

interface Props {
  data: { fetchUserSecurityOverview: any };
  forcePasswordChange: Function;
  search: string;
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
        profilepicture
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

class UserSecurityTableInner extends React.Component<Props, {}> {
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
          </tr>
        </thead>
        <tbody>
          {this.tableRows()}
          <tr>
            {times(6, n => (
              <td key={n} />
            ))}
            <td>
              {this.props.data.fetchUserSecurityOverview > 1 && (
                <UniversalButton
                  type="low"
                  label="Force all"
                  onClick={() =>
                    this.forceReset(this.props.data.fetchUserSecurityOverview.map(user => user.id))
                  }
                />
              )}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    );
  }

  tableRows() {
    return this.props.data.fetchUserSecurityOverview
      .filter(user =>
        concatName(user.unitid)
          .toLocaleUpperCase()
          .includes(this.props.search.toUpperCase())
      )
      .map((user, key) => (
        <tr key={key}>
          <td className="data-recording-sensitive">
            <PrintEmployeeSquare employee={user.unitid} />
            <div className="name">
              <UserName unitid={user.id} />
            </div>
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
            {user.passwordstrength === null ? "unknown" : showStars(user.passwordstrength, 4)}
          </td>
          <td>
            {user.needspasswordchange ? (
              <span style={{ lineHeight: "34px" }}>Required</span>
            ) : (
              <button className="naked-button" onClick={() => this.forceReset([user.id])}>
                <span style={{ color: "#20BAA9FF" }}>Force</span>
              </button>
            )}
          </td>
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

function UserSecurityTable(props: { search: string }) {
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
