import * as React from "react";
import * as moment from "moment";
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { Mutation, withApollo } from "react-apollo";
import { showStars, filterError, ErrorComp } from "../../common/functions";
import { FORCE_RESET, FETCH_USER_SECURITY_OVERVIEW } from "./UserSecurityTable";
import ReactPasswordStrength from "react-password-strength";
import UserName from "../UserName";
import PrintEmployeeSquare from "../manager/universal/squares/printEmployeeSquare";
import IconButton from "../../common/IconButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { PW_MIN_LENGTH } from "../../common/constants";

const CHANGE_ADMIN_STATUS = gql`
  mutation onChangeAdminStatus($id: ID!, $bool: Boolean!) {
    changeAdminStatus(unitid: $id, admin: $bool) {
      id
      status
    }
  }
`;

const UPDATE_PASSWORD = gql`
  mutation onUpdateEmployeePassword($unitid: ID!, $password: String!, $logOut: Boolean) {
    updateEmployeePassword(unitid: $unitid, password: $password, logOut: $logOut) {
      id
      passwordlength
      passwordstrength
    }
  }
`;

const IMPERSONATE = gql`
  mutation onImpersonate($unitid: ID!) {
    impersonate(unitid: $unitid)
  }
`;

interface Props {
  user: {
    unitid: any;
    id: number;
    createdate: string;
    lastactive: string;
    passwordlength: number;
    passwordstrength: number;
    banned: boolean;
    suspended: boolean;
    needspasswordchange: boolean;
  };
}

interface Password {
  score: number;
  isValid: boolean;
  password: string;
}

interface State {
  secondRow: boolean;
  passwordPopup: boolean;
  sudoPopup: boolean;
  password: null | Password;
  passwordRepeat: null | Password;
}

class UserSecurityRow extends React.Component<Props, State> {
  state = {
    secondRow: false,
    passwordPopup: false,
    sudoPopup: false,
    password: null,
    passwordRepeat: null
  };

  handlePasswordChange = (name, values) => this.setState({ [name]: values });

  render() {
    const { user } = this.props;
    const { password, passwordRepeat } = this.state;

    return (
      <React.Fragment>
        <tr>
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
              <Mutation
                mutation={FORCE_RESET}
                refetchQueries={[{ query: FETCH_USER_SECURITY_OVERVIEW }]}>
                {(forceReset, { loading }) => (
                  <button
                    disabled={loading}
                    className="naked-button"
                    onClick={() => forceReset({ variables: { userids: [user.id] } })}>
                    <span style={{ color: "#20BAA9FF" }}>Force</span>
                  </button>
                )}
              </Mutation>
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
          <td>
            <IconButton
              icon="cog"
              onClick={() => this.setState(prevState => ({ secondRow: !prevState.secondRow }))}
            />
          </td>
        </tr>

        {this.state.secondRow && (
          <tr>
            <td colSpan={3}>
              <button
                onClick={() => this.setState({ passwordPopup: true })}
                className="naked-button"
                style={{ color: "#20BAA9FF" }}>
                Change Password
              </button>
            </td>

            {this.state.passwordPopup && (
              <Mutation
                mutation={UPDATE_PASSWORD}
                onCompleted={() => this.setState({ passwordPopup: false })}>
                {(updatePassword, { loading, error }) => (
                  <PopupBase small={true} close={() => this.setState({ passwordPopup: false })}>
                    <div className="update-password">
                      <h1>
                        Update Password of <UserName unitid={user.id} />
                      </h1>
                      <div>You can enter a new password for the user here</div>

                      <ReactPasswordStrength
                        className="passwordStrength"
                        minLength={PW_MIN_LENGTH}
                        minScore={2}
                        scoreWords={["too weak", "still too weak", "okay", "good", "strong"]}
                        tooShortWord={"too short"}
                        inputProps={{
                          name: "password_input",
                          autoComplete: "off",
                          placeholder: "New Password",
                          className: "cleanup universalTextInput"
                        }}
                        changeCallback={state => this.handlePasswordChange("password", state)}
                      />

                      <ReactPasswordStrength
                        className="passwordStrength"
                        minLength={PW_MIN_LENGTH}
                        minScore={2}
                        scoreWords={["too weak", "still too weak", "okay", "good", "strong"]}
                        tooShortWord={"too short"}
                        inputProps={{
                          name: "password_input_repeat",
                          autoComplete: "off",
                          placeholder: "Repeat Password",
                          className: "cleanup universalTextInput"
                        }}
                        changeCallback={state => this.handlePasswordChange("passwordRepeat", state)}
                      />

                      {error && <ErrorComp error={error} />}

                      <div
                        style={{
                          opacity:
                            password &&
                            passwordRepeat &&
                            passwordRepeat.password.length >= PW_MIN_LENGTH &&
                            password.password.length != passwordRepeat.password.length
                              ? 1
                              : 0
                        }}
                        className="error-field">
                        Passwords don't match
                      </div>
                    </div>

                    <UniversalButton disabled={loading} closingPopup={true} label="Cancel" />
                    <UniversalButton
                      disabled={
                        !password ||
                        !passwordRepeat ||
                        password.score < 2 ||
                        password.password != passwordRepeat.password ||
                        loading
                      }
                      onClick={() =>
                        updatePassword({
                          variables: { password: password.password, unitid: user.id }
                        })
                      }
                      type="high"
                      label="Update Password"
                    />
                  </PopupBase>
                )}
              </Mutation>
            )}

            <td colSpan={3}>
              <button
                style={{ color: "#20BAA9FF" }}
                onClick={() => this.setState({ sudoPopup: true })}
                className="naked-button">
                Impersonate
              </button>
            </td>

            {this.state.sudoPopup && (
              <Mutation
                mutation={IMPERSONATE}
                onCompleted={async data => {
                  const token = localStorage.getItem("token");
                  localStorage.setItem("token", data.impersonate);
                  localStorage.setItem("impersonator-token", token!);

                  await this.props.history.push("/area/dashboard");
                  this.props.client.cache.reset(); // clear graphql cache

                  location.reload();

                  this.setState({ sudoPopup: false });
                }}>
                {(impersonate, { loading, error }) => (
                  <PopupBase small={true} close={() => this.setState({ sudoPopup: false })}>
                    <h1>
                      Impersonate <UserName unitid={user.id} /> ?
                    </h1>
                    <div>Do you want to login as this user?</div>

                    <ErrorComp
                      error={error}
                      style={{ opacity: error ? 1 : 0 }}
                      className="error-field"
                    />

                    <UniversalButton disabled={loading} closingPopup={true} label="Cancel" />
                    <UniversalButton
                      disabled={loading}
                      onClick={() => impersonate({ variables: { unitid: user.id } })}
                      type="high"
                      label="Impersonate"
                    />
                  </PopupBase>
                )}
              </Mutation>
            )}
          </tr>
        )}
      </React.Fragment>
    );
  }
}

export default withApollo(withRouter(UserSecurityRow));
