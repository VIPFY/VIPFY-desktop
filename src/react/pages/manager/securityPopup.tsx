import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import ResetPassword from "../../popups/universalPopups/resetPassword";
//import Yubikey from "../../popups/universalPopups/Yubikey";
import GoogleAuth from "../../popups/universalPopups/GoogleAuth";
import PopupBase from "../../popups/universalPopups/popupBase";
import { SecurityUser } from "../../interfaces";
import Impersonate from "../../popups/universalPopups/Impersonate";
import PasswordForce from "../../popups/universalPopups/PasswordReset";
import PasswordUpdate from "../../popups/universalPopups/PasswordUpdate";
import TwoFactorForce from "../../popups/universalPopups/TwoFactorForce";
import UserName from "../../components/UserName";
import { Query } from "react-apollo";
import { FETCH_USER_SECURITY_OVERVIEW } from "../../components/security/graphqlOperations";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp } from "../../common/functions";
import { FETCH_SESSIONS } from "../../components/security/graphqlOperations";
import Device from "../../popups/universalPopups/Device";

interface Link {
  header: string;
  text: string;
  state: string;
  button?: string;
}

interface Props {
  closeFunction: Function;
  user: SecurityUser;
  securityPage?: boolean;
}

interface State {
  showPasswordReset: boolean;
  show2FA: boolean;
  showYubikey: boolean;
  showGoogleAuth: boolean;
  showPasswordForce: boolean;
  showPasswordForce4All: boolean;
  showPasswordUpdate: boolean;
  showSudo: boolean;
  showForce2FA: boolean;
  showSessions: boolean;
}

class SecurityPopup extends React.Component<Props, State> {
  state = {
    showPasswordReset: false,
    show2FA: false,
    showYubikey: false,
    showGoogleAuth: false,
    showPasswordForce: false,
    showPasswordForce4All: false,
    showPasswordUpdate: false,
    showSudo: false,
    showForce2FA: false,
    showSessions: false
  };

  backFunction = () => {
    if (this.state.show2FA) {
      this.setState({ show2FA: false });
    } else {
      this.props.closeFunction();
    }
  };

  render() {
    const links: Link[] = [
      {
        header: "Reset Password",
        text:
          "Protect your account using a strong and unique login password that you don’t use for anything else",
        state: "showPasswordReset"
      },
      {
        header: "Two-Factor Authentication",
        text: "Google Authenticator is recommended",
        state: "show2FA"
      },
      {
        header: "Current Devices",
        text: "See with which devices you are currently logged into your account",
        state: "showSessions"
      }
    ];

    if (this.props.securityPage) {
      links.push({
        header: "Force Two-Factor Authentication",
        text: "You can force an employee to use a two-factor authentication to increase security",
        state: "showForce2FA",
        button: "force"
      });

      links.push({
        header: "Force Password Change for All",
        text: "You can force every employee in your company to change their passwords",
        state: "showPasswordForce4All",
        button: "force all"
      });

      links.push({
        header: "Force Password Change",
        text: "You can force your employee to change his password if the current one is too weak",
        state: "showPasswordForce",
        button: "force"
      });

      links.push({
        header: "Update Password",
        text: "You can update your employees password here",
        state: "showPasswordUpdate",
        button: "update"
      });

      links.push({
        header: "Impersonate Account",
        text: "As Admin you can impersonate other accounts",
        state: "showSudo",
        button: "set it up"
      });

      links.reverse();
    }

    return (
      <PopupBase
        styles={{ maxWidth: "656px" }}
        small={true}
        buttonStyles={{ marginTop: "56px" }}
        close={this.props.closeFunction}
        closeable={true}>
        <section className="security-settings">
          <h1>Security Settings</h1>
          <div className="sub-header">
            Change the security settings of <UserName unitid={this.props.user.id} />
          </div>

          <ul>
            {links.map(link => (
              <li key={link.state} onClick={() => this.setState({ [link.state]: true })}>
                <i className="fal fa-key start" />
                <h3>{link.header}</h3>
                <p className="settings-info">{link.text}</p>
                <p className="settings-message" />
                {link.button ? (
                  <UniversalButton className="button-end" type="high" label={link.button} />
                ) : (
                  <i className="fal fa-pen end" />
                )}
              </li>
            ))}
          </ul>

          {this.state.show2FA && (
            <PopupBase
              styles={{ maxWidth: "656px" }}
              small={true}
              buttonStyles={{ marginTop: "56px" }}
              close={this.props.closeFunction}
              closeable={true}>
              <section>
                <h1>Two-Factor Authentication</h1>
                <ul>
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
                      onClick={() => this.setState({ showGoogleAuth: true })}
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

                <UniversalButton
                  type="low"
                  label="back"
                  onClick={() => this.setState({ show2FA: false })}
                />
              </section>
            </PopupBase>
          )}

          {this.state.showPasswordReset && (
            <ResetPassword
              user={this.props.user}
              close={() => this.setState({ showPasswordReset: false })}
            />
          )}

          {/* {this.state.showYubikey && (
            <Yubikey
              user={this.props.user}
              close={() => this.setState({ showGoogleAuth: false })}
            />
          )} */}

          {this.state.showGoogleAuth && (
            <GoogleAuth
              user={this.props.user}
              close={() => this.setState({ showGoogleAuth: false })}
            />
          )}

          {this.state.showPasswordUpdate && (
            <PasswordUpdate
              unitid={this.props.user.id}
              closeFunction={() => this.setState({ showPasswordUpdate: false })}
            />
          )}

          {this.state.showSudo && (
            <Impersonate
              unitid={this.props.user.id}
              closeFunction={() => this.setState({ showSudo: false })}
            />
          )}

          {this.state.showForce2FA && (
            <TwoFactorForce
              unitid={this.props.user.id}
              closeFunction={() => this.setState({ showForce2FA: false })}
            />
          )}

          {this.state.showPasswordForce && (
            <PasswordForce
              unitids={[this.props.user.id]}
              closeFunction={() => this.setState({ showPasswordForce: false })}
            />
          )}

          {this.state.showPasswordForce4All && (
            <Query pollInterval={60 * 10 * 1000 + 7000} query={FETCH_USER_SECURITY_OVERVIEW}>
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
                    unitids={data.fetchUserSecurityOverview.map(user => user.id)}
                    closeFunction={() => this.setState({ showPasswordForce4All: false })}
                  />
                );
              }}
            </Query>
          )}

          {this.state.showSessions && (
            <PopupBase
              styles={{ maxWidth: "656px" }}
              small={true}
              close={() => this.setState({ showSessions: false })}>
              <h1>Current Devices</h1>
              <div className="sub-header">See on which devices you are logged in</div>

              <Query
                query={FETCH_SESSIONS}
                fetchPolicy="network-only"
                variables={{ userid: this.props.user.id }}>
                {({ data, loading, error }) => {
                  if (loading) {
                    return <LoadingDiv text="Fetching data..." />;
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
                        <Device key={session.id} session={session} userid={this.props.user.id} />
                      ))}
                    </div>
                  );
                }}
              </Query>
              <UniversalButton
                type="low"
                label="back"
                onClick={() => this.setState({ showSessions: false })}
              />
            </PopupBase>
          )}
        </section>
        <UniversalButton type="low" label="back" onClick={this.backFunction} />
      </PopupBase>
    );
  }
}

export default SecurityPopup;
