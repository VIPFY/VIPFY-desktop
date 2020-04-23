import * as React from "react";
import gql from "graphql-tag";
import UniversalButton from "../../components/universalButtons/universalButton";
//import Yubikey from "../../popups/universalPopups/Yubikey";
import GoogleAuth from "../../popups/universalPopups/GoogleAuth";
import PopupBase from "../../popups/universalPopups/popupBase";
import Impersonate from "../../popups/universalPopups/Impersonate";
import PasswordForce from "../../popups/universalPopups/PasswordReset";
import PasswordUpdate from "../../popups/universalPopups/PasswordUpdate";
import TwoFactorForce from "../../popups/universalPopups/TwoFactorForce";
import UserName from "../../components/UserName";
import { Query, Mutation } from "react-apollo";
import { FETCH_USER_SECURITY_OVERVIEW } from "../../components/security/graphqlOperations";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp, AppContext } from "../../common/functions";
import { FETCH_SESSIONS } from "../../components/security/graphqlOperations";
import Device from "../../popups/universalPopups/Device";
import TwoFADeactivate from "../../popups/universalPopups/TwoFADeactivate";
import { WorkAround } from "../../interfaces";

const SIGN_OUT_EVERYWHERE = gql`
  mutation onSignOutEverywhere($userid: ID!) {
    signOutEverywhere(userid: $userid)
  }
`;

interface Link {
  header: string;
  text: string;
  state: string;
  button?: string;
}

interface Props {
  closeFunction: Function;
  userid: string;
  securityPage?: boolean;
  id: string;
}

export default (props: Props) => {
  const [show, setShow] = React.useState("");
  const backFunction = () => {
    if (show == "show2FA") {
      setShow("");
    } else {
      props.closeFunction();
    }
  };

  const { securityPage, userid } = props;

  return (
    /*
     * Basically a hack but right now this popup has to be accessible from
     * the profile page as well as the security page. SemiPublicUser does not have
     * all required properties and this query should be in the cache anyway.
     */
    <Query<WorkAround, WorkAround>
      query={FETCH_USER_SECURITY_OVERVIEW}
      variables={userid == props.id ? { userid } : null}>
      {({ data, loading, error }) => {
        if (loading) {
          return <LoadingDiv />;
        }

        if (error || !data) {
          return <ErrorComp error={error} />;
        }

        const user = data.fetchUserSecurityOverview.find(el => el.unitid.id == userid);

        let links: Link[] = [
          {
            header: "Two-Factor Authentication",
            text: `Google Authenticator is recommended${
              securityPage ? ". Set it up for the user." : ""
            }`,
            state: "show2FA"
          },
          {
            header: "Current Devices",
            text: `See with which devices ${
              securityPage ? "the user is" : "you are"
            } currently logged into the account`,
            state: "showSessions"
          },
          {
            header: "Update Password",
            text: "You can update the current password here",
            state: "showPasswordUpdate",
            button: "update"
          }
        ];

        if (securityPage) {
          if (user.twofactormethods.length <= 0) {
            links.push({
              header: "Force Two-Factor Authentication",
              text:
                "You can force an employee to use a two-factor authentication to increase security",
              state: "showForce2FA",
              button: user.needstwofa ? "unforce" : "force"
            });
          } else {
            links[0] = {
              header: "Shut off Two-Factor Authentication",
              text: "Deactivate the users Two-Factor Authentication",
              state: "show2FADeactivate",
              button: "Deactivate"
            };
          }

          links.push({
            header: "Force Password Change for All",
            text: "You can force every employee in your company to change their passwords",
            state: "showPasswordForce4All",
            button: "force all"
          });

          links.push({
            header: "Force Password Change",
            text:
              "You can force your employee to change his password if the current one is too weak",
            state: "showPasswordForce",
            button: "force"
          });

          links.push({
            header: "Impersonate Account",
            text: "As Admin you can impersonate other accounts",
            state: "showSudo",
            button: "Impersonate"
          });

          links.reverse();
        }

        return (
          <PopupBase
            styles={{ maxWidth: "656px" }}
            small={true}
            buttonStyles={{ marginTop: "56px" }}
            close={props.closeFunction}>
            <section className="security-settings">
              <h1>Security Settings</h1>
              <div className="sub-header">
                Change the security settings of <UserName unitid={user.id} />
              </div>

              <ul className="security-settings-list">
                {links.map(link => (
                  <li key={link.state} onClick={() => setShow(link.state)}>
                    <i className="fal fa-key start" />
                    <h3>{link.header}</h3>
                    <p className="settings-info">{link.text}</p>
                    <p className="settings-message" />
                    {link.button ? (
                      <UniversalButton
                        // Workaround so that the button does not use the custom width
                        customStyles={{}}
                        className="button-end"
                        type="high"
                        label={link.button}
                      />
                    ) : (
                      <i className="fal fa-pen end" />
                    )}
                  </li>
                ))}
              </ul>

              {show == "show2FA" && (
                <PopupBase
                  styles={{ maxWidth: "656px" }}
                  small={true}
                  buttonStyles={{ marginTop: "56px", justifyContent: "flex-end" }}
                  close={props.closeFunction}>
                  <h1>Two-Factor Authentication</h1>
                  <ul className="security-settings-list">
                    <li style={{ cursor: "unset" }}>
                      <i className="fal fa-key start" />
                      <h3 style={{ justifySelf: "start" }}>Google Authenticator</h3>
                      <p style={{ textAlign: "start" }} className="settings-info">
                        A mobile App that generates a dynamic 6 digit one time password
                      </p>
                      <p className="settings-message" />
                      <UniversalButton
                        type="high"
                        label="set it up"
                        className="button-end"
                        onClick={() => setShow("showGoogleAuth")}
                      />
                    </li>

                    {/* <li style={{ cursor: "unset" }}>
                    <i className="fal fa-lock-alt start" />
                    <h3>Yubikey</h3>
                    <p className="settings-info">
                      A hardware authentication device that emits one time passwords when tapped or
                      touched
                    </p>
                    <p className="settings-message" />
                    <UniversalButton
                      type="high"
                      label="set it up"
                      className="button-end"
                      onClick={() => this.setState({ showYubikey: true })}
                    />
                  </li> */}
                  </ul>

                  <UniversalButton type="low" label="back" onClick={() => setShow("")} />
                </PopupBase>
              )}

              {/* {this.state.showYubikey && (
            <Yubikey
              user={this.props.user}
              close={() => this.setState({ showGoogleAuth: false })}
            />
          )} */}

              {show == "showGoogleAuth" && <GoogleAuth user={user} close={() => setShow("")} />}

              {show == "showPasswordUpdate" && (
                <PasswordUpdate unitid={user.id} closeFunction={() => setShow("")} />
              )}

              {show == "showSudo" && (
                <Impersonate unitid={user.id} closeFunction={() => setShow("")} />
              )}

              {show == "showForce2FA" && (
                <TwoFactorForce
                  status={user.needstwofa}
                  unitid={user.id}
                  closeFunction={() => setShow("")}
                />
              )}

              {show == "show2FADeactivate" && (
                <TwoFADeactivate unitid={user.id} closeFunction={() => setShow("")} />
              )}

              {show == "showPasswordForce" && (
                <PasswordForce unitids={[user.id]} closeFunction={() => setShow("")} />
              )}

              {show == "showPasswordForce4All" && (
                <Query<WorkAround, WorkAround>
                  pollInterval={60 * 10 * 1000 + 7000}
                  query={FETCH_USER_SECURITY_OVERVIEW}>
                  {({ data, loading, error }) => {
                    if (loading) {
                      return <div>Loading</div>;
                    }

                    if (error) {
                      return <div>Error fetching data</div>;
                    }

                    return (
                      <PasswordForce
                        bulk={true}
                        unitids={data.fetchUserSecurityOverview.map(
                          securityUser => securityUser.id
                        )}
                        closeFunction={() => setShow("")}
                      />
                    );
                  }}
                </Query>
              )}

              {show == "showSessions" && (
                <AppContext.Consumer>
                  {({ logOut }) => (
                    <Mutation<WorkAround, WorkAround> mutation={SIGN_OUT_EVERYWHERE}>
                      {(mutate, { loading, error }) => (
                        <PopupBase
                          buttonStyles={{ justifyContent: "space-between" }}
                          styles={{ maxWidth: "656px" }}
                          small={true}
                          close={() => setShow("")}>
                          <h1>Current Devices</h1>
                          <div className="sub-header">See on which devices you are logged in</div>

                          <Query<WorkAround, WorkAround>
                            query={FETCH_SESSIONS}
                            fetchPolicy="network-only"
                            variables={{ userid: user.id }}>
                            {({ data, loading, error }) => {
                              if (loading) {
                                return <LoadingDiv />;
                              }

                              if (error || !data) {
                                return <ErrorComp error={error} />;
                              }

                              if (data.fetchUsersSessions.length < 1) {
                                return <div>The User has no active Sessions</div>;
                              }

                              return (
                                <div className="devices">
                                  {data.fetchUsersSessions.map(session => (
                                    <Device key={session.id} session={session} userid={user.id} />
                                  ))}
                                </div>
                              );
                            }}
                          </Query>

                          <ErrorComp error={error} />
                          <UniversalButton
                            type="low"
                            disabled={loading}
                            label="Log out everywhere"
                            onClick={() => {
                              mutate({ variables: { userid: user.id } });

                              if (user.id == props.id) {
                                logOut();
                              }
                            }}
                          />

                          <UniversalButton
                            disabled={loading}
                            type="low"
                            label="back"
                            onClick={() => setShow("")}
                          />
                        </PopupBase>
                      )}
                    </Mutation>
                  )}
                </AppContext.Consumer>
              )}
            </section>

            <UniversalButton type="low" label="back" onClick={backFunction} />
          </PopupBase>
        );
      }}
    </Query>
  );
};
