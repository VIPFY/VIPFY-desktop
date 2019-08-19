import * as React from "react";
import * as moment from "moment";
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { Mutation, withApollo } from "react-apollo";
import { showStars, filterError } from "../../common/functions";
import { FETCH_USER_SECURITY_OVERVIEW } from "./UserSecurityTable";
import UserName from "../UserName";
import PrintEmployeeSquare from "../manager/universal/squares/printEmployeeSquare";
import IconButton from "../../common/IconButton";
import SecurityPopup from "../../pages/manager/securityPopup";
import { SecurityUser } from "../../interfaces";

const CHANGE_ADMIN_STATUS = gql`
  mutation onChangeAdminStatus($id: ID!, $bool: Boolean!) {
    changeAdminStatus(unitid: $id, admin: $bool) {
      id
      status
    }
  }
`;

interface Props {
  user: SecurityUser;
}

interface State {
  showEdit: boolean;
}

class UserSecurityRow extends React.Component<Props, State> {
  state = { showEdit: false };

  render() {
    const { user } = this.props;

    return (
      <React.Fragment>
        <tr onClick={() => this.setState(prevState => ({ showEdit: !prevState.showEdit }))}>
          <td className="data-recording-sensitive">
            <PrintEmployeeSquare employee={user.unitid} />
            <div className="name">
              <UserName unitid={user.id} />
            </div>
          </td>

          <td>
            {user.lastactive ? (
              moment(parseInt(user.lastactive)).format("DD.MM.YYYY")
            ) : (
              <i className="fal fa-minus" />
            )}
          </td>
          <td>
            {user.passwordstrength === null ? "unknown" : showStars(user.passwordstrength, 4)}
            <i
              className="fal fa-info-cirlce"
              title={`Password Length: ${
                user.passwordlength === null ? "unknown" : user.passwordlength
              }`}
            />
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

          <td>
            {user.twofactormethods.length > 0
              ? user.twofactormethods.map((method, key) => (
                  <span key={key}>{method.twofatype}</span>
                ))
              : "OFF"}
          </td>

          <td align="right">
            <IconButton
              className="security-edit-button"
              icon="pen"
              onClick={e => {
                e.stopPropagation();
                this.setState(prevState => ({ showEdit: !prevState.showEdit }));
              }}
            />
          </td>
        </tr>

        {this.state.showEdit && (
          <SecurityPopup
            securityPage={true}
            closeFunction={() => this.setState({ showEdit: false })}
            user={user}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withApollo(withRouter(UserSecurityRow));
