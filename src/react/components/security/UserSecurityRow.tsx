import * as React from "react";
import * as moment from "moment";
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { Mutation } from "@apollo/client/react/components";
import { withApollo } from "@apollo/client/react/hoc";
import { showStars, filterError } from "../../common/functions";
import { FETCH_USER_SECURITY_OVERVIEW } from "./graphqlOperations";
import UserName from "../UserName";
import EmployeePicture from "../EmployeePicture";
import IconButton from "../../common/IconButton";
import SecurityPopup from "../../pages/manager/securityPopup";
import { SecurityUser } from "../../interfaces";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { decryptAdminKey } from "../../common/passwords";
import { encryptLicence } from "../../common/crypto";
import BanPopup from "../../popups/universalPopups/BanPopup";

const ADD_ADMIN = gql`
  mutation onAddAdmin($id: ID!, $key: KeyInput!) {
    addAdmin(unitid: $id, adminkey: $key) {
      id
      isadmin
    }
  }
`;

const REMOVE_ADMIN = gql`
  mutation onRemoveAdmin($id: ID!) {
    removeAdmin(unitid: $id) {
      id
      isadmin
    }
  }
`;

const FETCH_CURRENT_KEY = gql`
  query fetchCurrentKey($unitid: ID!) {
    fetchCurrentKey(unitid: $unitid) {
      id
      publickey
    }
  }
`;

interface Props {
  user: SecurityUser;
  id: string;
  client: any;
}

interface State {
  showEdit: boolean;
  showAdminRights: boolean;
  showAdminSuccess: boolean;
}

class UserSecurityRow extends React.Component<Props, State> {
  state = {
    showEdit: false,
    showAdminRights: false,
    showAdminSuccess: false
  };

  render() {
    const { user } = this.props;

    return (
      <tr onClick={() => this.setState(prevState => ({ showEdit: !prevState.showEdit }))}>
        <td colSpan={2} className="data-recording-sensitive">
          <EmployeePicture employee={user.unitid} />
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
            mutation={user.unitid.isadmin ? REMOVE_ADMIN : ADD_ADMIN}
            onCompleted={() => this.setState({ showAdminSuccess: true, showAdminRights: false })}
            update={proxy => {
              const data = proxy.readQuery({ query: FETCH_USER_SECURITY_OVERVIEW });
              const fetchUserSecurityOverview = data.fetchUserSecurityOverview.map(u => {
                if (u.id == user.id) {
                  return { ...u, unitid: { ...u.unitid, isadmin: !user.unitid.isadmin } };
                } else {
                  return u;
                }
              });

              proxy.writeQuery({
                query: FETCH_USER_SECURITY_OVERVIEW,
                data: { fetchUserSecurityOverview }
              });
            }}>
            {(mutate, { loading, error = null }) => (
              <React.Fragment>
                <label className="switch">
                  <input
                    disabled={loading}
                    onChange={() => this.setState({ showAdminRights: true })}
                    checked={user.unitid.isadmin}
                    type="checkbox"
                  />
                  <span className="slider" />
                </label>

                {this.state.showAdminRights && (
                  <PopupBase
                    buttonStyles={{ justifyContent: "space-between" }}
                    close={() => this.setState({ showAdminRights: false })}
                    dialog={true}>
                    {this.props.id != user.id ? (
                      <React.Fragment>
                        <div className="security-dialogue">
                          <h1>{`${user.unitid.isadmin ? "Take" : "Give"} Admin Rights`}</h1>
                          <p>
                            Do you really want to {user.unitid.isadmin ? "take" : "give"}{" "}
                            <UserName unitid={user.id} /> Admin Rights?
                          </p>
                        </div>
                        {error && <span className="error">{filterError(error)}</span>}
                        <UniversalButton
                          type="low"
                          label="no"
                          onClick={() => this.setState({ showAdminRights: false })}
                        />
                        <UniversalButton
                          type="low"
                          label="yes"
                          onClick={async () => {
                            if (user.unitid.isadmin) {
                              return mutate({
                                variables: { id: user.id }
                              });
                            } else {
                              const key = await decryptAdminKey(this.props.client);
                              const userKey = await this.props.client.query({
                                query: FETCH_CURRENT_KEY,
                                variables: { unitid: user.id }
                              });
                              key.privatekey = (
                                await encryptLicence(
                                  Buffer.from(key.privatekeyDecrypted, "hex"),
                                  Buffer.from(userKey.data.fetchCurrentKey.publickey, "hex")
                                )
                              ).toString("hex");
                              delete key.privatekeyDecrypted;
                              delete key.__typename;
                              delete key.createdat;
                              delete key.id;
                              key.encryptedby = userKey.data.fetchCurrentKey.publickey;

                              return mutate({
                                variables: { id: user.id, key }
                              });
                            }
                          }}
                        />
                      </React.Fragment>
                    ) : (
                      <div>You can't take your own admin rights!</div>
                    )}
                  </PopupBase>
                )}
              </React.Fragment>
            )}
          </Mutation>

          {this.state.showAdminSuccess && (
            <PopupBase buttonStyles={{ justifyContent: "center" }} closeable={false} dialog={true}>
              <div className="security-dialogue">
                <h1>{`${user.unitid.isadmin ? "Give" : "Take"} Admin Rights`}</h1>
                <p>
                  {user.unitid.isadmin ? "Giving" : "Taking"} <UserName unitid={user.id} /> Admin
                  Rights was successful
                </p>
              </div>

              <UniversalButton
                type="low"
                label="ok"
                onClick={() => this.setState({ showAdminSuccess: false })}
              />
            </PopupBase>
          )}
        </td>

        <td>
          <BanPopup user={this.props.user} />
        </td>

        <td>
          {user.twofactormethods.length > 0
            ? user.twofactormethods.map(method => method.twofatype).join(" ")
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

          {this.state.showEdit && (
            <SecurityPopup
              securityPage={true}
              id={this.props.id}
              closeFunction={() => this.setState({ showEdit: false })}
              userid={user.id}
            />
          )}
        </td>
      </tr>
    );
  }
}

export default withApollo(withRouter(UserSecurityRow));
